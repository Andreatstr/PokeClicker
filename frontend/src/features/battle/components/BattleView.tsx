/**
 * Pokemon battle view with turn-based combat mechanics.
 *
 * Features:
 * - Click-based attack system (player clicks to deal damage)
 * - Charge meter fills with clicks, enables special attack
 * - Shield ability to reduce incoming damage
 * - Responsive battle animations and visual feedback
 * - Platform sprites based on Pokemon type
 * - Victory rewards: rare candy based on clicks and opponent stats
 * - Candy auto-awarded once per battle on victory
 *
 * Battle mechanics:
 * - Player attacks on click based on their Pokemon's attack stat
 * - Opponent auto-attacks at intervals based on speed stat
 * - Charge attack: deals 3x damage when meter full
 * - Shield: reduces damage by 75% temporarily
 *
 * State management:
 * - useBattle hook manages HP, attacks, and win/loss detection
 * - Candy calculations use player stats and click count
 * - Awards synced to backend via updateRareCandy mutation
 *
 * Integration:
 * - Accepts attack function callback for external controls (map keyboard)
 * - Fullscreen mode support for map integration
 * - Mobile-responsive layout
 */
import {useState, useEffect, useRef, useMemo} from 'react';
import type {PokedexPokemon} from '@features/pokedex';
import {useAuth} from '@features/auth/hooks/useAuth';
import {useMobileDetection} from '@/hooks';
import {HealthBar} from './HealthBar';
import {BattleResult} from './BattleResult';
import {useBattle} from '../hooks/useBattle';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {getPlatformImage} from '../utils/platformMapping';
import {toDecimal} from '@/lib/decimal';
import {useCandyOperations} from '@/contexts/CandyOperationsContext';

interface BattleViewProps {
  playerPokemon: PokedexPokemon;
  opponentPokemon: PokedexPokemon;
  onBattleComplete: (result: 'victory' | 'defeat') => void;
  isDarkMode?: boolean;
  onAttackFunctionReady?: (attackFunction: () => void) => void;
  isFullscreen?: boolean;
}

export function BattleView({
  playerPokemon,
  opponentPokemon,
  onBattleComplete,
  isDarkMode = false,
  onAttackFunctionReady,
  isFullscreen = false,
}: BattleViewProps) {
  const {user} = useAuth();
  const {addCandy} = useCandyOperations();
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
    triggerShield,
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

  // Keep attack function ref up to date so the wrapper always calls the latest version
  const attackFunctionRef = useRef(handleAttackClick);
  attackFunctionRef.current = handleAttackClick;

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

  // Calculate rare candy reward
  const candyPerClick = user?.stats
    ? calculateCandyPerClick(user.stats, user.owned_pokemon_ids?.length || 0)
    : '1';

  // Base reward: clicks × candyPerClick × 10
  const battleReward = toDecimal(finalClickCount)
    .times(candyPerClick)
    .times(10);
  const rareCandyReward = battleReward.floor().toString();

  // Ready countdown state
  const [readyCount, setReadyCount] = useState(5);

  useEffect(() => {
    // Begin a short countdown then start the battle
    if (result !== 'ongoing') return;
    if (isActive) return; // already started

    setReadyCount(5);
    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      setReadyCount(count);
      if (count <= 0) {
        clearInterval(timer);
        startBattle();
      }
    }, 800);

    return () => clearInterval(timer);
  }, [result, isActive, startBattle]);

  // Auto-award candy when battle is won
  useEffect(() => {
    if (
      battleResult === 'victory' &&
      toDecimal(rareCandyReward).gt(0) &&
      !candyAwarded &&
      addCandy
    ) {
      // Award candy via clicker's addCandy to maintain consistent batching
      addCandy(rareCandyReward);
      setCandyAwarded(true);
    }
  }, [battleResult, rareCandyReward, candyAwarded, addCandy]);

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
        onContinue={() => onBattleComplete(battleResult)}
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
      onClick={handleAttackClick}
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
        }}
        aria-label={`Opponent: ${capitalizeName(opponentPokemon.name)}`}
      />
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
      <img
        src={playerPokemon.sprite}
        alt={capitalizeName(playerPokemon.name)}
        className="absolute image-pixelated z-10"
        decoding="async"
        style={{
          imageRendering: 'pixelated',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          ...createPositionStyle(layoutConfig.playerSprite),
        }}
        aria-label={`Click to attack with ${capitalizeName(playerPokemon.name)}`}
      />
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
              className={`relative px-1 py-0.5 md:px-3 md:py-2 pixel-font text-[9px] md:text-xs border-2 rounded shadow-[2px_2px_0_rgba(0,0,0,1)] overflow-hidden transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
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
                if (isCharged) triggerSpecialAttack();
              }}
              disabled={!isCharged}
              tabIndex={0}
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
                  !isCharged ? 'text-gray-800' : 'text-white drop-shadow-lg'
                }`}
              >
                <span className="md:hidden" aria-label="Special attack">
                  Sp.Att
                </span>
                <span className="hidden md:inline">Special Attack</span>
              </span>
            </button>
            <button
              className={`relative px-1 py-0.5 md:px-3 md:py-2 pixel-font text-[9px] md:text-xs border-2 rounded shadow-[2px_2px_0_rgba(0,0,0,1)] overflow-hidden transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
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
                if (isCharged) triggerShield();
              }}
              disabled={!isCharged}
              tabIndex={0}
            >
              {/* Charge progress bar with glow effect */}
              <div
                className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-t from-blue-900 via-blue-600 to-blue-400'
                    : 'bg-gradient-to-t from-blue-800 via-blue-500 to-blue-300'
                } ${isCharged ? 'shadow-lg shadow-blue-500/50' : ''}`}
                style={{height: `${chargeProgress}%`}}
                role="progressbar"
                aria-valuenow={chargeProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-hidden="true"
              />
              <span
                className={`relative z-10 font-bold transition-colors duration-300 ${
                  !isCharged ? 'text-gray-800' : 'text-white drop-shadow-lg'
                }`}
                aria-label="Shield"
              >
                Shield
              </span>
            </button>
          </nav>
        </section>
      )}
    </main>
  );
}
