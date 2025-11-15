import {useState, useEffect, useCallback, useRef} from 'react';
import type {PokedexPokemon} from '@features/pokedex';

interface BattleState {
  playerHP: number;
  opponentHP: number;
  playerMaxHP: number;
  opponentMaxHP: number;
  isActive: boolean; // ticking damage active
  result: 'ongoing' | 'victory' | 'defeat';
  clickCount: number;
  totalDamageDealt: number;
  chargeProgress: number; // 0..100
  isCharged: boolean;
  shieldActiveUntil: number; // epoch ms, 0 when inactive
}

interface UseBattleProps {
  playerPokemon: PokedexPokemon;
  opponentPokemon: PokedexPokemon;
  onBattleEnd: (result: 'victory' | 'defeat', damageDealt: number) => void;
}

/**
 * Hook managing Pokemon battle mechanics with real-time combat system
 *
 * Features:
 * - Click-based player attacks with damage calculations based on stats
 * - Passive opponent attacks at intervals based on opponent speed
 * - Charge meter system (builds passively + on click) for special abilities
 * - Special attack: burst damage based on spAttack (4%-30% of opponent max HP)
 * - Shield ability: blocks damage for duration based on spDefense (0.8-3.5s)
 * - Scaled HP values for 30-45 second battles with active clicking
 *
 * Battle mechanics:
 * - Player click damage: (attack - defense*0.4) * (1 + speed*0.05)
 * - Opponent passive damage: (attack - defense*0.3) * 1.2
 * - Opponent attack speed: 100ms-500ms based on total stats
 * - HP scaling: Player 75x, Opponent 162x (1.8x harder for difficulty)
 *
 * @param playerPokemon - Player's Pokemon with stats
 * @param opponentPokemon - Wild Pokemon to battle
 * @param onBattleEnd - Callback when battle concludes with result and damage dealt
 * @returns Battle state and action handlers
 */
