import {useEffect, useState} from 'react';
import {useQuery, useMutation} from '@apollo/client';
import {GET_LEADERBOARD, UPDATE_LEADERBOARD_PREFERENCE} from '@/lib/graphql';
import {LeaderboardTable} from './LeaderboardTable';
import {LoadingSpinner} from '@/components';
import {Checkbox} from '@ui/pixelact';
import {useAuth} from '@features/auth';
import type {CheckedState} from '@radix-ui/react-checkbox';

interface LeaderboardPageProps {
  isDarkMode: boolean;
}

export function LeaderboardPage({isDarkMode}: LeaderboardPageProps) {
  const {user} = useAuth();
  const [checked, setChecked] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const {data, loading, error, refetch} = useQuery(GET_LEADERBOARD, {
    variables: {input: {limit: 50}},
    pollInterval: 60000, // Update every minute
  });

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
    // refetch();
  }, [user, checked]);

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
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1
          className="text-2xl font-bold mb-6 pixel-font"
          style={{color: 'var(--foreground)'}}
        >
          Global Leaderboard
        </h1>

        {user && checked !== null && (
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Checkbox
              id="show-in-leaderboard"
              checked={checked}
              onCheckedChange={handleCheckedChange}
              disabled={isUpdating}
            />
            <label
              htmlFor="show-in-leaderboard"
              className="text-sm"
              style={{color: 'var(--foreground)'}}
            >
              {isUpdating ? 'Updating...' : 'Show me in leaderboard'}
            </label>
          </div>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2
            className="text-xl font-semibold mb-4 pixel-font"
            style={{color: 'var(--foreground)'}}
          >
            Candy League
          </h2>
          <LeaderboardTable
            entries={data.getLeaderboard.candyLeague}
            userRank={data.getLeaderboard.userCandyRank}
            scoreLabel="Rare Candy"
            isDarkMode={isDarkMode}
          />
        </div>

        <div>
          <h2
            className="text-xl font-semibold mb-4 pixel-font"
            style={{color: 'var(--foreground)'}}
          >
            Pokemon League
          </h2>
          <LeaderboardTable
            entries={data.getLeaderboard.pokemonLeague}
            userRank={data.getLeaderboard.userPokemonRank}
            scoreLabel="Pokemon Count"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
