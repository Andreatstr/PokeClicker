import {useFocusReturn} from './useFocusReturn';
import {useEscapeKey} from './useEscapeKey';

/**
 * Hook combining common modal accessibility features
 *
 * Features:
 * - Focus return: Restores focus to triggering element when modal closes
 * - Escape key: Closes modal when Escape key pressed
 *
 * @param isOpen - Modal open state
 * @param onClose - Callback to close modal
 * @returns Previous active element ref for advanced focus management
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const previousActiveElement = useFocusReturn(isOpen);
  useEscapeKey(isOpen, onClose);

  return {previousActiveElement};
}
