import {useState, useEffect, useRef, useCallback} from 'react';
import {Button} from '@/components/ui/pixelact-ui/button';
import {Card} from '@/components/ui/pixelact-ui/card';
import {useAuth} from '@/hooks/useAuth';
import {useGameMutations} from '@/hooks/useGameMutations';

interface Candy {
  id: number;
  x: number;
}

export function PokeClicker() {
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

  // Batching state
  const [pendingCandyAmount, setPendingCandyAmount] = useState(0);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<number>(Date.now());

  // Error state
  const [displayError, setDisplayError] = useState<string | null>(null);

  // Sync local state with user data when it changes
  useEffect(() => {
    if (user) {
      setStats(user.stats);
      // Reset pending candy when we get fresh data from server
      setPendingCandyAmount(0);
    }
  }, [user]);

  // Get the reliable candy count (server value + pending)
  const getCurrentCandy = () => (user?.rare_candy || 0) + pendingCandyAmount;
  const getSyncedCandy = () => user?.rare_candy || 0;

  const flushPendingCandy = useCallback(async () => {
    if (pendingCandyAmount === 0 || !isAuthenticated) return;

    const amountToSync = pendingCandyAmount;
    setPendingCandyAmount(0);
    lastSyncRef.current = Date.now();

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }

    try {
      const updatedUser = await updateRareCandy(amountToSync, updateUser);
      if (updatedUser) {
        // Server is the source of truth - this will trigger the useEffect to update
      }
    } catch (err) {
      console.error('Failed to sync candy:', err);
      setDisplayError('Failed to save progress. Retrying...');
      // Re-add the pending amount to try again
      setPendingCandyAmount(amountToSync);
      setTimeout(() => setDisplayError(null), 3000);
    }
  }, [pendingCandyAmount, isAuthenticated, updateRareCandy, updateUser]);

  // Batch update clicks every 2 seconds or after 10 clicks
  useEffect(() => {
    if (pendingCandyAmount === 0 || !isAuthenticated) return;

    const shouldFlush =
      pendingCandyAmount >= 10 || Date.now() - lastSyncRef.current >= 2000;

    if (shouldFlush) {
      flushPendingCandy();
    } else if (!batchTimerRef.current) {
      // Set a timer to flush after 2 seconds
      batchTimerRef.current = setTimeout(() => {
        flushPendingCandy();
      }, 2000);
    }

    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
    };
  }, [pendingCandyAmount, isAuthenticated, flushPendingCandy]);

  // Calculate candies per click based on attack and sp. attack
  const getCandiesPerClick = () => {
    return stats.attack + Math.floor(stats.spAttack * 0.5);
  };

  // Calculate upgrade cost (exponential growth)
  const getUpgradeCost = (stat: keyof typeof stats) => {
    const level = stats[stat];
    return Math.floor(10 * Math.pow(1.5, level - 1));
  };

  // Effect for passive income
  useEffect(() => {
    if (!isAuthenticated) return;

    const passiveIncome =
      Math.floor((stats.hp - 1) * 0.5) + Math.floor((stats.defense - 1) * 0.3);

    if (passiveIncome > 0) {
      const interval = setInterval(() => {
        setPendingCandyAmount((prev) => prev + passiveIncome);
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

    // Add to pending candy
    setPendingCandyAmount((prev) => prev + candiesEarned);
    setIsAnimating(true);

    // Add floating candy animation
    const newCandy: Candy = {
      id: Date.now() + Math.random(),
      x: Math.random() * 60 + 20, // Random position between 20% and 80%
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

    // Flush pending candy updates before upgrading to ensure server has latest amount
    if (pendingCandyAmount > 0) {
      await flushPendingCandy();
    }

    // Optimistic update for stats only
    const oldStat = stats[stat];
    setStats((prev: typeof stats) => ({...prev, [stat]: prev[stat] + 1}));

    try {
      const updatedUser = await upgradeStat(stat, updateUser);
      if (updatedUser) {
        // Server is the source of truth - useEffect will sync
        setStats(updatedUser.stats);
      }
    } catch (err) {
      console.error('Failed to upgrade stat:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to upgrade stat. Please try again.';
      setDisplayError(errorMessage);
      // Revert optimistic update
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
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Display errors */}
      {displayError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {displayError}
          <button
            onClick={() => setDisplayError(null)}
            className="ml-4 text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Show unauthenticated message */}
      {!isAuthenticated && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl z-50 text-center">
          <h2 className="pixel-font text-2xl mb-4">Please Log In</h2>
          <p className="pixel-font text-sm mb-4">
            You need to log in to play the clicker game and save your progress.
          </p>
        </div>
      )}

      {/* GameBoy Console */}
      <Card className="bg-[#9FA0A0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md lg:max-w-lg">
        <div className="flex flex-col items-center">
          {/* Screen Area */}
          <div className="bg-[#3E3E52] rounded-md p-3 mb-3 w-full shadow-inner border-2 border-[#2a2a3e]">
            {/* Screen Label */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-600 border border-black"></div>
                <span className="text-[6px] pixel-font text-gray-300 tracking-wider">
                  BATTERY
                </span>
              </div>
              <span className="text-[7px] pixel-font text-gray-300 tracking-wider">
                DOT MATRIX WITH STEREO SOUND
              </span>
            </div>

            {/* Screen */}
            <div className="bg-[#8a8a4a] p-2 shadow-inner border-2 border-[#1a1a2e]">
              <button
                onClick={handleClick}
                className="w-full aspect-[10/9] flex items-end justify-center border-none cursor-pointer p-0 pb-8 focus:outline-none focus:ring-2 focus:ring-yellow-400 relative overflow-hidden"
                aria-label="Click Charizard to earn rare candy"
                disabled={!isAuthenticated}
                style={{
                  backgroundImage: `url('${import.meta.env.BASE_URL}pokemon-bg.png')`,
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
                    className="absolute pointer-events-none"
                    style={{
                      left: `${candy.x}%`,
                      bottom: '40%',
                      animation: 'float-up 1s ease-out forwards',
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}candy.png`}
                      alt="candy"
                      className="w-8 h-8"
                      style={{imageRendering: 'pixelated'}}
                    />
                  </div>
                ))}

                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
                  alt="Charizard"
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
            <p className="pixel-font text-[10px] text-[#2a2a3e] tracking-wider mb-0.5">
              Nintendo
            </p>
            <p className="pixel-font text-[8px] text-[#2a2a3e] font-bold tracking-widest italic">
              GAME BOY<span className="text-[6px]">™</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full px-2 mb-4">
            {/* D-Pad */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#2a2a3e] w-16 h-5 rounded-sm shadow-md"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#2a2a3e] w-5 h-16 rounded-sm shadow-md"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 bg-[#1a1a2e] rounded-sm"></div>
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
                  className="w-14 h-14 rounded-full border-2 border-[#2a2a3e] shadow-lg pixel-font text-sm text-white font-bold p-0"
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
                  className="w-14 h-14 rounded-full border-2 border-[#2a2a3e] shadow-lg pixel-font text-sm text-white font-bold p-0"
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
              className="w-10 h-3 rounded-full bg-[#4a4a5e] hover:bg-[#3a3a4e] border border-[#2a2a3e] shadow-md p-0"
            />
            <Button
              size="sm"
              className="w-10 h-3 rounded-full bg-[#4a4a5e] hover:bg-[#3a3a4e] border border-[#2a2a3e] shadow-md p-0"
            />
          </div>

          {/* Speaker Holes */}
          <div className="flex gap-1 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="w-1 h-1 rounded-full bg-[#6a6a6a]"
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
        <Card className="bg-gradient-to-br from-[#f0e6d2] to-[#e8d8b8] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white border-2 border-black p-2 rounded-md shadow-md">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                  alt="Rare Candy"
                  className="w-8 h-8"
                  style={{imageRendering: 'pixelated'}}
                />
              </div>
              <span className="pixel-font text-base font-bold text-black">
                Rare Candy
              </span>
            </div>
            <div className="bg-white border-2 border-black px-4 py-2 shadow-md">
              <span className="pixel-font text-2xl font-bold text-black">
                {Math.floor(getCurrentCandy())}
              </span>
            </div>
          </div>
        </Card>

        {/* Upgrades */}
        <Card className="bg-gradient-to-br from-[#e8e8d0] via-[#d8d8c0] to-[#e8e8d0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 border-2 border-black p-3 mb-4 shadow-inner">
            <h2 className="pixel-font text-base font-bold text-white text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
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
                    className="bg-gradient-to-br from-white to-gray-100 border-2 border-black p-3 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-2 h-8 ${
                            key === 'hp'
                              ? 'bg-green-500'
                              : key === 'attack'
                                ? 'bg-orange-500'
                                : key === 'defense'
                                  ? 'bg-orange-400'
                                  : key === 'spAttack'
                                    ? 'bg-blue-500'
                                    : key === 'spDefense'
                                      ? 'bg-blue-400'
                                      : 'bg-purple-500'
                          } border border-black`}
                        ></div>
                        <div className="flex flex-col">
                          <span className="pixel-font text-xs text-gray-600">
                            {key === 'hp'
                              ? 'HP'
                              : key === 'spAttack'
                                ? 'Sp. Attack'
                                : key === 'spDefense'
                                  ? 'Sp. Defense'
                                  : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="pixel-font text-lg font-bold text-black">
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
                            ? '#4ade80'
                            : key === 'attack'
                              ? '#fb923c'
                              : key === 'defense'
                                ? '#fbbf24'
                                : key === 'spAttack'
                                  ? '#60a5fa'
                                  : key === 'spDefense'
                                    ? '#93c5fd'
                                    : '#a855f7'
                        }
                        className="pixel-font text-xs text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
                          ↑ {cost}
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
