import {useEffect, useState} from 'react';
import {useQuery, useMutation} from '@apollo/client';
import {GET_LEADERBOARD, UPDATE_LEADERBOARD_PREFERENCE} from '@/lib/graphql';
import {LeaderboardTable} from './LeaderboardTable';
import {LoadingSpinner} from '@/components';
import {Checkbox, Button} from '@ui/pixelact';
import {useAuth} from '@features/auth';
import type {CheckedState} from '@radix-ui/react-checkbox';

interface LeaderboardPageProps {
  isDarkMode: boolean;
}

export function LeaderboardPage({isDarkMode}: LeaderboardPageProps) {
  const [activeLeague, setActiveLeague] = useState<'candy' | 'pokemon'>(
    'candy'
  );
  const [limit, setLimit] = useState(10);
  const [canRefresh, setCanRefresh] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(0);

  const {user} = useAuth();
  const [checked, setChecked] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const {data, loading, error, refetch} = useQuery(GET_LEADERBOARD, {
    variables: {input: {limit}},
    pollInterval: 60000, // Update every minute
  });

  const handleRefresh = () => {
    if (canRefresh) {
      refetch();
      setCanRefresh(false);
      setRefreshTimer(10);
    }
  };

  const [updatePreference] = useMutation(UPDATE_LEADERBOARD_PREFERENCE, {
    onCompleted: (data) => {
      if (data?.updateLeaderboardPreference) {
        setChecked(data.updateLeaderboardPreference.showInLeaderboard);
        refetch();
      }
    },
    onError(error) {
      console.error('Failed to update leaderboard preference:', error);
      setChecked(user?.showInLeaderboard !== false);
    },
  });

  useEffect(() => {
    if (user && checked === null) {
      setChecked(user.showInLeaderboard !== false);
    }
    if (!canRefresh && refreshTimer > 0) {
      const timer = setInterval(() => {
        setRefreshTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (refreshTimer === 0) {
      setCanRefresh(true);
    }
    // refetch();
  }, [user, checked, refreshTimer, canRefresh]);

  const handleCheckedChange = async (state: CheckedState) => {
    if (!user) return;

    const newValue = state === true;
    setChecked(newValue);
    setIsUpdating(true);

    try {
      await updatePreference({
        variables: {showInLeaderboard: newValue},
      });
      // refetch();
    } catch (error) {
      console.error('Failed to update leaderboard preference:', error);
      setChecked(user?.showInLeaderboard !== false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <LoadingSpinner
        message="Loading leaderboard..."
        isDarkMode={isDarkMode}
      />
    );

  if (error)
    return (
      <div className="text-center text-red-500">
        Error loading leaderboard: {error.message}
      </div>
    );

  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      {/* Header */}
      <h1
        className="text-xl sm:text-2xl font-bold pixel-font text-center mb-6"
        style={{color: 'var(--foreground)'}}
      >
        Global Leaderboard
      </h1>

      {/* Leaderboard Table */}
      <div className="w-full">
        {/* Controls row - aligned with table edges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 w-full">
          {/* Left side: League toggle buttons */}
          <div className="flex gap-2">
            <Button
              className={`text-xs sm:text-sm ${
                activeLeague === 'candy'
                  ? 'bg-gray-800 text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              disabled={activeLeague === 'candy'}
              onClick={() => setActiveLeague('candy')}
            >
              Candy League
            </Button>
            <Button
              className={`text-xs sm:text-sm ${
                activeLeague === 'pokemon'
                  ? 'bg-gray-800 text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              disabled={activeLeague === 'pokemon'}
              onClick={() => setActiveLeague('pokemon')}
            >
              Pokemon League
            </Button>
          </div>

          {/* Right side: Checkbox + Refresh button */}
          {user && checked !== null && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-in-leaderboard"
                  checked={checked}
                  onCheckedChange={handleCheckedChange}
                  disabled={isUpdating}
                />
                <label
                  htmlFor="show-in-leaderboard"
                  className="text-xs sm:text-sm whitespace-nowrap"
                  style={{color: 'var(--foreground)'}}
                >
                  Show me
                </label>
              </div>

              <Button
                variant="default"
                onClick={handleRefresh}
                disabled={!canRefresh}
                className="text-xs sm:text-sm"
              >
                {canRefresh ? 'Refresh' : `Wait ${refreshTimer}s`}
              </Button>
            </div>
          )}
        </div>
        <LeaderboardTable
          entries={
            activeLeague === 'candy'
              ? data.getLeaderboard.candyLeague
              : data.getLeaderboard.pokemonLeague
          }
          userRank={
            activeLeague === 'candy'
              ? data.getLeaderboard.userCandyRank
              : data.getLeaderboard.userPokemonRank
          }
          scoreLabel={activeLeague === 'candy' ? 'Rare Candy' : 'Pokemon Count'}
          isDarkMode={isDarkMode}
        />

        {limit < data.getLeaderboard.totalPlayers && (
          <div className="mt-4 text-center">
            <Button
              variant="default"
              onClick={() => setLimit((prev) => prev + 10)}
              className="text-xs sm:text-sm"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
