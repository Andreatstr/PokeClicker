import React from 'react';

/**
 * Common props for all pixel icon components
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Factory function for creating pixel-style icon components
 *
 * Generates SVG-based icon components with consistent sizing and styling.
 * All icons use 'currentColor' for fill, making them theme-aware.
 *
 * @param pathData - SVG path data defining the icon's pixel art shape
 * @param viewBox - SVG viewBox coordinates (default: '0 0 24 24')
 * @returns A forwardRef-enabled icon component
 */
const createIcon = (pathData: string, viewBox = '0 0 24 24') => {
  return React.forwardRef<SVGSVGElement, IconProps>(
    ({className = '', size = 16, ...props}, ref) => (
      <svg
        ref={ref}
        className={className}
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        {...props}
      >
        <path d={pathData} fill="currentColor" />
      </svg>
    )
  );
};

export const SearchIcon = createIcon(
  'M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z'
);

export const CloseIcon = createIcon(
  'M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z'
);

export const UserIcon = createIcon(
  'M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z'
);

export const SunIcon = createIcon(
  'M13 0h-2v4h2V0ZM0 11v2h4v-2H0Zm24 0v2h-4v-2h4ZM13 24h-2v-4h2v4ZM8 6h8v2H8V6ZM6 8h2v8H6V8Zm2 10v-2h8v2H8Zm10-2h-2V8h2v8Zm2-14h2v2h-2V2Zm0 2v2h-2V4h2Zm2 18h-2v-2h2v2Zm-2-2h-2v-2h2v2ZM4 2H2v2h2v2h2V4H4V2ZM2 22h2v-2h2v-2H4v2H2v2Z'
);

export const MoonIcon = createIcon(
  'M6 2h8v2h-2v2h-2V4H6V2ZM4 6V4h2v2H4Zm0 10H2V6h2v10Zm2 2H4v-2h2v2Zm2 2H6v-2h2v2Zm10 0v2H8v-2h10Zm2-2v2h-2v-2h2Zm-2-4h2v4h2v-8h-2v2h-2v2Zm-6 0v2h6v-2h-6Zm-2-2h2v2h-2v-2Zm0 0V6H8v6h2Z'
);

export const MenuIcon = createIcon(
  'M4 6h16v2H4V6zm0 5h16v2H4v-2zm16 5H4v2h16v-2z'
);

export const ArrowUpIcon = createIcon(
  'M11 20h2V8h2V6h-2V4h-2v2H9v2h2v12zM7 10V8h2v2H7zm0 0v2H5v-2h2zm10 0V8h-2v2h2zm0 0v2h2v-2h-2z'
);

export const ArrowLeftIcon = createIcon(
  'M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z'
);

export const ArrowRightIcon = createIcon(
  'M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z'
);
