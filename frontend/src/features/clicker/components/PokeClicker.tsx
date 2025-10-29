import {useState, useEffect} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';
import {useGameMutations} from '../hooks/useGameMutations';
import {useCandySync} from '../hooks/useCandySync';
import {usePassiveIncome} from '../hooks/usePassiveIncome';
import {useClickerActions} from '../hooks/useClickerActions';
import {gameAssetsCache} from '@/lib/gameAssetsCache';
import {GameBoyConsole} from './GameBoyConsole';
import {RareCandyCounter} from './RareCandyCounter';
import {UpgradesPanel} from './UpgradesPanel';
import {UnauthenticatedMessage} from './UnauthenticatedMessage';
import {ErrorBanner} from '@/components';

interface PokeClickerProps {
  isDarkMode?: boolean;
}

export function PokeClicker({isDarkMode = false}: PokeClickerProps) {
  const {user, isAuthenticated, updateUser} = useAuth();
  const {upgradeStat, loading} = useGameMutations();

  const [stats, setStats] = useState(
    user?.stats || {
      hp: 1,
      attack: 1,
      defense: 1,
      spAttack: 1,
      spDefense: 1,
      speed: 1,
      clickPower: 1,
      passiveIncome: 1,
    }
  );

  // Sync stats when user data loads
  useEffect(() => {
    if (user?.stats) {
      setStats(user.stats);
    }
  }, [user?.stats]);

  // Candy sync hook
  const {
    localRareCandy,
    displayError,
    setDisplayError,
    addCandy,
    deductCandy,
    flushPendingCandy,
  } = useCandySync({user, isAuthenticated, updateUser});

  // Clicker actions hook
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
  });

  // Passive income hook
  usePassiveIncome({
    stats,
    isAuthenticated,
    onIncomeGenerated: addCandy,
  });

  // Preload game assets
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

  // Sync stats with user data when it changes
  useEffect(() => {
    if (user) {
      setStats(user.stats);
    }
  }, [user]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
      {/* Display errors */}
      {displayError && (
        <ErrorBanner
          message={displayError}
          onDismiss={() => setDisplayError(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Show unauthenticated message */}
      {!isAuthenticated && <UnauthenticatedMessage />}

      {/* GameBoy Console */}
      <GameBoyConsole
        isDarkMode={isDarkMode}
        isAuthenticated={isAuthenticated}
        isAnimating={isAnimating}
        candies={candies}
        selectedPokemonId={user?.selected_pokemon_id || null}
        onClickScreen={handleClick}
      />

      {/* Stats and Upgrades */}
      <div className="flex flex-col gap-6 w-full max-w-md lg:max-w-lg">
        {/* Rare Candy Counter */}
        <RareCandyCounter isDarkMode={isDarkMode} candyCount={localRareCandy} />

        {/* Upgrades */}
        <UpgradesPanel
          isDarkMode={isDarkMode}
          stats={stats}
          currentCandy={localRareCandy}
          isLoading={loading}
          isAuthenticated={isAuthenticated}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
}
