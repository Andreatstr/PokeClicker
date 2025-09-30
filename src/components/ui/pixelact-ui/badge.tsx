import type { ReactNode } from 'react'
import './styles/badge.css'

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>
}
