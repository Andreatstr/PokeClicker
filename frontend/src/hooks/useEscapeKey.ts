import {useEffect} from 'react';

/**
 * Hook for handling Escape key press to close modals
 * Adds/removes keyboard event listener based on modal open state
 *
 * @param isOpen - Whether modal is currently open
 * @param onClose - Callback to invoke when Escape key pressed
 */
export function useEscapeKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
}
