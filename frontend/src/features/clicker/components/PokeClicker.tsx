import {useState, useEffect} from 'react';
import {useAuth} from '@features/auth';
import {useGameMutations} from '../hooks/useGameMutations';
import {useCandySync} from '../hooks/useCandySync';
import {usePassiveIncome} from '../hooks/usePassiveIncome';
import {gameAssetsCache} from '@/lib/gameAssetsCache';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {getUpgradeCost} from '../utils/statDescriptions';
import {GameBoyConsole} from './GameBoyConsole';
import {RareCandyCounter} from './RareCandyCounter';
import {UpgradesPanel} from './UpgradesPanel';

interface Candy {
  id: number;
  x: number;
  amount: number;
}

interface PokeClickerProps {
  isDarkMode?: boolean;
}

export function PokeClicker({isDarkMode = false}: PokeClickerProps) {
  const {user, isAuthenticated, updateUser} = useAuth();
  const {upgradeStat, loading} = useGameMutations();

  // Visual state
  const [isAnimating, setIsAnimating] = useState(false);
  const [candies, setCandies] = useState<Candy[]>([]);
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

  // Candy sync hook
  const {
    localRareCandy,
    displayError,
    setDisplayError,
    addCandy,
    deductCandy,
    flushPendingCandy,
  } = useCandySync({user, isAuthenticated, updateUser});

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
        console.warn('Failed to preload game assets:', error);
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

  // Calculate candies per click
  const getCandiesPerClick = () => {
    return calculateCandyPerClick(stats);
  };

  // Handle click
  const handleClick = () => {
    if (!isAuthenticated) {
      setDisplayError('Please log in to play the game');
      return;
    }

    const candiesEarned = getCandiesPerClick();

    // Update local candy immediately (optimistic UI)
    addCandy(candiesEarned);
    setIsAnimating(true);

    // Add floating candy animation
    const newCandy: Candy = {
      id: Date.now() + Math.random(),
      x: Math.random() * 60 + 20, // Random position between 20% and 80%
      amount: candiesEarned,
    };
    setCandies((prev) => [...prev, newCandy]);

    // Remove candy after animation
    setTimeout(() => {
      setCandies((prev) => prev.filter((c) => c.id !== newCandy.id));
    }, 1000);

    setTimeout(() => setIsAnimating(false), 150);
  };

  // Handle upgrade
  const handleUpgrade = async (stat: keyof typeof stats) => {
    if (!isAuthenticated) {
      setDisplayError('Please log in to upgrade stats');
      return;
    }

    const cost = getUpgradeCost(stat, stats[stat] || 1);

    if (localRareCandy < cost) {
      return; // Not enough candy
    }

    // Flush unsynced candy before upgrading to ensure server has latest amount
    await flushPendingCandy();

    // Optimistic updates (both candy and stats)
    const oldStat = stats[stat];
    deductCandy(cost);
    setStats((prev) => ({
      ...prev,
      [stat]: (prev[stat] || 1) + 1,
    }));

    try {
      const updatedUser = await upgradeStat(stat, updateUser);
      if (updatedUser) {
        // Server confirmed - update stats from server
        setStats(updatedUser.stats);
      }
    } catch (err) {
      console.error('Failed to upgrade stat:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to upgrade stat. Please try again.';
      setDisplayError(errorMessage);
      // Revert optimistic updates
      addCandy(cost);
      setStats((prev) => ({...prev, [stat]: oldStat || 1}));
      setTimeout(() => setDisplayError(null), 3000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
      {/* Display errors */}
      {displayError && (
        <div
          className="fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50"
          style={{
            backgroundColor: isDarkMode ? 'var(--destructive)' : '#ef4444',
            color: isDarkMode ? 'var(--destructive-foreground)' : 'white',
          }}
        >
          {displayError}
          <button
            onClick={() => setDisplayError(null)}
            className="ml-4 font-bold hover:opacity-70"
            style={{
              color: isDarkMode ? 'var(--destructive-foreground)' : 'white',
            }}
          >
            X
          </button>
        </div>
      )}

      {/* Show unauthenticated message */}
      {!isAuthenticated && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-lg shadow-xl z-50 text-center"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            border: '4px solid var(--border)',
          }}
        >
          <h2
            className="pixel-font text-2xl mb-4"
            style={{color: 'var(--foreground)'}}
          >
            Please Log In
          </h2>
          <p
            className="pixel-font text-sm mb-4"
            style={{color: 'var(--foreground)'}}
          >
            You need to log in to play the clicker game and save your progress.
          </p>
        </div>
      )}

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
