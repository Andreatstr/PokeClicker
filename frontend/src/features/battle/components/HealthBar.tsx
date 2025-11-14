interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  side: 'player' | 'opponent';
  isDarkMode?: boolean;
}

/**
 * Animated health bar for battle screens.
 *
 * Features:
 * - Color-coded health (green > 50%, yellow > 20%, red <= 20%)
 * - Smooth transition animations on HP change
 * - Text shadow outline for readability on any background
 * - Flips text alignment based on player/opponent side
 *
 * Accessibility:
 * - role="progressbar" with aria-valuenow/min/max
 * - Readable HP text below bar
 * - High contrast text with white outline
 */
export function HealthBar({
  current,
  max,
  label,
  side,
  isDarkMode = false,
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  const getHealthColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <figure
      className={`w-full select-none ${side === 'opponent' ? 'text-right' : 'text-left'}`}
      aria-label={`${label} health bar`}
    >
      <figcaption
        className="pixel-font text-xs mb-1 text-black"
        style={{
          textShadow:
            '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white',
        }}
      >
        {label}
      </figcaption>
      <div
        className={`h-4 border-2 ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-black bg-white'
        } relative overflow-hidden`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${Math.floor(current)} out of ${max} HP`}
      >
        <div
          className={`h-full ${getHealthColor()} transition-all duration-300 ease-out`}
          style={{width: `${percentage}%`}}
          aria-hidden="true"
        />
      </div>
      <p
        className="pixel-font text-[10px] text-black mt-0.5"
        style={{
          textShadow:
            '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white',
        }}
      >
        {Math.floor(current)} HP
      </p>
    </figure>
  );
}