export function useBattle({
  playerPokemon,
  opponentPokemon,
  onBattleEnd,
}: UseBattleProps) {
  const [battleState, setBattleState] = useState<BattleState>(() => {
    // Scale HP to make battles last 30-45 seconds with active clicking
    // 3x longer than before, with opponent having 1.8x more HP for difficulty (1.5x * 1.2x)
    const scaledPlayerHP = (playerPokemon.stats?.hp || 100) * 75;
    const scaledOpponentHP = (opponentPokemon.stats?.hp || 100) * 162;

    return {
      playerHP: scaledPlayerHP,
      opponentHP: scaledOpponentHP,
      playerMaxHP: scaledPlayerHP,
      opponentMaxHP: scaledOpponentHP,
      isActive: false, // start paused until "Get Ready" completes
      result: 'ongoing',
      clickCount: 0,
      totalDamageDealt: 0,
      chargeProgress: 0,
      isCharged: false,
      shieldActiveUntil: 0,
    };
  });

  const passiveDamageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  /**
   * Calculate opponent's attack interval based on total stats
   * Weak Pokemon (low total stats) attack ~4 times/second (250ms)
   * Strong Pokemon (high total stats) attack ~10 times/second (100ms)
   * Uses exponential curve for smoother scaling - slow ramp at low stats, faster increase at high stats
   */
  const getAttackInterval = useCallback(() => {
    const stats = opponentPokemon.stats;
    const totalStats =
      (stats?.hp || 0) +
      (stats?.attack || 0) +
      (stats?.defense || 0) +
      (stats?.spAttack || 0) +
      (stats?.spDefense || 0) +
      (stats?.speed || 0);

    const minInterval = 100; // Fast Pokemon: 10 attacks/second
    const maxInterval = 250; // Slow Pokemon: 4 attacks/second
    const minStats = 200;
    const maxStats = 600;

    // Normalize stats to 0-1 range
    const normalizedStats = Math.min(Math.max(totalStats, minStats), maxStats);
    const progress = (normalizedStats - minStats) / (maxStats - minStats);

    // Apply exponential curve (power of 1.5) for non-linear scaling
    // Weak Pokemon increase slowly, strong Pokemon ramp up faster
    const curvedProgress = Math.pow(progress, 1.5);

    const interval = maxInterval - curvedProgress * (maxInterval - minInterval);

    return Math.round(interval);
  }, [opponentPokemon]);

  const calculatePassiveDamage = useCallback(() => {
    const opponentAttack = opponentPokemon.stats?.attack || 10;
    const playerDefense = playerPokemon.stats?.defense || 10;

    // Moderate passive damage - player should survive if actively clicking
    const baseDamage = Math.max(1, opponentAttack - playerDefense * 0.3);
    return baseDamage * 1.2;
  }, [opponentPokemon, playerPokemon]);

  const calculateClickDamage = useCallback(() => {
    const playerAttack = playerPokemon.stats?.attack || 10;
    const playerSpeed = playerPokemon.stats?.speed || 1;
    const opponentDefense = opponentPokemon.stats?.defense || 10;

    // Balanced click damage - player should be able to win with active clicking
    const baseDamage = Math.max(2, playerAttack - opponentDefense * 0.4);
    // Speed provides slight boost: 1 + (speed × 0.05)
    const speedMultiplier = 1 + playerSpeed * 0.05;
    return baseDamage * speedMultiplier;
  }, [playerPokemon, opponentPokemon]);

  const handleAttackClick = useCallback(() => {
    const damage = calculateClickDamage();

    setBattleState((prev) => {
      // Only block if battle has ended, allow attacks during countdown
      if (prev.result !== 'ongoing' || !prev.isActive) {
        return prev;
      }

      const newOpponentHP = Math.max(0, prev.opponentHP - damage);
      const newTotalDamage = prev.totalDamageDealt + damage;
      const newCharge = Math.min(100, prev.chargeProgress + 2);

      return {
        ...prev,
        opponentHP: newOpponentHP,
        clickCount: prev.clickCount + 1,
        totalDamageDealt: newTotalDamage,
        chargeProgress: newCharge,
        isCharged: prev.isCharged || newCharge >= 100,
        result: newOpponentHP <= 0 ? 'victory' : prev.result,
      };
    });
  }, [calculateClickDamage]);

  // Passive charge meter buildup over time (2.5% per second + 2% per click)
  useEffect(() => {
    if (battleState.result !== 'ongoing' || !battleState.isActive) return;

    const tickMs = 200; // 5 ticks/sec
    const perTick = 0.5; // 0.5% per tick => 2.5%/sec (reaches 100% in 40s without clicking)
    const timer = setInterval(() => {
      setBattleState((prev) => {
        if (prev.result !== 'ongoing' || prev.isCharged) return prev;
        const next = Math.min(100, prev.chargeProgress + perTick);
        return next === prev.chargeProgress
          ? prev
          : {
              ...prev,
              chargeProgress: next,
              isCharged: next >= 100,
            };
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [battleState.result, battleState.isActive]);

  // Opponent's passive damage timer - attacks player at intervals based on stats
  useEffect(() => {
    if (battleState.result !== 'ongoing' || !battleState.isActive) return;

    const attackInterval = getAttackInterval();

    passiveDamageTimerRef.current = setInterval(() => {
      const damage = calculatePassiveDamage();

      setBattleState((prev) => {
        if (prev.result !== 'ongoing') return prev;

        // Shield blocks all incoming damage until expiration
        if (prev.shieldActiveUntil && Date.now() < prev.shieldActiveUntil) {
          return prev;
        }

        const newPlayerHP = Math.max(0, prev.playerHP - damage);

        return {
          ...prev,
          playerHP: newPlayerHP,
          result: newPlayerHP <= 0 ? 'defeat' : prev.result,
        };
      });
    }, attackInterval);

    return () => {
      if (passiveDamageTimerRef.current) {
        clearInterval(passiveDamageTimerRef.current);
      }
    };
  }, [
    battleState.result,
    battleState.isActive,
    calculatePassiveDamage,
    getAttackInterval,
  ]);

  useEffect(() => {
    if (battleState.result !== 'ongoing') {
      if (passiveDamageTimerRef.current) {
        clearInterval(passiveDamageTimerRef.current);
      }
      onBattleEnd(battleState.result, battleState.totalDamageDealt);
    }
  }, [battleState.result, battleState.totalDamageDealt, onBattleEnd]);

  const startBattle = useCallback(() => {
    setBattleState((prev) => ({
      ...prev,
      isActive: true,
    }));
  }, []);

  /**
   * Trigger special attack ability when charge meter is full
   * Deals burst damage based on player's spAttack stat (4%-30% of opponent's max HP)
   * Consumes full charge meter
   */
  const triggerSpecialAttack = useCallback(() => {
    setBattleState((prev) => {
      if (prev.result !== 'ongoing' || !prev.isCharged) return prev;
      const spA = playerPokemon.stats?.spAttack || 0;
      const scale = Math.min(0.3, 0.04 + spA / 2500); // 4%..30% (2x damage)
      const burst = Math.max(1, Math.floor(prev.opponentMaxHP * scale));
      const newOpp = Math.max(0, prev.opponentHP - burst);
      return {
        ...prev,
        opponentHP: newOpp,
        totalDamageDealt: prev.totalDamageDealt + burst,
        result: newOpp <= 0 ? 'victory' : prev.result,
        chargeProgress: 0,
        isCharged: false,
      };
    });
  }, [playerPokemon]);

  /**
   * Trigger shield ability when charge meter is full
   * Blocks all incoming damage for duration based on player's spDefense (0.8-3.5s)
   * Consumes full charge meter
   */
  const triggerShield = useCallback(() => {
    setBattleState((prev) => {
      if (prev.result !== 'ongoing' || !prev.isCharged) return prev;
      const spD = playerPokemon.stats?.spDefense || 0;
      // Toned down: shorter base and gentler scaling with a tighter cap
      // Old: Math.min(6000, 1500 + spD * 20)
      const duration = Math.min(3500, 800 + spD * 10); // cap 3.5s
      const until = Date.now() + duration;
      return {
        ...prev,
        shieldActiveUntil: until,
        chargeProgress: 0,
        isCharged: false,
      };
    });
  }, [playerPokemon]);

  return {
    playerHP: battleState.playerHP,
    opponentHP: battleState.opponentHP,
    playerMaxHP: battleState.playerMaxHP,
    opponentMaxHP: battleState.opponentMaxHP,
    result: battleState.result,
    clickCount: battleState.clickCount,
    handleAttackClick,
    chargeProgress: battleState.chargeProgress,
    isCharged: battleState.isCharged,
    shieldActiveUntil: battleState.shieldActiveUntil,
    triggerSpecialAttack,
    triggerShield,
    isActive: battleState.isActive,
    startBattle,
  };
}
