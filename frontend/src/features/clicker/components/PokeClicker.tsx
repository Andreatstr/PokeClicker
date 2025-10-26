import {useState, useEffect, useRef, useCallback} from 'react';
import {Button, Card} from '@ui/pixelact';
import {useAuth} from '@features/auth';
import {useGameMutations} from '@features/clicker';
import {gameAssetsCache} from '@/lib/gameAssetsCache';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {formatNumber} from '@/lib/formatNumber';

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
  const {updateRareCandy, upgradeStat, loading} = useGameMutations();

  // Local state for visual feedback only
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
    }
  );
  const [, setCachedAssets] = useState<{
    charizard?: HTMLImageElement;
    candy?: HTMLImageElement;
    rareCandy?: HTMLImageElement;
    pokemonBg?: HTMLImageElement;
  }>({});

  // Preload game assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await gameAssetsCache.preloadClickerAssets();

        const [charizard, candy, rareCandy, pokemonBg] = await Promise.all([
          gameAssetsCache.getCharizardSprite(),
          gameAssetsCache.getCandyImage(),
          gameAssetsCache.getRareCandyIcon(),
          gameAssetsCache.getPokemonBackground(),
        ]);

        setCachedAssets({
          charizard,
          candy,
          rareCandy,
          pokemonBg,
        });
      } catch (error) {
        console.warn('Failed to preload game assets:', error);
      }
    };

    preloadAssets();
  }, []);

  // Local candy state - THIS is the source of truth for display!
  const [localRareCandy, setLocalRareCandy] = useState(user?.rare_candy || 0);
  const [unsyncedAmount, setUnsyncedAmount] = useState(0);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<number>(Date.now());

  // Error state
  const [displayError, setDisplayError] = useState<string | null>(null);

  // Initialize local candy from server when component mounts
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (user && !hasMountedRef.current) {
      setLocalRareCandy(user.rare_candy);
      setUnsyncedAmount(0);
      hasMountedRef.current = true;
    }
  }, [user]); // Run when user is available

  // Sync stats with user data when it changes (but NOT candy)
  useEffect(() => {
    if (user) {
      setStats(user.stats);
    }
  }, [user]);

  // Get the current candy count (local state only - never use server value during gameplay)
  const getCurrentCandy = () => localRareCandy;

  const flushPendingCandy = useCallback(async () => {
    if (unsyncedAmount === 0 || !isAuthenticated) return;

    const amountToSync = unsyncedAmount;
    setUnsyncedAmount(0); // Clear unsynced amount (we're syncing it now)
    lastSyncRef.current = Date.now();

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }

    try {
      // Send to server and update Apollo cache (for other pages)
      await updateRareCandy(amountToSync, updateUser);
      // Success - server and cache are now in sync with our local state
    } catch (err) {
      console.error('Failed to sync candy:', err);
      setDisplayError('Failed to save progress. Will retry...');
      // Put the amount back in unsynced so it will be tried again
      setUnsyncedAmount((prev) => prev + amountToSync);
      setTimeout(() => setDisplayError(null), 3000);
    }
  }, [unsyncedAmount, isAuthenticated, updateRareCandy]);

  // Batch update clicks every 10 seconds or after 50 clicks
  useEffect(() => {
    if (unsyncedAmount === 0 || !isAuthenticated) return;

    const shouldFlush =
      unsyncedAmount >= 50 || Date.now() - lastSyncRef.current >= 10000;

    if (shouldFlush) {
      flushPendingCandy();
    } else if (!batchTimerRef.current) {
      // Set a timer to flush after 10 seconds
      batchTimerRef.current = setTimeout(() => {
        flushPendingCandy();
      }, 10000);
    }

    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
    };
  }, [unsyncedAmount, isAuthenticated, flushPendingCandy]);

  // Flush when component unmounts (navigating away from clicker)
  useEffect(() => {
    return () => {
      if (unsyncedAmount > 0) {
        flushPendingCandy();
      }
    };
  }, []);

  // Calculate candies per click (using shared utility)
  const getCandiesPerClick = () => {
    return calculateCandyPerClick(stats);
  };

  // Calculate upgrade cost (differentiated by stat type)
  const getUpgradeCost = (stat: keyof typeof stats) => {
    const level = stats[stat];
    // Different multipliers for different stat types:
    // Attack/SpAttack: 2.8x (most expensive, highest reward)
    // HP/Defense/SpDefense: 2.5x (moderate cost)
    // Speed: 2.2x (cheapest, utility stat)
    let multiplier = 2.5; // default

    if (stat === 'attack' || stat === 'spAttack') {
      multiplier = 2.8;
    } else if (stat === 'speed') {
      multiplier = 2.2;
    }

    return Math.floor(10 * Math.pow(multiplier, level - 1));
  };

  // Effect for passive income
  useEffect(() => {
    if (!isAuthenticated) return;

    const passiveIncome =
      Math.floor((stats.hp - 1) * 0.5) + Math.floor((stats.defense - 1) * 0.3);

    if (passiveIncome > 0) {
      const interval = setInterval(() => {
        // Update local candy (optimistic UI)
        setLocalRareCandy((prev) => prev + passiveIncome);
        // Track unsynced amount
        setUnsyncedAmount((prev) => prev + passiveIncome);
      }, 1000); // Every second

      return () => clearInterval(interval);
    }
  }, [stats.hp, stats.defense, isAuthenticated]);

  const handleClick = () => {
    if (!isAuthenticated) {
      setDisplayError('Please log in to play the game');
      return;
    }

    const candiesEarned = getCandiesPerClick();

    // Update local candy immediately (optimistic UI)
    setLocalRareCandy((prev) => prev + candiesEarned);
    // Track unsynced amount
    setUnsyncedAmount((prev) => prev + candiesEarned);
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

  const handleUpgrade = async (stat: keyof typeof stats) => {
    if (!isAuthenticated) {
      setDisplayError('Please log in to upgrade stats');
      return;
    }

    const cost = getUpgradeCost(stat);
    const currentCandy = getCurrentCandy();

    if (currentCandy < cost) {
      return; // Not enough candy
    }

    // Flush unsynced candy before upgrading to ensure server has latest amount
    if (unsyncedAmount > 0) {
      await flushPendingCandy();
    }

    // Optimistic updates (both candy and stats)
    const oldStat = stats[stat];
    const oldCandy = localRareCandy;
    setLocalRareCandy((prev) => prev - cost); // Deduct cost immediately
    setStats((prev: typeof stats) => ({...prev, [stat]: prev[stat] + 1}));

    try {
      const updatedUser = await upgradeStat(stat, updateUser);
      if (updatedUser) {
        // Server confirmed - update stats from server
        setStats(updatedUser.stats);
        // Note: We don't update localRareCandy from server because we already deducted it optimistically
      }
    } catch (err) {
      console.error('Failed to upgrade stat:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to upgrade stat. Please try again.';
      setDisplayError(errorMessage);
      // Revert optimistic updates
      setLocalRareCandy(oldCandy);
      setStats((prev: typeof stats) => ({...prev, [stat]: oldStat}));
      setTimeout(() => setDisplayError(null), 3000);
    }
  };

  // Get stat description
  const getStatDescription = (stat: keyof typeof stats) => {
    switch (stat) {
      case 'hp': {
        const hpPassive = (stats.hp - 1) * 0.5;
        return `+${hpPassive.toFixed(1)}/s passive`;
      }
      case 'attack':
        return `+${stats.attack} per click`;
      case 'defense': {
        const defPassive = (stats.defense - 1) * 0.3;
        return `+${defPassive.toFixed(1)}/s passive`;
      }
      case 'spAttack':
        return `+${Math.floor(stats.spAttack * 0.5)} per click`;
      case 'spDefense':
        return `Coming soon`;
      case 'speed':
        return `Coming soon`;
      default:
        return '';
    }
  };

  // Show loading state while mutations are in progress
  const isLoading = loading;

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
      <Card
        className="border-4 p-8 w-full max-w-md lg:max-w-lg"
        style={{
          backgroundColor: isDarkMode ? '#6a6a6a' : '#9FA0A0',
          borderColor: isDarkMode ? '#333333' : 'black',
          boxShadow: isDarkMode
            ? '8px 8px 0px 0px rgba(51,51,51,1)'
            : '8px 8px 0px 0px rgba(0,0,0,1)',
        }}
      >
        <div className="flex flex-col items-center">
          {/* Screen Area */}
          <div
            className="rounded-md p-3 mb-3 w-full shadow-inner border-2"
            style={{
              backgroundColor: isDarkMode ? '#1a1a2e' : '#3E3E52',
              borderColor: isDarkMode ? '#0f0f1a' : '#2a2a3e',
            }}
          >
            {/* Screen Label */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full border"
                  style={{
                    backgroundColor: isDarkMode ? '#dc2626' : '#dc2626',
                    borderColor: isDarkMode ? '#333333' : 'black',
                  }}
                ></div>
                <span
                  className="text-[6px] pixel-font tracking-wider"
                  style={{color: isDarkMode ? '#d1d5db' : '#d1d5db'}}
                >
                  BATTERY
                </span>
              </div>
              <span
                className="text-[7px] pixel-font tracking-wider"
                style={{color: isDarkMode ? '#d1d5db' : '#d1d5db'}}
              >
                DOT MATRIX WITH STEREO SOUND
              </span>
            </div>

            {/* Screen */}
            <div
              className="p-2 shadow-inner border-2"
              style={{
                backgroundColor: isDarkMode ? '#4a4a2a' : '#8a8a4a',
                borderColor: isDarkMode ? '#0f0f1a' : '#1a1a2e',
              }}
            >
              <button
                onClick={handleClick}
                className="w-full aspect-[10/9] flex items-end justify-center border-none cursor-pointer p-0 pb-8 focus:outline-none focus:ring-2 focus:ring-yellow-400 relative overflow-hidden"
                aria-label="Click Charizard to earn rare candy"
                disabled={!isAuthenticated}
                style={{
                  backgroundImage: `url('${import.meta.env.BASE_URL}pokemon-bg.webp')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  imageRendering: 'pixelated',
                  opacity: !isAuthenticated ? 0.5 : 1,
                }}
              >
                {/* Floating candies */}
                {candies.map((candy) => (
                  <div
                    key={candy.id}
                    className="absolute pointer-events-none flex items-center gap-1"
                    style={{
                      left: `${candy.x}%`,
                      bottom: '40%',
                      animation: 'float-up 1s ease-out forwards',
                    }}
                  >
                    <span
                      className="pixel-font text-yellow-400 font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      style={{
                        textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                      }}
                    >
                      +{formatNumber(candy.amount)}
                    </span>
                    <img
                      src={`${import.meta.env.BASE_URL}candy.webp`}
                      alt="candy"
                      className="w-8 h-8"
                      style={{imageRendering: 'pixelated'}}
                    />
                  </div>
                ))}

                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${user?.selected_pokemon_id || 1}.png`}
                  alt="Pokemon"
                  className={`w-3/5 h-3/5 object-contain transition-all duration-150 ${
                    isAnimating ? 'scale-110 brightness-110' : 'scale-100'
                  }`}
                  style={{
                    imageRendering: 'pixelated',
                    filter: isAnimating
                      ? 'drop-shadow(0 0 8px rgba(255, 193, 7, 0.8))'
                      : 'none',
                    animation:
                      'idle-bounce 2s ease-in-out infinite, walk-horizontal 4s ease-in-out infinite',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Nintendo GAME BOY text */}
          <div className="mb-6 text-center">
            <p
              className="pixel-font text-[10px] tracking-wider mb-0.5"
              style={{color: isDarkMode ? '#0f0f1a' : '#2a2a3e'}}
            >
              Nintendo
            </p>
            <p
              className="pixel-font text-[8px] font-bold tracking-widest italic"
              style={{color: isDarkMode ? '#0f0f1a' : '#2a2a3e'}}
            >
              GAME BOY<span className="text-[6px]">™</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full px-2 mb-4">
            {/* D-Pad */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-5 rounded-sm shadow-md"
                  style={{backgroundColor: isDarkMode ? '#0f0f1a' : '#2a2a3e'}}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-5 h-16 rounded-sm shadow-md"
                  style={{backgroundColor: isDarkMode ? '#0f0f1a' : '#2a2a3e'}}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-5 h-5 rounded-sm"
                  style={{backgroundColor: isDarkMode ? '#000000' : '#1a1a2e'}}
                ></div>
              </div>
            </div>

            {/* A, B Buttons */}
            <div className="flex gap-3 items-center -rotate-[20deg]">
              <div className="flex flex-col items-center">
                <Button
                  size="sm"
                  onClick={handleClick}
                  disabled={!isAuthenticated}
                  bgColor="#8B3A62"
                  className="w-14 h-14 rounded-full border-2 shadow-lg pixel-font text-sm text-white font-bold p-0"
                  style={
                    {
                      borderColor: '#2a2a3e',
                      '--custom-inner-border-color': '#2a2a3e',
                    } as React.CSSProperties
                  }
                >
                  B
                </Button>
              </div>
              <div className="flex flex-col items-center -mt-4">
                <Button
                  size="sm"
                  onClick={handleClick}
                  disabled={!isAuthenticated}
                  bgColor="#8B3A62"
                  className="w-14 h-14 rounded-full border-2 shadow-lg pixel-font text-sm text-white font-bold p-0"
                  style={
                    {
                      borderColor: '#2a2a3e',
                      '--custom-inner-border-color': '#2a2a3e',
                    } as React.CSSProperties
                  }
                >
                  A
                </Button>
              </div>
            </div>
          </div>

          {/* Start/Select Buttons */}
          <div className="flex gap-4 items-center mb-2">
            <Button
              size="sm"
              className="w-10 h-3 rounded-full shadow-md p-0"
              style={{
                backgroundColor: '#4a4a5e',
                borderColor: '#2a2a3e',
              }}
            />
            <Button
              size="sm"
              className="w-10 h-3 rounded-full shadow-md p-0"
              style={{
                backgroundColor: '#4a4a5e',
                borderColor: '#2a2a3e',
              }}
            />
          </div>

          {/* Speaker Holes */}
          <div className="flex gap-1 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: isDarkMode ? '#4a4a4a' : '#6a6a6a',
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats and Upgrades */}
      <div className="flex flex-col gap-6 w-full max-w-md lg:max-w-lg">
        {/* Rare Candy Counter */}
        <Card
          className="border-4 p-6 relative overflow-hidden"
          style={{
            background: isDarkMode
              ? 'linear-gradient(to bottom right, #1f2937, #111827)'
              : 'linear-gradient(to bottom right, #ebe9e5, #e0deda)',
            borderColor: isDarkMode ? '#374151' : '#bbb7b2',
            boxShadow: isDarkMode
              ? '8px 8px 0px 0px rgba(55,65,81,1)'
              : '8px 8px 0px 0px rgba(187,183,178,1)',
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{backgroundColor: isDarkMode ? '#fbbf24' : '#fde047'}}
          ></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="border-2 p-2 rounded-md shadow-md"
                style={{
                  backgroundColor: isDarkMode ? 'var(--card)' : 'var(--card)',
                  borderColor: isDarkMode ? '#374151' : '#bbb7b2',
                }}
              >
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                  alt="Rare Candy"
                  className="w-8 h-8"
                  style={{imageRendering: 'pixelated'}}
                />
              </div>
              <span
                className="pixel-font text-base font-bold"
                style={{
                  color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
                }}
              >
                Rare Candy
              </span>
            </div>
            <div
              className="border-2 px-4 py-2 shadow-md"
              style={{
                backgroundColor: isDarkMode ? 'var(--card)' : 'var(--card)',
                borderColor: isDarkMode ? '#374151' : '#bbb7b2',
              }}
            >
              <span
                className="pixel-font text-2xl font-bold"
                style={{
                  color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
                }}
              >
                {formatNumber(Math.floor(getCurrentCandy()))}
              </span>
            </div>
          </div>
        </Card>

        {/* Upgrades */}
        <Card
          className="border-4 p-6"
          style={{
            background: isDarkMode
              ? 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937)'
              : 'linear-gradient(to bottom right, #ebe9e5, #dbd9d5, #ebe9e5)',
            borderColor: isDarkMode ? '#374151' : '#bbb7b2',
            boxShadow: isDarkMode
              ? '8px 8px 0px 0px rgba(55,65,81,1)'
              : '8px 8px 0px 0px rgba(187,183,178,1)',
          }}
        >
          <div
            className="border-2 p-3 mb-4 shadow-inner"
            style={{
              background: isDarkMode
                ? 'linear-gradient(to right, #dc2626, #ea580c, #ca8a04)'
                : 'linear-gradient(to right, #ef4444, #fb923c, #fde047)',
              borderColor: isDarkMode ? '#374151' : '#bbb7b2',
            }}
          >
            <h2
              className="pixel-font text-base font-bold text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
              style={{color: 'white'}}
            >
              POKEMON UPGRADES
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {Object.entries(stats)
              .filter(([key]) => key !== '__typename')
              .map(([key, value]) => {
                const cost = getUpgradeCost(key as keyof typeof stats);
                const description = getStatDescription(
                  key as keyof typeof stats
                );
                return (
                  <div
                    key={key}
                    className="border-2 p-3 shadow-md hover:shadow-lg transition-shadow"
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(to bottom right, #1f2937, #111827)'
                        : 'linear-gradient(to bottom right, var(--card), #e0deda)',
                      borderColor: isDarkMode ? '#374151' : '#bbb7b2',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-2 h-8 border"
                          style={{
                            backgroundColor:
                              key === 'hp'
                                ? isDarkMode
                                  ? '#16a34a'
                                  : '#22c55e'
                                : key === 'attack'
                                  ? isDarkMode
                                    ? '#ea580c'
                                    : '#f97316'
                                  : key === 'defense'
                                    ? isDarkMode
                                      ? '#d97706'
                                      : '#fb923c'
                                    : key === 'spAttack'
                                      ? isDarkMode
                                        ? '#2563eb'
                                        : '#3b82f6'
                                      : key === 'spDefense'
                                        ? isDarkMode
                                          ? '#1d4ed8'
                                          : '#60a5fa'
                                        : isDarkMode
                                          ? '#7c3aed'
                                          : '#a855f7',
                            borderColor: isDarkMode ? '#374151' : '#bbb7b2',
                          }}
                        ></div>
                        <div className="flex flex-col">
                          <span
                            className="pixel-font text-xs"
                            style={{
                              color: isDarkMode
                                ? 'var(--muted-foreground)'
                                : 'var(--muted-foreground)',
                            }}
                          >
                            {key === 'hp'
                              ? 'HP'
                              : key === 'spAttack'
                                ? 'Sp. Attack'
                                : key === 'spDefense'
                                  ? 'Sp. Defense'
                                  : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span
                            className="pixel-font text-lg font-bold"
                            style={{
                              color: isDarkMode
                                ? 'var(--foreground)'
                                : 'var(--foreground)',
                            }}
                          >
                            LV {String(value)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUpgrade(key as keyof typeof stats)}
                        disabled={
                          !isAuthenticated ||
                          getCurrentCandy() < cost ||
                          isLoading ||
                          key === 'spDefense' ||
                          key === 'speed'
                        }
                        bgColor={
                          key === 'hp'
                            ? isDarkMode
                              ? '#16a34a'
                              : '#4ade80'
                            : key === 'attack'
                              ? isDarkMode
                                ? '#ea580c'
                                : '#fb923c'
                              : key === 'defense'
                                ? isDarkMode
                                  ? '#d97706'
                                  : '#fbbf24'
                                : key === 'spAttack'
                                  ? isDarkMode
                                    ? '#2563eb'
                                    : '#60a5fa'
                                  : key === 'spDefense'
                                    ? isDarkMode
                                      ? '#1d4ed8'
                                      : '#93c5fd'
                                    : isDarkMode
                                      ? '#7c3aed'
                                      : '#a855f7'
                        }
                        className="pixel-font text-xs text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
                          ↑ {formatNumber(cost)}
                        </span>
                      </Button>
                    </div>
                    <div className="ml-5">
                      <span className="pixel-font text-[10px] text-gray-500 italic">
                        {description}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
