interface StackedProgressProps {
  baseValue: number;
  yourValue: number;
  max?: number;
}

export function StackedProgress({
  baseValue,
  yourValue,
  max = 255,
}: StackedProgressProps) {
  const basePercent = (baseValue / max) * 100;
  const upgradePercent = ((yourValue - baseValue) / max) * 100;

  return (
    <div className="h-[16px] bg-[#e8e8d0] border-2 border-black shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)] relative">
      <div className="h-full bg-gray-400" style={{width: `${basePercent}%`}} />
      <div
        className="h-full bg-green-500 absolute top-0"
        style={{width: `${upgradePercent}%`, left: `${basePercent}%`}}
      />
    </div>
  );
}
