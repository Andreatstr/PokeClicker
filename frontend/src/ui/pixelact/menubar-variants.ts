import {cva} from 'class-variance-authority';

/**
 * Variant configuration for pixel-style menubar
 *
 * Applies pixel box shadow to all variants.
 * Font switching between normal and pixel fonts (default: pixel).
 */
export const menubarVariants = cva(
  'shadow-(--pixel-box-shadow) box-shadow-margin',
  {
    variants: {
      font: {
        normal: '',
        pixel: 'pixel-font',
      },
    },
    defaultVariants: {
      font: 'pixel',
    },
  }
);
