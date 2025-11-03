import {useAuth} from '@features/auth';

interface LeaderboardEntry {
  position: number;
  username: string;
  score: number;
  userId: string;
  showInLeaderboard: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  userRank: number | null;
  scoreLabel: string;
  isDarkMode: boolean;
}

export function LeaderboardTable({
  entries,
  userRank,
  scoreLabel,
  isDarkMode,
}: LeaderboardTableProps) {
  const {user} = useAuth();

  return (
    <div
      className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <table className="w-full">
        <thead>
          <tr
            className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <th className="p-3 text-left" style={{color: 'var(--foreground)'}}>
              Rank
            </th>
            <th className="p-3 text-left" style={{color: 'var(--foreground)'}}>
              Player
            </th>
            <th className="p-3 text-right" style={{color: 'var(--foreground)'}}>
              {scoreLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.userId}
              className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${
                user?._id === entry.userId
                  ? isDarkMode
                    ? 'bg-blue-900'
                    : 'bg-blue-50'
                  : ''
              }`}
            >
              <td className="p-3" style={{color: 'var(--foreground)'}}>
                #{entry.position}
              </td>
              <td className="p-3" style={{color: 'var(--foreground)'}}>
                <span className={user?._id === entry.userId ? 'font-bold' : ''}>
                  {entry.username}
                </span>
              </td>
              <td
                className="p-3 text-right"
                style={{color: 'var(--foreground)'}}
              >
                {entry.score.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {userRank && (
        <div
          className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <span className="pixel-font" style={{color: 'var(--foreground)'}}>
            Your Rank: #{userRank}
          </span>
        </div>
      )}
    </div>
  );
}
