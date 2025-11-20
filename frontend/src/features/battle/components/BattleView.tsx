/**
 * Pokemon battle view with turn-based combat mechanics.
 *
 * Features:
 * - Click-based attack system (player clicks to deal damage)
 * - Charge meter fills with clicks, enables special attack
 * - Special Defense ability to reduce incoming damage
 * - Responsive battle animations and visual feedback
 * - Platform sprites based on Pokemon type
 * - Victory rewards: rare candy based on clicks and opponent stats
 * - Candy auto-awarded once per battle on victory
 *
 * Battle mechanics:
 * - Player attacks on click based on their Pokemon's attack stat
 * - Opponent auto-attacks at intervals based on speed stat
 * - Charge attack: deals 3x damage when meter full
 * - Special Defense: reduces damage by 75% temporarily
 *
 * State management:
 * - useBattle hook manages HP, attacks, and win/loss detection
 * - Candy calculations use player stats and click count
 * - Awards added to global candy context (auto-syncs to backend)
 *
 * Integration:
 * - Accepts attack function callback for external controls (map keyboard)
 * - Fullscreen mode support for map integration
 * - Mobile-responsive layout
 */
import {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import type {PokedexPokemon} from '@features/pokedex';
import {useAuth} from '@features/auth/hooks/useAuth';
import {useCandyContext} from '@/contexts/useCandyContext';
import {useMobileDetection} from '@/hooks';
import {HealthBar} from './HealthBar';
import {BattleResult} from './BattleResult';
import {useBattle} from '../hooks/useBattle';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {getPlatformImage} from '../utils/platformMapping';
import {toDecimal} from '@/lib/decimal';

interface BattleViewProps {
  playerPokemon: PokedexPokemon;
  opponentPokemon: PokedexPokemon;
  onBattleComplete: () => void;
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
  isDarkMode?: boolean;
  onAttackFunctionReady?: (attackFunction: () => void) => void;
  onSpecialAttackFunctionReady?: (fn: () => void) => void;
  onSpecialDefenseFunctionReady?: (fn: () => void) => void;
  isFullscreen?: boolean;
}

export function BattleView({
  playerPokemon,
  opponentPokemon,
  onBattleComplete,
  onBattleEnd,
  isDarkMode = false,
  onAttackFunctionReady,
  onSpecialAttackFunctionReady,
  onSpecialDefenseFunctionReady,
  isFullscreen = false,
}: BattleViewProps) {
  const {user} = useAuth();
  const {addCandy} = useCandyContext();
  const isMobile = useMobileDetection(768);
  const [showResult, setShowResult] = useState(false);

  // Capitalize first letter of Pokemon names
  const capitalizeName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(
    null
  );
  const [finalClickCount, setFinalClickCount] = useState(0);
  const [candyAwarded, setCandyAwarded] = useState(false);

  // Animation states
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  const [specialDefenseActive, setSpecialDefenseActive] = useState(false);
  const [specialAttackActive, setSpecialAttackActive] = useState(false);
  const [hitEffects, setHitEffects] = useState<
    Array<{id: number; damage: string; x: number; y: number}>
  >([]);

  const {
    playerHP,
    opponentHP,
    playerMaxHP,
    opponentMaxHP,
    result,
    clickCount,
    handleAttackClick,
    chargeProgress,
    isCharged,
    triggerSpecialAttack,
    specialDefenseCharge,
    isSpecialDefenseCharged,
    triggerSpecialDefense,
    isActive,
    startBattle,
  } = useBattle({
    playerPokemon,
    opponentPokemon,
    onBattleEnd: (result) => {
      setBattleResult(result);
      setFinalClickCount(clickCount);
      setShowResult(true);
    },
  });

  // Wrap handleAttackClick to trigger animations
  const handleAttackWithAnimation = () => {
    // Don't trigger animations during countdown period
    if (!isActive) {
      handleAttackClick();
      return;
    }

    // Only trigger new animation if not already animating (prevent animation reset)
    if (!playerAttacking) {
      setPlayerAttacking(true);
      setTimeout(() => setPlayerAttacking(false), 200);
    }

    // Trigger opponent hit animation (shake) - only if not already shaking
    if (!opponentHit) {
      setOpponentHit(true);
      setTimeout(() => setOpponentHit(false), 300);
    }

    // Calculate damage and show hit effect using same formula as useBattle.ts (lines 119-129)
    const playerStats = playerPokemon.stats;
    const opponentStats = opponentPokemon.stats;
    if (playerStats && opponentStats) {
      const baseDamage =
        (playerStats.attack - opponentStats.defense * 0.4) *
        (1 + playerStats.speed * 0.05);
      const damage = Math.max(2, Math.floor(baseDamage));

      // Create hit effect at randomized position above opponent
      const hitId = Date.now();
      // Randomize position above opponent (right side of screen, above sprite)
      const baseX = 75; // More to the right (opponent is on right side)
      const baseY = 10; // Above opponent sprite (higher up)
      const randomX = baseX + (Math.random() * 15 - 7.5); // ±7.5% variance horizontally
      const randomY = baseY + Math.random() * 10; // 0-10% variance vertically (only downward)

      setHitEffects((prev) => [
        ...prev,
        {
          id: hitId,
          damage: damage.toString(),
          x: randomX,
          y: randomY,
        },
      ]);

      // Remove hit effect after animation
      setTimeout(() => {
        setHitEffects((prev) => prev.filter((effect) => effect.id !== hitId));
      }, 800);
    }

    // Call the actual attack handler
    handleAttackClick();
  };

  // Wrap specialDefense trigger with animation
  const handleSpecialDefenseWithAnimation = useCallback(() => {
    // Don't trigger animations during countdown period
    if (!isActive) {
      triggerSpecialDefense();
      return;
    }

    if (!isSpecialDefenseCharged) return;

    setSpecialDefenseActive(true);
    triggerSpecialDefense();
    // Special Defense animation lasts 2 seconds
    setTimeout(() => setSpecialDefenseActive(false), 2000);
  }, [isActive, isSpecialDefenseCharged, triggerSpecialDefense]);

  useEffect(() => {
    if (onSpecialDefenseFunctionReady) {
      onSpecialDefenseFunctionReady(handleSpecialDefenseWithAnimation);
    }
  }, [onSpecialDefenseFunctionReady, handleSpecialDefenseWithAnimation]);

  // Wrap special attack trigger with animation
  const handleSpecialAttackWithAnimation = useCallback(() => {
    // Don't trigger animations during countdown period
    if (!isActive) {
      triggerSpecialAttack();
      return;
    }

    // Don't trigger if not charged
    if (!isCharged) return;

    setSpecialAttackActive(true);
    triggerSpecialAttack();

    // Calculate special attack damage using same formula as useBattle.ts (lines 239-244)
    // Deals 4%-30% of opponent's max HP based on player's spAttack stat
    const playerStats = playerPokemon.stats;
    if (playerStats && opponentMaxHP) {
      const spA = playerStats.spAttack || 0;
      const scale = Math.min(0.3, 0.04 + spA / 2500); // 4%..30%
      const burst = Math.max(1, Math.floor(opponentMaxHP * scale));

      // Create hit effect at randomized position above opponent
      const hitId = Date.now();
      const baseX = 75; // Opponent position
      const baseY = 10; // Above opponent sprite
      const randomX = baseX + (Math.random() * 15 - 7.5); // ±7.5% variance
      const randomY = baseY + Math.random() * 10; // 0-10% variance vertically

      setHitEffects((prev) => [
        ...prev,
        {id: hitId, damage: burst.toString(), x: randomX, y: randomY},
      ]);

      setTimeout(() => {
        setHitEffects((prev) => prev.filter((effect) => effect.id !== hitId));
      }, 800);
    }

    // Special Attack animation lasts 600ms
    setTimeout(() => setSpecialAttackActive(false), 600);
  }, [isActive, isCharged, triggerSpecialAttack, playerPokemon, opponentMaxHP]);

  useEffect(() => {
    if (onSpecialAttackFunctionReady) {
      onSpecialAttackFunctionReady(handleSpecialAttackWithAnimation);
    }
  }, [onSpecialAttackFunctionReady, handleSpecialAttackWithAnimation]);

  // Keep attack function ref up to date so the wrapper always calls the latest version
  const attackFunctionRef = useRef(handleAttackWithAnimation);
  attackFunctionRef.current = handleAttackWithAnimation;

  // Create stable wrapper function that won't change between renders
  const attackWrapperRef = useRef<(() => void) | null>(null);
  if (!attackWrapperRef.current) {
    attackWrapperRef.current = () => {
      if (attackFunctionRef.current) {
        attackFunctionRef.current();
      }
    };
  }

  // Expose attack function to parent component on mount
  useEffect(() => {
    if (onAttackFunctionReady && attackWrapperRef.current) {
      onAttackFunctionReady(attackWrapperRef.current);
    }
  }, [onAttackFunctionReady]);

  // Calculate rare candy reward - memoized to prevent recalculation when user state updates
  const rareCandyReward = useMemo(() => {
    const candyPerClick = user?.stats
      ? calculateCandyPerClick(user.stats, user.owned_pokemon_ids?.length || 0)
      : '1';

    // New reward formula: (clicks × candyPerClick × 2) + (opponent price / 4)
    const clickReward = toDecimal(finalClickCount)
      .times(candyPerClick)
      .times(2);

    const opponentPrice = opponentPokemon.price
      ? toDecimal(opponentPokemon.price)
      : toDecimal(0);
    const priceBonus = opponentPrice.dividedBy(4);

    const battleReward = clickReward.plus(priceBonus);
    return battleReward.floor().toString();
  }, [
    finalClickCount,
    opponentPokemon.price,
    user?.stats,
    user?.owned_pokemon_ids?.length,
  ]);

  // Ready countdown state
  const [readyCount, setReadyCount] = useState(3);

  useEffect(() => {
    // Begin a short countdown then start the battle
    if (result !== 'ongoing') return;
    if (isActive) return; // already started

    setReadyCount(3);
    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      setReadyCount(count);
      if (count <= 0) {
        clearInterval(timer);
        startBattle();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [result, isActive, startBattle]);

  // Auto-award candy when battle is won and trigger immediate battle end callback
  useEffect(() => {
    if (
      battleResult === 'victory' &&
      toDecimal(rareCandyReward).gt(0) &&
      !candyAwarded
    ) {
      // Award candy immediately to global context (will auto-sync to backend)
      addCandy(rareCandyReward);
      setCandyAwarded(true);

      // Trigger immediate battle end callback (removes Pokemon from map)
      onBattleEnd?.(battleResult);
    }
  }, [battleResult, rareCandyReward, candyAwarded, addCandy, onBattleEnd]);

  type LayoutPosition = {
    width: string;
    maxWidth?: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    aspectRatio?: string;
    translateX?: string;
    translateY?: string;
    extraTransform?: string;
  };

  type LayoutConfig = {
    opponentPlatform: LayoutPosition;
    opponentSprite: LayoutPosition;
    opponentHealth: LayoutPosition;
    playerPlatform: LayoutPosition;
    playerSprite: LayoutPosition;
    playerHealth: LayoutPosition;
  };

  const layoutConfig = useMemo<LayoutConfig>(() => {
    if (isFullscreen) {
      if (isMobile) {
        return {
          opponentPlatform: {
            width: '42%',
            maxWidth: '240px',
            top: '25%',
            right: '6%',
            aspectRatio: '7 / 3',
          },
          opponentSprite: {
            width: '20%',
            maxWidth: '200px',
            top: '19%',
            right: '16%',
          },
          opponentHealth: {
            width: '40%',
            maxWidth: '260px',
            top: '22%',
            left: '30%',
            translateX: '-50%',
          },
          playerPlatform: {
            width: '60%',
            maxWidth: '340px',
            bottom: '1%',
            left: '5%',
            aspectRatio: '7 / 3',
          },
          playerSprite: {
            width: '30%',
            maxWidth: '240px',
            bottom: '6%',
            left: '20%',
            extraTransform: 'scaleX(-1)',
          },
          playerHealth: {
            width: '40%',
            maxWidth: '280px',
            bottom: '14%',
            left: '75%',
            translateX: '-50%',
          },
        };
      }

      return {
        opponentPlatform: {
          width: '40%',
          maxWidth: '400px',
          top: '20%',
          right: '5%',
          aspectRatio: '7 / 3',
        },
        opponentSprite: {
          width: '16%',
          maxWidth: '150px',
          top: '13%',
          right: '14%',
        },
        opponentHealth: {
          width: '32%',
          maxWidth: '460px',
          top: '20%',
          right: '30%',
        },
        playerPlatform: {
          width: '40%',
          maxWidth: '620px',
          bottom: '5%',
          left: '3%',
          aspectRatio: '7 / 3',
        },
        playerSprite: {
          width: '16%',
          maxWidth: '250px',
          bottom: '14%',
          left: '13%',
          extraTransform: 'scaleX(-1)',
        },
        playerHealth: {
          width: '32%',
          maxWidth: '460px',
          bottom: '28%',
          left: '44%',
        },
      };
    }

    if (isMobile) {
      return {
        opponentPlatform: {
          width: '50%',
          maxWidth: '220px',
          top: '20%',
          right: '4%',
          aspectRatio: '7 / 3',
        },
        opponentSprite: {
          width: '25%',
          maxWidth: '180px',
          top: '14%',
          right: '17%',
        },
        opponentHealth: {
          width: '40%',
          maxWidth: '260px',
          top: '20%',
          left: '30%',
          translateX: '-50%',
        },
        playerPlatform: {
          width: '60%',
          maxWidth: '300px',
          bottom: '0%',
          left: '0%',
          aspectRatio: '7 / 3',
        },
        playerSprite: {
          width: '30%',
          maxWidth: '220px',
          bottom: '3%',
          left: '13%',
          extraTransform: 'scaleX(-1)',
        },
        playerHealth: {
          width: '40%',
          maxWidth: '260px',
          bottom: '10%',
          left: '75%',
          translateX: '-50%',
        },
      };
    }

    return {
      opponentPlatform: {
        width: '30%',
        maxWidth: '280px',
        top: '20%',
        right: '7%',
        aspectRatio: '7 / 3',
      },
      opponentSprite: {
        width: '10%',
        maxWidth: '220px',
        top: '19%',
        right: '17%',
      },
      opponentHealth: {
        width: '22%',
        maxWidth: '240px',
        top: '15%',
        right: '32%',
      },
      playerPlatform: {
        width: '40%',
        maxWidth: '380px',
        bottom: '2%',
        left: '2%',
        aspectRatio: '7 / 3',
      },
      playerSprite: {
        width: '18%',
        maxWidth: '280px',
        bottom: '8%',
        left: '12%',
        extraTransform: 'scaleX(-1)',
      },
      playerHealth: {
        width: '24%',
        maxWidth: '260px',
        bottom: '18%',
        left: '42%',
      },
    };
  }, [isFullscreen, isMobile]);

  const createPositionStyle = useMemo(
    () =>
      (config: LayoutPosition): React.CSSProperties => {
        const transforms: string[] = [];
        if (config.translateX)
          transforms.push(`translateX(${config.translateX})`);
        if (config.translateY)
          transforms.push(`translateY(${config.translateY})`);
        if (config.extraTransform) transforms.push(config.extraTransform);

        return {
          width: config.width,
          maxWidth: config.maxWidth,
          top: config.top,
          bottom: config.bottom,
          left: config.left,
          right: config.right,
          aspectRatio: config.aspectRatio,
          transform: transforms.length ? transforms.join(' ') : undefined,
        };
      },
    []
  );

  if (showResult && battleResult) {
    return (
      <BattleResult
        result={battleResult}
        opponentPokemon={opponentPokemon}
        clickCount={finalClickCount}
        rareCandyReward={rareCandyReward}
        onContinue={onBattleComplete}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <main
      className="relative w-full h-full flex flex-col cursor-pointer select-none"
      aria-label="Battle arena"
      style={{
        pointerEvents: !isActive ? 'none' : 'auto',
        background: isDarkMode
          ? `
          linear-gradient(0deg, #064e3b 0%, #065f46 20%, #047857 40%, #065f46 60%, #064e3b 80%, #022c22 100%),
          linear-gradient(0deg, #022c22 0%, #064e3b 15%, #065f46 30%, #059669 45%, #065f46 60%, #064e3b 75%, #022c22 90%, #012117 100%),
          linear-gradient(0deg, #012117 0%, #022c22 10%, #064e3b 25%, #065f46 40%, #047857 55%, #065f46 70%, #064e3b 85%, #022c22 100%),
          linear-gradient(0deg, #0f172a 0%, #064e3b 20%, #065f46 40%, #047857 60%, #065f46 80%, #064e3b 100%),
          linear-gradient(0deg, #022c22 0%, #064e3b 25%, #059669 50%, #064e3b 75%, #022c22 100%),
          linear-gradient(0deg, #065f46 0%, #047857 30%, #10b981 50%, #047857 70%, #065f46 100%)
        `
          : `
          linear-gradient(0deg, #f0fdf4 0%, #dcfce7 15%, #bbf7d0 30%, #86efac 45%, #bbf7d0 60%, #dcfce7 75%, #f0fdf4 100%),
          linear-gradient(0deg, #dcfce7 0%, #bbf7d0 20%, #86efac 40%, #4ade80 60%, #86efac 80%, #bbf7d0 100%),
          linear-gradient(0deg, #bbf7d0 0%, #86efac 15%, #4ade80 30%, #22c55e 50%, #4ade80 70%, #86efac 85%, #bbf7d0 100%),
          linear-gradient(0deg, #ecfdf5 0%, #d1fae5 20%, #a7f3d0 40%, #6ee7b7 60%, #a7f3d0 80%, #d1fae5 100%),
          linear-gradient(0deg, #86efac 0%, #4ade80 25%, #22c55e 50%, #4ade80 75%, #86efac 100%),
          linear-gradient(0deg, #d1fae5 0%, #a7f3d0 20%, #6ee7b7 40%, #34d399 60%, #6ee7b7 80%, #a7f3d0 100%)
        `,
      }}
      onClick={handleAttackWithAnimation}
    >
      <img
        src={getPlatformImage(opponentPokemon.types)}
        alt="Opponent platform"
        className="absolute object-contain pointer-events-none z-0"
        loading="lazy"
        decoding="async"
        style={{
          ...createPositionStyle(layoutConfig.opponentPlatform),
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          objectFit: 'contain',
        }}
        aria-hidden="true"
      />
      {/* Opponent Pokemon sprite */}
      <img
        src={opponentPokemon.sprite}
        alt={capitalizeName(opponentPokemon.name)}
        className="absolute image-pixelated pointer-events-none z-10"
        decoding="async"
        style={{
          imageRendering: 'pixelated',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          ...createPositionStyle(layoutConfig.opponentSprite),
          animation: opponentHit ? 'shake 0.3s ease-in-out' : 'none',
        }}
        aria-label={`Opponent: ${capitalizeName(opponentPokemon.name)}`}
      />
      {/* Special Attack visual effect */}
      {specialAttackActive && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            ...createPositionStyle(layoutConfig.opponentSprite),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="text-6xl md:text-8xl"
            style={{
              animation: 'specialAttackBurst 0.6s ease-out',
              filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 1))',
            }}
          >
            ⚡
          </div>
        </div>
      )}
      {/* Opponent health bar */}
      <aside
        className="absolute z-10"
        role="status"
        aria-live="polite"
        style={createPositionStyle(layoutConfig.opponentHealth)}
      >
        <HealthBar
          current={opponentHP}
          max={opponentMaxHP}
          label={capitalizeName(opponentPokemon.name)}
          side="opponent"
          isDarkMode={isDarkMode}
        />
      </aside>

      {/* Player Pokemon (bottom left) - absolute positioned overlay */}
      {/* Player platform */}
      <img
        src={getPlatformImage(playerPokemon.types)}
        alt="Player platform"
        className="absolute object-contain pointer-events-none z-0"
        loading="lazy"
        decoding="async"
        style={{
          ...createPositionStyle(layoutConfig.playerPlatform),
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          objectFit: 'contain',
        }}
        aria-hidden="true"
      />
      {/* Player Pokemon sprite */}
      <div
        className="absolute z-10"
        style={{
          ...(() => {
            const style = createPositionStyle(layoutConfig.playerSprite);
            // Remove scaleX from transform and apply it to inner img instead
            const transformWithoutScale = style.transform
              ?.replace(/scaleX\([^)]*\)\s*/g, '')
              .trim();
            return {
              ...style,
              transform: transformWithoutScale || undefined,
            };
          })(),
          animation: playerAttacking ? 'bounce 0.2s ease-in-out' : 'none',
        }}
      >
        <img
          src={playerPokemon.sprite}
          alt={capitalizeName(playerPokemon.name)}
          className="image-pixelated"
          decoding="async"
          style={{
            imageRendering: 'pixelated',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)',
          }}
          aria-label={`Click to attack with ${capitalizeName(playerPokemon.name)}`}
        />
      </div>
      {/* Special Defense visual effect */}
      {specialDefenseActive && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            ...createPositionStyle(layoutConfig.playerSprite),
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            transform:
              `${createPositionStyle(layoutConfig.playerSprite).transform || ''} translateY(-30%)`.trim(),
          }}
        >
          <div
            className="text-6xl md:text-8xl"
            style={{
              animation: 'specialDefensePulse 2s ease-in-out',
              filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))',
            }}
          >
            🛡️
          </div>
        </div>
      )}
      {/* Player health bar */}
      <aside
        className="absolute z-10"
        role="status"
        aria-live="polite"
        style={createPositionStyle(layoutConfig.playerHealth)}
      >
        <HealthBar
          current={playerHP}
          max={playerMaxHP}
          label={capitalizeName(playerPokemon.name)}
          side="player"
          isDarkMode={isDarkMode}
        />
      </aside>

      {/* Run Button - top left corner, below fullscreen */}
      {result === 'ongoing' && isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBattleComplete();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBattleComplete();
          }}
          className="absolute top-11 md:top-12 left-2 z-30 flex cursor-pointer items-center gap-1 active:bg-red-700 border-2 border-black px-2 py-1 touch-manipulation"
          title="Run from battle"
          aria-label="Run from battle"
          style={{
            WebkitTapHighlightColor: 'transparent',
            backgroundColor: '#b91c1c',
            boxShadow: '4px 4px 0px rgba(0,0,0,1)',
            transform: 'translate(0, 0)',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px rgba(0,0,0,1)';
            e.currentTarget.style.backgroundColor = '#991b1b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,1)';
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
        >
          <svg
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4 h-4 text-white"
          >
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
          <span className="pixel-font text-xs font-bold text-white">RUN</span>
        </button>
      )}

      {/* Attack instructions - centered in the middle */}
      {result === 'ongoing' && (
        <aside
          className="absolute top-11/20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
          aria-live="polite"
          role="status"
        >
          <p
            className={`pixel-font text-xs px-3 py-1 rounded ${
              isDarkMode
                ? 'text-gray-300 bg-black/50'
                : 'text-white bg-black/70'
            }`}
          >
            <span className="md:hidden">Tap anywhere to attack!</span>
            <span className="hidden md:inline">Click anywhere to attack!</span>
          </p>
        </aside>
      )}

      {/* Get Ready Overlay */}
      {result === 'ongoing' && !isActive && (
        <aside
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className={`pixel-font text-center ${isDarkMode ? 'text-white' : 'text-white'}`}
          >
            <p className="text-lg md:text-2xl mb-2">Get Ready!</p>
            <p className="text-sm md:text-base opacity-90 mb-4">
              Tap to attack, charge to unleash specials
            </p>
            <p className="text-3xl md:text-5xl font-bold">
              {readyCount > 0 ? readyCount : 'Go!'}
            </p>
          </div>
        </aside>
      )}

      {/* Charged Attacks UI - positioned to avoid Pokemon overlap */}
      {result === 'ongoing' && (
        <section
          className="absolute bottom-1 right-1 md:bottom-4 md:right-4 z-20 flex flex-col md:flex-row gap-1 md:gap-3 items-end"
          aria-label="Special attacks"
        >
          {/* Buttons with visual charge progress - stacked vertically on mobile, horizontal on desktop */}
          <nav
            className="flex gap-1 md:gap-3"
            aria-label="Battle special moves"
          >
            <button
              className={`relative px-1 py-0.5 md:px-3 md:py-2 pixel-font text-[9px] md:text-xs cursor-pointer border-2 rounded shadow-[2px_2px_0_rgba(0,0,0,1)] overflow-hidden transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300 text-black border-black'
              } ${!isCharged ? 'cursor-not-allowed' : ''} ${
                isCharged
                  ? 'ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/50'
                  : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isCharged) handleSpecialAttackWithAnimation();
              }}
              disabled={!isCharged}
              tabIndex={0}
              aria-label="Special attack ability"
            >
              {/* Charge progress bar with glow effect */}
              <div
                className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-t from-purple-900 via-purple-600 to-purple-400'
                    : 'bg-gradient-to-t from-purple-800 via-purple-500 to-purple-300'
                } ${isCharged ? 'shadow-lg shadow-purple-500/50' : ''}`}
                style={{height: `${chargeProgress}%`}}
                role="progressbar"
                aria-valuenow={chargeProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-hidden="true"
              />
              <span
                className={`relative z-10 font-bold transition-colors duration-300 ${
                  isDarkMode
                    ? !isCharged
                      ? 'text-gray-300'
                      : 'text-white drop-shadow-lg'
                    : !isCharged
                      ? 'text-gray-700'
                      : 'text-black drop-shadow-lg'
                }`}
              >
                <span className="md:hidden">Sp.Atk</span>
                <span className="hidden md:inline">Special Attack</span>
              </span>
            </button>
            <button
              className={`relative px-1 py-0.5 md:px-3 md:py-2 pixel-font text-[9px] md:text-xs cursor-pointer border-2 rounded shadow-[2px_2px_0_rgba(0,0,0,1)] overflow-hidden transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300 text-black border-black'
              } ${!isSpecialDefenseCharged ? 'cursor-not-allowed' : ''} ${
                isSpecialDefenseCharged
                  ? 'ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/50'
                  : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isSpecialDefenseCharged)
                  handleSpecialDefenseWithAnimation();
              }}
              disabled={!isSpecialDefenseCharged}
              tabIndex={0}
              aria-label="Special defense ability to reduce incoming damage"
            >
              {/* Charge progress bar with glow effect */}
              <div
                className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-t from-blue-900 via-blue-600 to-blue-400'
                    : 'bg-gradient-to-t from-blue-800 via-blue-500 to-blue-300'
                } ${isSpecialDefenseCharged ? 'shadow-lg shadow-blue-500/50' : ''}`}
                style={{height: `${specialDefenseCharge}%`}}
                role="progressbar"
                aria-valuenow={specialDefenseCharge}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-hidden="true"
              />
              <span
                className={`relative z-10 font-bold transition-colors duration-300 ${
                  isDarkMode
                    ? !isSpecialDefenseCharged
                      ? 'text-gray-300'
                      : 'text-white drop-shadow-lg'
                    : !isSpecialDefenseCharged
                      ? 'text-gray-700'
                      : 'text-black drop-shadow-lg'
                }`}
              >
                <span className="md:hidden">Sp.Def</span>
                <span className="hidden md:inline">Special Defense</span>
              </span>
            </button>
          </nav>
        </section>
      )}

      {/* Hit effect damage numbers */}
      {hitEffects.map((effect) => (
        <div
          key={effect.id}
          className="absolute z-40 pixel-font text-lg md:text-xl font-bold text-white pointer-events-none"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            animation: 'hitEffect 0.8s ease-out forwards',
            textShadow:
              '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 8px rgba(255,255,255,0.8)',
          }}
        >
          -{effect.damage}
        </div>
      ))}

      {/* CSS Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes hitEffect {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1.3);
          }
        }

        @keyframes specialDefensePulse {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.8;
            transform: scale(1);
          }
          80% {
            opacity: 0.6;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }

        @keyframes specialAttackBurst {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(0deg);
          }
          30% {
            opacity: 1;
            transform: scale(1.5) rotate(90deg);
          }
          60% {
            opacity: 0.8;
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(2) rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
