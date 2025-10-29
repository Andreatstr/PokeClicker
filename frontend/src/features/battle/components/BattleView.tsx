import {useState, useEffect, useRef} from 'react';
import type {PokedexPokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import {HealthBar} from './HealthBar';
import {BattleResult} from './BattleResult';
import {useBattle} from '../hooks/useBattle';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {getPlatformImage} from '../utils/platformMapping';

interface BattleViewProps {
  playerPokemon: PokedexPokemon;
  opponentPokemon: PokedexPokemon;
  onBattleComplete: (result: 'victory' | 'defeat', clickCount: number) => void;
  isDarkMode?: boolean;
  onAttackFunctionReady?: (attackFunction: () => void) => void;
}

export function BattleView({
  playerPokemon,
  opponentPokemon,
  onBattleComplete,
  isDarkMode = false,
  onAttackFunctionReady,
}: BattleViewProps) {
  const {user} = useAuth();
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(
    null
  );
  const [finalClickCount, setFinalClickCount] = useState(0);

  const {
    playerHP,
    opponentHP,
    playerMaxHP,
    opponentMaxHP,
    result,
    clickCount,
    handleAttackClick,
  } = useBattle({
    playerPokemon,
    opponentPokemon,
    onBattleEnd: (result) => {
      setBattleResult(result);
      setFinalClickCount(clickCount);
      setShowResult(true);
    },
  });

  // Keep attack function ref up to date
  const attackFunctionRef = useRef(handleAttackClick);
  attackFunctionRef.current = handleAttackClick;

  // Expose attack function to parent component (only once on mount)
  useEffect(() => {
    if (onAttackFunctionReady) {
      // Create a stable wrapper that calls the latest attack function
      onAttackFunctionReady(() => {
        if (attackFunctionRef.current) {
          attackFunctionRef.current();
        }
      });
    }
    // Only run once on mount to avoid setState during render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate rare candy reward (must match PokemonMap.tsx multiplier)
  const candyPerClick = user?.stats ? calculateCandyPerClick(user.stats) : 1;
  const rareCandyReward = Math.floor(finalClickCount * candyPerClick * 10);

  if (showResult && battleResult) {
    return (
      <BattleResult
        result={battleResult}
        opponentPokemon={opponentPokemon}
        clickCount={finalClickCount}
        rareCandyReward={rareCandyReward}
        onContinue={() => onBattleComplete(battleResult, finalClickCount)}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div
      className="relative w-full h-full flex flex-col cursor-pointer"
      style={{
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
      {/* Oval platforms - positioned based on Pokemon locations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Opponent platform - positioned under opponent Pokemon (moved lower on mobile) */}
        <img
          src={getPlatformImage(opponentPokemon.types)}
          alt="Opponent platform"
          className="absolute w-32 h-16 md:w-40 md:h-20 md:mr-4 md:mt-4 object-contain"
          style={{
            top: '20%',
            right: '8px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        />
        {/* Player platform - positioned under player Pokemon (moved left and higher on mobile) */}
        <img
          src={getPlatformImage(playerPokemon.types)}
          alt="Player platform"
          className="absolute w-48 h-24 md:w-60 md:h-30 object-contain"
          style={{
            bottom: '-16px',
            left: '0px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        />
      </div>

      {/* Opponent Pokemon (top right) */}
      <div className="flex-1 flex flex-col justify-start p-2 pt-4 md:p-4 md:pt-4">
        <div className="flex justify-center items-center gap-2 md:gap-4 translate-y-8 md:translate-y-8 md:justify-end">
          <div className="flex-1 max-w-[120px] md:max-w-xs -ml-8 mr-8 md:ml-0">
            <HealthBar
              current={opponentHP}
              max={opponentMaxHP}
              label={opponentPokemon.name}
              side="opponent"
              isDarkMode={isDarkMode}
            />
          </div>
          <img
            src={opponentPokemon.sprite}
            alt={opponentPokemon.name}
            className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 image-pixelated -mr-8 md:mr-8"
            style={{imageRendering: 'pixelated'}}
          />
        </div>
      </div>

      {/* Player Pokemon (bottom left) */}
      <div className="flex-1 flex flex-col justify-end p-2 pb-4 md:p-4 md:pb-6">
        <div className="flex justify-start items-end gap-2 md:gap-4">
          <div
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex-shrink-0 relative group ml-8 -mb-4 md:ml-4 md:-mb-6"
            aria-label={`Click to attack with ${playerPokemon.name}`}
          >
            <img
              src={playerPokemon.sprite}
              alt={playerPokemon.name}
              className="w-full h-full image-pixelated transition-transform group-hover:scale-110 group-active:scale-95"
              style={{imageRendering: 'pixelated'}}
            />
          </div>
          <div className="flex-1 max-w-[120px] md:max-w-xs -translate-y-4 md:-translate-y-12 ml-0 md:ml-4">
            <HealthBar
              current={playerHP}
              max={playerMaxHP}
              label={playerPokemon.name}
              side="player"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Attack instructions - centered in the middle */}
      {result === 'ongoing' && (
        <div className="absolute top-11/20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div
            className={`pixel-font text-xs px-3 py-1 rounded ${
              isDarkMode
                ? 'text-gray-300 bg-black/50'
                : 'text-white bg-black/70'
            }`}
          >
            <span className="md:hidden">Tap anywhere to attack!</span>
            <span className="hidden md:inline">Click anywhere to attack!</span>
          </div>
        </div>
      )}
    </div>
  );
}
