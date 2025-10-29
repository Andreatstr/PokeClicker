import {useEffect, useRef} from 'react';

/**
 * Hook to manage focus return when a modal closes
 * Stores the previously focused element and returns focus to it when modal closes
 */
export function useFocusReturn(isOpen: boolean) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element when modal opens
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      // Return focus to the previously focused element when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen]);

  return previousActiveElement;
}
