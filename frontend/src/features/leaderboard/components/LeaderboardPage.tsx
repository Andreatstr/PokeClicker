import {useQuery} from '@apollo/client';
import {GET_LEADERBOARD} from '@/lib/graphql';
import {LeaderboardTable} from './LeaderboardTable';
import {LoadingSpinner} from '@/components';

interface LeaderboardPageProps {
  isDarkMode: boolean;
}

export function LeaderboardPage({isDarkMode}: LeaderboardPageProps) {
  const {data, loading, error} = useQuery(GET_LEADERBOARD, {
    variables: {input: {limit: 50}},
    pollInterval: 60000, // Update every minute
  });

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
      <h1
        className="text-2xl font-bold mb-6 pixel-font"
        style={{color: 'var(--foreground)'}}
      >
        Global Leaderboard
      </h1>

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
