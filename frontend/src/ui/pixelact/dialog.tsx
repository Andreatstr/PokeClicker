import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {useEffect} from 'react';
import './styles/dialog.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

interface DialogSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Modal dialog component with accessibility features
 *
 * Features:
 * - Portal rendering to document.body
 * - Inert attribute on main content (prevents tab navigation behind modal)
 * - Body scroll locking with position: fixed
 * - Touch event handling for mobile
 * - Click-outside to close
 *
 * Accessibility: Uses inert and aria-hidden to trap focus within modal.
 */
export function Dialog({open, onClose, children}: DialogProps) {
  // Make the main app content inert when modal is open
  // This prevents tabbing to elements behind the modal
  useEffect(() => {
    if (!open) return;

    const root = document.getElementById('root');
    if (root) {
      root.setAttribute('inert', '');
      root.setAttribute('aria-hidden', 'true');
    }

    return () => {
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
    };
  }, [open]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (!open) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPosition = window.getComputedStyle(document.body).position;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="dialog-backdrop"
      onClick={onClose}
      onTouchMove={(e) => {
        // Prevent backdrop from scrolling
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className="dialog-content"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => {
          // Allow scrolling within dialog content
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogBody({children, className = ''}: DialogSectionProps) {
  return <section className={`dialog-body ${className}`}>{children}</section>;
}
