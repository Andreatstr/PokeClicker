import {useAuth} from '@features/auth/hooks/useAuth';
import {formatNumber} from '@/lib/formatNumber';

interface RanksEntry {
  position: number;
  username: string;
  score: number;
  userId: string;
  showInRanks: boolean;
}

interface RanksTableProps {
  entries: RanksEntry[];
  userRank: number | null;
  scoreLabel: string;
  isDarkMode: boolean;
}

export function RanksTable({
  entries,
  userRank,
  scoreLabel,
  isDarkMode,
}: RanksTableProps) {
  const {user} = useAuth();

  return (
    <div
      className={`rounded-lg shadow overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <table className="w-full min-w-full table-fixed">
        <thead>
          <tr
            className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <th
              className="px-1 py-2 sm:p-3 text-left text-xs sm:text-sm w-12 sm:w-20"
              style={{color: 'var(--foreground)'}}
            >
              Rank
            </th>
            <th
              className="px-1 py-2 sm:p-3 text-left text-xs sm:text-sm"
              style={{color: 'var(--foreground)'}}
            >
              Player
            </th>
            <th
              className="px-1 py-2 sm:p-3 text-right text-xs sm:text-sm w-16 sm:w-32"
              style={{color: 'var(--foreground)'}}
            >
              <span className="hidden sm:inline">{scoreLabel}</span>
              <span className="sm:hidden text-[10px]">
                {scoreLabel === 'Rare Candy' ? 'Candy' : 'Pkmn'}
              </span>
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
                    : 'bg-blue-300'
                  : ''
              }`}
            >
              <td
                className="px-1 py-2 sm:p-3 text-xs sm:text-sm w-12 sm:w-20"
                style={{color: 'var(--foreground)'}}
              >
                #{entry.position}
              </td>
              <td
                className="px-1 py-2 sm:p-3 text-xs sm:text-sm break-all overflow-hidden"
                style={{color: 'var(--foreground)'}}
              >
                <span className={user?._id === entry.userId ? 'font-bold' : ''}>
                  {entry.username}
                </span>
              </td>
              <td
                className="px-1 py-2 sm:p-3 text-right text-xs sm:text-sm w-16 sm:w-32 whitespace-nowrap"
                style={{color: 'var(--foreground)'}}
              >
                {formatNumber(entry.score)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {userRank && (
        <div
          className={`p-2 sm:p-3 border-t text-xs sm:text-sm ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <span className="pixel-font" style={{color: 'var(--foreground)'}}>
            Your Rank: #{userRank}
          </span>
        </div>
      )}
    </div>
  );
}
