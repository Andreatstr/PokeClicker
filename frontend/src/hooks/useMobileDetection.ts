import {useState, useEffect} from 'react';

/**
 * Hook for detecting mobile screen size with responsive breakpoint
 * Listens to window resize events and updates state when crossing breakpoint
 *
 * @param breakpoint - Pixel width threshold for mobile detection (default: 768px)
 * @returns Boolean indicating if current viewport width is at or below breakpoint
 */
export function useMobileDetection(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= breakpoint;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
