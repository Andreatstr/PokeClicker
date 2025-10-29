import {useState, useEffect} from 'react';

/**
 * Custom hook for detecting mobile screen size
 * Handles window resize events and updates mobile state
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
