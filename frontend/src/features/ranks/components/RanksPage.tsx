import {useEffect, useState} from 'react';
import {useQuery, useMutation} from '@apollo/client';
import {GET_RANKS, UPDATE_RANKS_PREFERENCE} from '@/lib/graphql';
import {RanksTable} from './RanksTable';
import {LoadingSpinner} from '@/components';
import {Checkbox, Button} from '@ui/pixelact';
import {useAuth} from '@features/auth';
import type {CheckedState} from '@radix-ui/react-checkbox';

interface RanksPageProps {
  isDarkMode: boolean;
}

export function RanksPage({isDarkMode}: RanksPageProps) {
  const [activeLeague, setActiveLeague] = useState<'candy' | 'pokemon'>(
    'candy'
  );
  const [limit, setLimit] = useState(10);
  const [canRefresh, setCanRefresh] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(0);

  const {user, updateUser} = useAuth();
  const [checked, setChecked] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const {data, loading, error, refetch} = useQuery(GET_RANKS, {
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

  const [updatePreference] = useMutation(UPDATE_RANKS_PREFERENCE, {
    onCompleted: (data) => {
      if (data?.updateRanksPreference) {
        // Update the AuthContext user state and localStorage
        updateUser(data.updateRanksPreference);
        // Refetch ranks to reflect changes
        refetch();
      }
    },
    onError(error) {
      console.error('Failed to update ranks preference:', error);
      setChecked(user?.showInRanks !== false);
    },
  });

  useEffect(() => {
    if (user) {
      // Always sync checkbox with user preference
      const userPreference = user.showInRanks !== false;
      if (checked !== userPreference) {
        setChecked(userPreference);
      }
    }
  }, [user?.showInRanks]);

  useEffect(() => {
    if (!canRefresh && refreshTimer > 0) {
      const timer = setInterval(() => {
        setRefreshTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (refreshTimer === 0) {
      setCanRefresh(true);
    }
  }, [refreshTimer, canRefresh]);

  const handleCheckedChange = async (state: CheckedState) => {
    if (!user) return;

    const newValue = state === true;
    setChecked(newValue);
    setIsUpdating(true);

    try {
      await updatePreference({
        variables: {showInRanks: newValue},
      });
      // refetch();
    } catch (error) {
      console.error('Failed to update ranks preference:', error);
      setChecked(user?.showInRanks !== false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <LoadingSpinner message="Loading ranks..." isDarkMode={isDarkMode} />
    );

  if (error)
    return (
      <div className="text-center text-red-500">
        Error loading ranks: {error.message}
      </div>
    );

  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      {/* Header */}
      <h1
        className="text-xl sm:text-2xl font-bold pixel-font text-center mb-6"
        style={{color: 'var(--foreground)'}}
      >
        Global Ranks
      </h1>

      {/* Ranks Table */}
      <div className="w-full">
        {/* Controls row - aligned with table edges */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between gap-2 mb-4 w-full">
          {/* League toggle buttons */}
          <div className="flex justify-center md:justify-start gap-2">
            <Button
              className={`flex-1 md:flex-none text-xs sm:text-sm ${
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
              className={`flex-1 md:flex-none text-xs sm:text-sm ${
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

          {/* Checkbox + Refresh button */}
          {user && checked !== null && (
            <div className="flex justify-center md:justify-end items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-in-ranks"
                  checked={checked}
                  onCheckedChange={handleCheckedChange}
                  disabled={isUpdating}
                />
                <label
                  htmlFor="show-in-ranks"
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
        <RanksTable
          entries={
            activeLeague === 'candy'
              ? data.getRanks.candyLeague
              : data.getRanks.pokemonLeague
          }
          userRank={
            activeLeague === 'candy'
              ? data.getRanks.userCandyRank
              : data.getRanks.userPokemonRank
          }
          scoreLabel={activeLeague === 'candy' ? 'Rare Candy' : 'Pokemon Count'}
          isDarkMode={isDarkMode}
        />

        {limit < data.getRanks.totalPlayers && (
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
