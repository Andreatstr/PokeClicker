import {useState} from 'react';
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
}

export function BattleView({
  playerPokemon,
  opponentPokemon,
  onBattleComplete,
  isDarkMode = false,
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
      onClick={handleAttackClick}
      style={{
        backgroundImage: 'url(/project2/pokemon-battle-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Opponent Pokemon (top right) */}
      <div className="flex-1 flex flex-col justify-start p-2 pt-8 md:p-4 md:pt-16">
        <div className="flex justify-end items-start gap-2 md:gap-4 translate-y-12 md:translate-y-28">
          <div className="flex-1 max-w-[180px] md:max-w-xs">
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
            className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 image-pixelated mr-2 md:mr-8"
            style={{imageRendering: 'pixelated'}}
          />
        </div>
      </div>

      {/* Player Pokemon (bottom left) */}
      <div className="flex-1 flex flex-col justify-end p-2 pb-16 md:p-4 md:pb-20">
        <div className="flex justify-start items-end gap-2 md:gap-4">
          <div
            className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 flex-shrink-0 relative group ml-2 mb-2 md:ml-4 md:mb-4"
            aria-label={`Click to attack with ${playerPokemon.name}`}
          >
            <img
              src={playerPokemon.sprite}
              alt={playerPokemon.name}
              className="w-full h-full image-pixelated transition-transform group-hover:scale-110 group-active:scale-95"
              style={{imageRendering: 'pixelated'}}
            />
          </div>
          <div className="flex-1 max-w-[180px] md:max-w-xs -translate-y-12 md:-translate-y-18">
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

      {/* Attack instructions */}
      {result === 'ongoing' && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center pointer-events-none -translate-y-8">
          <div
            className={`pixel-font text-xs px-3 py-1 rounded ${
              isDarkMode
                ? 'text-gray-300 bg-black/50'
                : 'text-white bg-black/70'
            }`}
          >
            Click anywhere to attack!
          </div>
        </div>
      )}

      {/* Click counter (debug) */}
      <div className="absolute top-2 left-2 pixel-font text-[10px] text-white bg-black/50 px-2 py-1 rounded pointer-events-none">
        Clicks: {clickCount}
      </div>
    </div>
  );
}
