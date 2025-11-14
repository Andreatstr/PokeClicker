import {cva} from 'class-variance-authority';

/**
 * Variant configuration for pixel-style select inputs
 *
 * Base styles prevent text selection (select-none) for UI consistency.
 * Font switching between normal and pixel fonts (default: pixel).
 */
export const inputVariants = cva('text-black select-none', {
  variants: {
    font: {
      normal: '',
      pixel: 'pixel-font',
    },
  },
  defaultVariants: {
    font: 'pixel',
  },
});
