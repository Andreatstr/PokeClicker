import {useState, useEffect, useCallback, useRef} from 'react';
import type {PokedexPokemon} from '@features/pokedex';

interface BattleState {
  playerHP: number;
  opponentHP: number;
  playerMaxHP: number;
  opponentMaxHP: number;
  isActive: boolean;
  result: 'ongoing' | 'victory' | 'defeat';
  clickCount: number;
  totalDamageDealt: number;
}

interface UseBattleProps {
  playerPokemon: PokedexPokemon;
  opponentPokemon: PokedexPokemon;
  onBattleEnd: (result: 'victory' | 'defeat', damageDealt: number) => void;
}

export function useBattle({
  playerPokemon,
  opponentPokemon,
  onBattleEnd,
}: UseBattleProps) {
  const [battleState, setBattleState] = useState<BattleState>(() => {
    // Scale HP to make battles last longer (~15-20 seconds)
    // Opponent gets more HP to last longer
    const scaledPlayerHP = (playerPokemon.stats?.hp || 100) * 30;
    const scaledOpponentHP = (opponentPokemon.stats?.hp || 100) * 40;

    return {
      playerHP: scaledPlayerHP,
      opponentHP: scaledOpponentHP,
      playerMaxHP: scaledPlayerHP,
      opponentMaxHP: scaledOpponentHP,
      isActive: true,
      result: 'ongoing',
      clickCount: 0,
      totalDamageDealt: 0,
    };
  });

  const passiveDamageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate attack speed based on opponent's stats
  // Weak Pokemon (low total stats) attack ~2 times/second (500ms)
  // Strong Pokemon (high total stats) attack ~10 times/second (100ms)
  const getAttackInterval = useCallback(() => {
    const stats = opponentPokemon.stats;
    const totalStats =
      (stats?.hp || 0) +
      (stats?.attack || 0) +
      (stats?.defense || 0) +
      (stats?.spAttack || 0) +
      (stats?.spDefense || 0) +
      (stats?.speed || 0);

    const minInterval = 100;
    const maxInterval = 500; // 2 attacks/second for weakest Pokemon
    const minStats = 200;
    const maxStats = 600;

    const normalizedStats = Math.min(Math.max(totalStats, minStats), maxStats);
    const interval =
      maxInterval -
      ((normalizedStats - minStats) / (maxStats - minStats)) *
        (maxInterval - minInterval);

    return Math.round(interval);
  }, [opponentPokemon]);

  const calculatePassiveDamage = useCallback(() => {
    const opponentAttack = opponentPokemon.stats?.attack || 10;
    const playerDefense = playerPokemon.stats?.defense || 10;

    const baseDamage = Math.max(1, opponentAttack - playerDefense * 0.3);
    return baseDamage * 1.5;
  }, [opponentPokemon, playerPokemon]);

  const calculateClickDamage = useCallback(() => {
    const playerAttack = playerPokemon.stats?.attack || 10;
    const playerSpeed = playerPokemon.stats?.speed || 1;
    const opponentDefense = opponentPokemon.stats?.defense || 10;

    const baseDamage = Math.max(1, playerAttack - opponentDefense * 0.6);
    const speedMultiplier = 1 + playerSpeed * 0.02;
    return baseDamage * speedMultiplier * 0.6;
  }, [playerPokemon, opponentPokemon]);

  const handleAttackClick = useCallback(() => {
    if (battleState.result !== 'ongoing') return;

    const damage = calculateClickDamage();

    setBattleState((prev) => {
      const newOpponentHP = Math.max(0, prev.opponentHP - damage);
      const newTotalDamage = prev.totalDamageDealt + damage;

      return {
        ...prev,
        opponentHP: newOpponentHP,
        clickCount: prev.clickCount + 1,
        totalDamageDealt: newTotalDamage,
        result: newOpponentHP <= 0 ? 'victory' : prev.result,
      };
    });
  }, [battleState.result, calculateClickDamage]);

  useEffect(() => {
    if (battleState.result !== 'ongoing') return;

    const attackInterval = getAttackInterval();

    passiveDamageTimerRef.current = setInterval(() => {
      const damage = calculatePassiveDamage();

      setBattleState((prev) => {
        if (prev.result !== 'ongoing') return prev;

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
  }, [battleState.result, calculatePassiveDamage, getAttackInterval]);

  useEffect(() => {
    if (battleState.result !== 'ongoing') {
      if (passiveDamageTimerRef.current) {
        clearInterval(passiveDamageTimerRef.current);
      }
      onBattleEnd(battleState.result, battleState.totalDamageDealt);
    }
  }, [battleState.result, battleState.totalDamageDealt, onBattleEnd]);

  return {
    playerHP: battleState.playerHP,
    opponentHP: battleState.opponentHP,
    playerMaxHP: battleState.playerMaxHP,
    opponentMaxHP: battleState.opponentMaxHP,
    result: battleState.result,
    clickCount: battleState.clickCount,
    handleAttackClick,
  };
}
