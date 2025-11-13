import {useState, useEffect} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';
import {useGameMutations} from '../hooks/useGameMutations';
import {useCandySync} from '../hooks/useCandySync';
import {useAutoclicker} from '../hooks/useAutoclicker';
import {useClickerActions} from '../hooks/useClickerActions';
import {gameAssetsCache} from '@/lib/gameAssetsCache';
import {GameBoyConsole} from './GameBoyConsole';
import {UpgradesPanel} from './UpgradesPanel';
import {UnauthenticatedMessage} from './UnauthenticatedMessage';
import {ErrorBanner} from '@/components';
import {ClickerHelpModal} from './ClickerHelpModal';

interface PokeClickerProps {
  isDarkMode?: boolean;
  isOnboarding?: boolean;
}

export function PokeClicker({
  isDarkMode = false,
  isOnboarding = false,
}: PokeClickerProps) {
  const {user, isAuthenticated, updateUser} = useAuth();
  const {upgradeStat, loading} = useGameMutations();
  const [showHelp, setShowHelp] = useState(false);

  const [stats, setStats] = useState(
    user?.stats || {
      hp: 1,
      attack: 1,
      defense: 1,
      spAttack: 1,
      spDefense: 1,
      speed: 1,
      clickPower: 1,
      autoclicker: 1,
      luckyHitChance: 1,
      luckyHitMultiplier: 1,
      clickMultiplier: 1,
      pokedexBonus: 1,
    }
  );

  useEffect(() => {
    if (user?.stats) {
      setStats(user.stats);
    }
  }, [user?.stats]);

  const {
    localRareCandy,
    displayError,
    setDisplayError,
    addCandy,
    deductCandy,
    flushPendingCandy,
  } = useCandySync({user, isAuthenticated, updateUser});

  const {isAnimating, candies, handleClick, handleUpgrade} = useClickerActions({
    stats,
    isAuthenticated,
    addCandy,
    deductCandy,
    flushPendingCandy,
    localRareCandy,
    setDisplayError,
    setStats,
    upgradeStat,
    updateUser,
    ownedPokemonCount: user?.owned_pokemon_ids?.length || 0,
  });

  useAutoclicker({
    stats,
    isAuthenticated,
    onAutoClick: addCandy,
    ownedPokemonCount: user?.owned_pokemon_ids?.length || 0,
    isOnboarding,
  });

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await gameAssetsCache.preloadClickerAssets();
        await Promise.all([
          gameAssetsCache.getCharizardSprite(),
          gameAssetsCache.getCandyImage(),
          gameAssetsCache.getRareCandyIcon(),
          gameAssetsCache.getPokemonBackground(),
        ]);
      } catch (error) {
        logger.logError(error, 'PreloadGameAssets');
      }
    };
    preloadAssets();
  }, []);

  useEffect(() => {
    if (user) {
      setStats(user.stats);
    }
  }, [user]);

  return (
    <>
      <ClickerHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        isDarkMode={isDarkMode}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
        {displayError && (
          <ErrorBanner
            message={displayError}
            onDismiss={() => setDisplayError(null)}
            isDarkMode={isDarkMode}
          />
        )}

        {!isAuthenticated && <UnauthenticatedMessage />}

        <GameBoyConsole
          isDarkMode={isDarkMode}
          isAuthenticated={isAuthenticated}
          isAnimating={isAnimating}
          candies={candies}
          selectedPokemonId={user?.selected_pokemon_id || null}
          onClickScreen={handleClick}
          isOnboarding={isOnboarding}
        />

        <div className="flex flex-col gap-6 w-full max-w-md lg:max-w-lg relative">
          {/* Info Button - positioned in top-right of upgrades panel */}
          <button
            onClick={() => setShowHelp(true)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setShowHelp(true);
            }}
            className="absolute top-2 right-2 z-10 flex items-center justify-center border-2 border-black w-11 h-11 touch-manipulation text-xs font-bold"
            title="Upgrade guide"
            aria-label="Show upgrade guide"
            style={{
              WebkitTapHighlightColor: 'transparent',
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              boxShadow: '4px 4px 0px rgba(0,0,0,1)',
              transform: 'translate(0, 0)',
              transition: 'all 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '6px 6px 0px rgba(0,0,0,1)';
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,1)';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
            }}
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
            >
              <path
                d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z"
                fill="currentColor"
              />
            </svg>
          </button>

          <UpgradesPanel
            isDarkMode={isDarkMode}
            stats={stats}
            currentCandy={localRareCandy}
            isLoading={loading}
            isAuthenticated={isAuthenticated}
            onUpgrade={handleUpgrade}
            ownedPokemonCount={user?.owned_pokemon_ids?.length || 0}
          />
        </div>
      </div>
    </>
  );
}
