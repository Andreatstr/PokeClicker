import './styles/process.css'

interface ProgressProps {
  value: number
  max?: number
}

export function Progress({ value, max = 255 }: ProgressProps) {
  const percent = Math.min(100, (value / max) * 100)

  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
