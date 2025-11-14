import {useEffect} from 'react';

/**
 * Hook for preventing page scrolling and touch interactions
 * Essential for map page to disable default scroll/refresh behaviors
 *
 * Features:
 * - Prevents body/document scrolling
 * - Disables pull-to-refresh on mobile
 * - Blocks overscroll bounce effect
 * - Prevents touchmove events (except in scrollable containers)
 * - Sets viewport to fixed height for mobile
 *
 * @param isLocked - Whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Prevent scrolling
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      // Prevent pull-to-refresh and overscroll on mobile
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';

      // Set height to viewport height
      document.documentElement.style.height = '100vh';
      document.body.style.height = '100vh';

      // Prevent touch scrolling on mobile
      const preventScroll = (e: TouchEvent) => {
        // Allow scrolling within joystick/button areas
        if (
          (e.target as HTMLElement).closest('.overflow-scroll, .overflow-auto')
        ) {
          return;
        }
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventScroll, {passive: false});

      return () => {
        // Restore scrolling
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
        document.documentElement.style.overscrollBehavior = '';
        document.documentElement.style.height = '';
        document.body.style.height = '';
        document.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isLocked]);
}
