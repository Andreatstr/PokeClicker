import {Card} from '@ui/pixelact';
import {formatNumber} from '@/lib/formatNumber';

interface RareCandyCounterProps {
  isDarkMode: boolean;
  candyCount: string;
}

export function RareCandyCounter({
  isDarkMode,
  candyCount,
}: RareCandyCounterProps) {
  return (
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
        aria-hidden="true"
      ></div>
      <dl className="relative flex items-center justify-between">
        <dt className="flex items-center gap-3">
          <span
            className="border-2 p-2 rounded-md shadow-md inline-flex"
            style={{
              backgroundColor: isDarkMode ? 'var(--card)' : 'var(--card)',
              borderColor: isDarkMode ? '#374151' : '#bbb7b2',
            }}
          >
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
              alt=""
              className="w-8 h-8"
              style={{imageRendering: 'pixelated'}}
              aria-hidden="true"
            />
          </span>
          <span
            className="pixel-font text-base font-bold"
            style={{
              color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
            }}
          >
            Rare Candy
          </span>
        </dt>
        <dd
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
            aria-label={`${formatNumber(candyCount)} Rare Candy`}
          >
            {formatNumber(candyCount)}
          </span>
        </dd>
      </dl>
    </Card>
  );
}
