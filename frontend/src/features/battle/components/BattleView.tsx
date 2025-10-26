import {useState, useEffect} from 'react';
import type {PokedexPokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import {HealthBar} from './HealthBar';
import {BattleResult} from './BattleResult';
import {useBattle} from '../hooks/useBattle';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';

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

  // Expose attack function to parent component
  useEffect(() => {
    if (onAttackFunctionReady && result === 'ongoing') {
      onAttackFunctionReady(handleAttackClick);
    }
  }, [onAttackFunctionReady, handleAttackClick, result]);

  // Calculate rare candy reward
  const candyPerClick = user?.stats ? calculateCandyPerClick(user.stats) : 1;
  const rareCandyReward = Math.floor(finalClickCount * candyPerClick * 5);

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
        background: isDarkMode ? `
          linear-gradient(0deg, #374151 0%, #4b5563 20%, #6b7280 40%, #4b5563 60%, #374151 80%, #1f2937 100%),
          linear-gradient(0deg, #1f2937 0%, #374151 15%, #4b5563 30%, #6b7280 45%, #4b5563 60%, #374151 75%, #1f2937 90%, #111827 100%),
          linear-gradient(0deg, #111827 0%, #1f2937 10%, #374151 25%, #4b5563 40%, #6b7280 55%, #4b5563 70%, #374151 85%, #1f2937 100%),
          linear-gradient(0deg, #0f172a 0%, #111827 20%, #1f2937 40%, #374151 60%, #1f2937 80%, #111827 100%),
          linear-gradient(0deg, #1e293b 0%, #334155 25%, #475569 50%, #334155 75%, #1e293b 100%)
        ` : `
          linear-gradient(0deg, #e2e8f0 0%, #cbd5e1 20%, #94a3b8 40%, #cbd5e1 60%, #e2e8f0 80%, #94a3b8 100%),
          linear-gradient(0deg, #cbd5e1 0%, #e2e8f0 15%, #cbd5e1 30%, #94a3b8 45%, #cbd5e1 60%, #e2e8f0 75%, #cbd5e1 90%, #94a3b8 100%),
          linear-gradient(0deg, #94a3b8 0%, #cbd5e1 10%, #e2e8f0 25%, #cbd5e1 40%, #94a3b8 55%, #cbd5e1 70%, #e2e8f0 85%, #cbd5e1 100%),
          linear-gradient(0deg, #64748b 0%, #94a3b8 20%, #cbd5e1 40%, #e2e8f0 60%, #cbd5e1 80%, #94a3b8 100%),
          linear-gradient(0deg, #475569 0%, #64748b 30%, #94a3b8 50%, #64748b 70%, #475569 100%),
          linear-gradient(0deg, #334155 0%, #475569 25%, #64748b 50%, #475569 75%, #334155 100%)
        `
      }}
      onClick={handleAttackClick}
    >
      {/* Oval platforms - positioned based on Pokemon locations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Opponent platform - positioned under opponent Pokemon (moved lower on mobile) */}
        <div 
          className="absolute w-32 h-16 md:w-40 md:h-20 md:mr-4 md:mt-4" 
          style={{
            top: '20%', 
            right: '8px', 
            borderRadius: '50%',
            background: `
              linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%),
              linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)
            `,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)',
            border: '2px solid #991b1b'
          }}
        ></div>
        {/* Player platform - positioned under player Pokemon (moved left and higher on mobile) */}
        <div 
          className="absolute w-32 h-16 md:w-40 md:h-20" 
          style={{
            bottom: '8px', 
            left: '16px', 
            borderRadius: '50%',
            background: `
              linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #2563eb 100%),
              linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)
            `,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)',
            border: '2px solid #1d4ed8'
          }}
        ></div>
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
            className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 image-pixelated -mr-4 md:mr-8"
            style={{imageRendering: 'pixelated'}}
          />
        </div>
      </div>

      {/* Player Pokemon (bottom left) */}
      <div className="flex-1 flex flex-col justify-end p-2 pb-4 md:p-4 md:pb-6">
        <div className="flex justify-start items-end gap-4 md:gap-6">
          <div
            className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 flex-shrink-0 relative group ml-8 mb-2 md:ml-4 md:mb-0"
            aria-label={`Click to attack with ${playerPokemon.name}`}
          >
            <img
              src={playerPokemon.sprite}
              alt={playerPokemon.name}
              className="w-full h-full image-pixelated transition-transform group-hover:scale-110 group-active:scale-95"
              style={{imageRendering: 'pixelated'}}
            />
          </div>
          <div className="flex-1 max-w-[140px] md:max-w-xs -translate-y-4 md:-translate-y-12 ml-4 md:ml-4">
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
