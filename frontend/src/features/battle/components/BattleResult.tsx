import type {PokedexPokemon} from '@features/pokedex';
import {Button} from '@ui/pixelact';
import {formatNumber} from '@/lib/formatNumber';

interface BattleResultProps {
  result: 'victory' | 'defeat';
  opponentPokemon: PokedexPokemon;
  clickCount: number;
  rareCandyReward: number;
  onContinue: () => void;
  isDarkMode?: boolean;
}

export function BattleResult({
  result,
  opponentPokemon,
  clickCount,
  rareCandyReward,
  onContinue,
  isDarkMode = false,
}: BattleResultProps) {
  const isVictory = result === 'victory';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
      <div
        className={`text-center space-y-3 p-4 border-4 rounded-lg shadow-2xl w-full max-w-[90%] ${
          isVictory
            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-red-400 bg-red-50 dark:bg-red-900/20'
        }`}
      >
        {/* Result Title */}
        <div>
          <h2
            className={`pixel-font text-xl font-bold mb-1 ${
              isVictory ? 'text-yellow-600' : 'text-red-600'
            }`}
          >
            {isVictory ? 'Victory!' : 'Defeat!'}
          </h2>
          <p
            className={`pixel-font text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {isVictory
              ? `You defeated ${opponentPokemon.name}!`
              : `${opponentPokemon.name} defeated you...`}
          </p>
        </div>

        {/* Opponent Pokemon */}
        <div className="flex justify-center">
          <img
            src={opponentPokemon.sprite}
            alt={opponentPokemon.name}
            className="w-20 h-20 image-pixelated"
            style={{imageRendering: 'pixelated'}}
          />
        </div>

        {/* Rewards (Victory only) */}
        {isVictory && (
          <div
            className={`space-y-2 p-3 border-2 rounded ${
              isDarkMode
                ? 'border-gray-600 bg-gray-800/50'
                : 'border-gray-300 bg-white/50'
            }`}
          >
            <div className="pixel-font text-sm font-bold text-green-600">
              Rewards
            </div>

            <div className="flex items-center justify-center gap-2">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                alt="Rare Candy"
                className="w-6 h-6"
                style={{imageRendering: 'pixelated'}}
              />
              <span
                className={`pixel-font text-sm ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}
              >
                +{formatNumber(rareCandyReward)} Rare Candy
              </span>
            </div>

            <div
              className={`pixel-font text-[10px] ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {opponentPokemon.isOwned
                ? `You already own ${opponentPokemon.name}!`
                : `${opponentPokemon.name} added to your collection!`}
            </div>
          </div>
        )}

        {/* Stats */}
        <div
          className={`text-[10px] pixel-font ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <div>Attacks: {clickCount}</div>
        </div>

        {/* Continue Button */}
        <Button onClick={onContinue} className="w-full text-sm py-2">
          {isVictory ? 'Continue' : 'Return to Map'}
        </Button>
      </div>
    </div>
  );
}
