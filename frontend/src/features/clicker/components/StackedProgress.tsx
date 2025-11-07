interface StackedProgressProps {
  baseValue: number;
  yourValue: number;
  max?: number;
  color?: string;
  upgradeColor?: string;
}

export function StackedProgress({
  baseValue,
  yourValue,
  max = 255,
  color = 'bg-gray-300',
  upgradeColor = 'bg-gray-500',
}: StackedProgressProps) {
  const basePercent = (baseValue / max) * 100;
  const upgradePercent = ((yourValue - baseValue) / max) * 100;

  return (
    <div
      className="h-[16px] bg-[#e8e8d0] border-2 border-black shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)] relative"
      role="progressbar"
      aria-valuenow={yourValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`Stat value: ${yourValue} out of ${max} (base: ${baseValue})`}
    >
      <div
        className={`h-full ${color}`}
        style={{width: `${basePercent}%`}}
        aria-hidden="true"
      />
      <div
        className={`h-full ${upgradeColor} absolute top-0`}
        style={{width: `${upgradePercent}%`, left: `${basePercent}%`}}
        aria-hidden="true"
      />
    </div>
  );
}
