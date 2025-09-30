import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './styles/dialog.css'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

interface DialogSectionProps {
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children }: DialogProps) {
  if (!open) return null

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogBody({ children, className = '' }: DialogSectionProps) {
  return <section className={`dialog-body ${className}`}>{children}</section>
}
