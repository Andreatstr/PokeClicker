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

  if (!open) return null;

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogBody({children, className = ''}: DialogSectionProps) {
  return <section className={`dialog-body ${className}`}>{children}</section>;
}
