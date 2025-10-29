import {useEffect} from 'react';

/**
 * Hook to handle Escape key press for closing modals
 * Adds keyboard event listener when modal is open
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
