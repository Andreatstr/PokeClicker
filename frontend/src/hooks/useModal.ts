import {useFocusReturn} from './useFocusReturn';
import {useEscapeKey} from './useEscapeKey';

/**
 * Combined hook for common modal functionality
 * - Focus return management
 * - Escape key handling
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const previousActiveElement = useFocusReturn(isOpen);
  useEscapeKey(isOpen, onClose);

  return {previousActiveElement};
}
