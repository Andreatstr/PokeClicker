import * as React from 'react';
import '@ui/pixelact/styles/styles.css';

/**
 * Props for pixel-style input component
 *
 * @param isDarkMode - Controls focus ring color scheme
 */
export interface PixelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  className?: string;
  isDarkMode?: boolean;
}

/**
 * Pixel-style text input component
 *
 * Features:
 * - Pixel font by default
 * - Pixel-style box shadow (defined via CSS custom property)
 * - Theme-aware styling via CSS custom properties
 * - 44px minimum height for accessibility
 * - Focus ring with offset for visibility
 *
 * Styling uses var(--input) and var(--foreground) for theme support.
 */
const Input = React.forwardRef<HTMLInputElement, PixelInputProps>(
  ({className, disabled, isDarkMode = false, ...props}, ref) => {
    return (
      <input
        className={`pixel__input pixel-font max-w-full p-2 text-foreground shadow-(--pixel-box-shadow) placeholder:text-sm md:placeholder:text-base box-shadow-margin disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--card)] ${isDarkMode ? 'focus-visible:ring-white' : 'focus-visible:ring-[#0066ff]'} ${disabled && 'disabled:opacity-40 disabled:cursor-not-allowed'} ${className || ''}`}
        style={
          {
            backgroundColor: 'var(--input)',
            color: 'var(--foreground)',
            '--tw-ring-color': isDarkMode ? 'white' : '#0066ff',
            ...props.style,
          } as React.CSSProperties
        }
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'PixelInput';

export {Input};
