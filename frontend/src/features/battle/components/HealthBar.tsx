interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  side: 'player' | 'opponent';
  isDarkMode?: boolean;
}

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
    <div
      className={`w-full ${side === 'opponent' ? 'text-right' : 'text-left'}`}
    >
      <div
        className="pixel-font text-xs mb-1 text-black"
        style={{
          textShadow:
            '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white',
        }}
      >
        {label}
      </div>
      <div
        className={`h-4 border-2 ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-black bg-white'
        } relative overflow-hidden`}
      >
        <div
          className={`h-full ${getHealthColor()} transition-all duration-300 ease-out`}
          style={{width: `${percentage}%`}}
        />
      </div>
      <div
        className="pixel-font text-[10px] text-black mt-0.5"
        style={{
          textShadow:
            '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white',
        }}
      >
        {Math.floor(current)} HP
      </div>
    </div>
  );
}
