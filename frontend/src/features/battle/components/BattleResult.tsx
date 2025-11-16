/**
 * Battle result screen showing victory/defeat and rewards.
 *
 * Features:
 * - Victory: displays rare candy rewards and Pokemon caught
 * - Defeat: shows encouraging message
 * - 3-second countdown before continue button appears
 * - Battle stats display (click count)
 * - Responsive mobile and desktop layouts
 *
 * Visual design:
 * - Victory: yellow/gold theme
 * - Defeat: red theme
 * - Pokemon sprite display
 * - Rare candy icon with formatted reward amount
 *
 * Accessibility:
 * - Proper semantic HTML (section, article, figure, dl)
 * - aria-labelledby for screen readers
 * - Auto-countdown prevents accidental skips
 */
import type {PokedexPokemon} from '@features/pokedex';
import {Button} from '@ui/pixelact';
import {formatNumber} from '@/lib/formatNumber';
import {useState, useEffect} from 'react';

interface BattleResultProps {
  result: 'victory' | 'defeat';
  opponentPokemon: PokedexPokemon;
  clickCount: number;
  rareCandyReward: string;
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
  const [showButton, setShowButton] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowButton(true);
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  return (
    <section
      className="relative w-full h-full flex flex-col items-center justify-center p-2 md:p-3 select-none"
      aria-labelledby="battle-result-title"
    >
      <article
        className={`text-center space-y-1 md:space-y-2 p-2 md:p-3 border-4 rounded-lg shadow-2xl w-full max-w-[90%] ${
          isVictory
            ? isDarkMode
              ? 'border-yellow-500 bg-gradient-to-b from-yellow-400/20 to-yellow-400/70'
              : 'border-yellow-600 bg-gradient-to-b from-yellow-100 to-yellow-500'
            : isDarkMode
              ? 'border-red-500 bg-gradient-to-b from-red-600/10 to-red-600/60'
              : 'border-red-600 bg-gradient-to-b from-red-100 to-red-400'
        }`}
      >
        {/* Result Title */}
        <header>
          <h2
            id="battle-result-title"
            className={`pixel-font text-sm md:text-lg font-bold mb-0.5 ${
              isDarkMode
                ? isVictory
                  ? 'text-yellow-500'
                  : 'text-red-500'
                : isVictory
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {isVictory ? 'Victory!' : 'Defeat!'}
          </h2>
          <p
            className={`pixel-font text-[9px] md:text-[10px] ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            {isVictory
              ? `You defeated ${opponentPokemon.name}!`
              : `${opponentPokemon.name} defeated you...`}
          </p>
        </header>

        {/* Opponent Pokemon */}
        <figure className="flex justify-center">
          <img
            src={opponentPokemon.sprite}
            alt={opponentPokemon.name}
            className="w-12 h-12 md:w-16 md:h-16 image-pixelated"
            decoding="async"
            style={{imageRendering: 'pixelated'}}
          />
        </figure>

        {/* Rewards (Victory only) */}
        {isVictory && (
          <section
            className={`space-y-0.5 md:space-y-1 p-1.5 md:p-2 border-2 rounded ${
              isDarkMode
                ? 'border-gray-600 bg-gray-800/50'
                : 'border-gray-300 bg-white/50'
            }`}
            aria-labelledby="rewards-heading"
          >
            <h3
              id="rewards-heading"
              className="pixel-font text-[10px] md:text-xs font-bold text-green-600"
            >
              Rewards
            </h3>

            <div className="flex items-center justify-center gap-1">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                alt="Rare Candy"
                className="w-4 h-4 md:w-5 md:h-5"
                loading="lazy"
                decoding="async"
                style={{imageRendering: 'pixelated'}}
              />
              <span
                className={`pixel-font text-[9px] md:text-[10px] ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}
              >
                +{formatNumber(rareCandyReward)} Rare Candy!
              </span>
            </div>

            <div
              className={`pixel-font text-[8px] md:text-[9px] ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {opponentPokemon.isOwned
                ? `You already own ${opponentPokemon.name}!`
                : `${opponentPokemon.name} added to collection!`}
            </div>
          </section>
        )}

        {/* Stats */}
        <dl
          className={`text-[9px] md:text-[10px] pixel-font ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}
        >
          <div>
            <dt className="inline">Attacks: </dt>
            <dd className="inline">{clickCount}</dd>
          </div>
        </dl>

        {/* Continue Button */}
        {showButton ? (
          <Button
            onClick={onContinue}
            className="w-full text-[10px] md:text-xs py-1 md:py-1.5"
            aria-label={`${isVictory ? 'Continue' : 'Return to Map'}`}
            isDarkMode={isDarkMode}
          >
            {isVictory ? 'Continue' : 'Return to Map'}
          </Button>
        ) : (
          <div
            className={`pixel-font text-lg md:text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
          >
            {countdown}
          </div>
        )}
      </article>
    </section>
  );
}
