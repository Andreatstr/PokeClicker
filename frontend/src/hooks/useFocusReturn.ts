import {useEffect, useRef} from 'react';

/**
 * Hook for managing focus return when modal closes (accessibility feature)
 * Captures currently focused element when modal opens, restores it when modal closes
 * Prevents focus from being lost to document body after modal dismissal
 *
 * @param isOpen - Modal open state
 * @returns Ref to previously active element
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
