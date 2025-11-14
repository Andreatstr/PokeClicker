import {cva} from 'class-variance-authority';

/**
 * Variant configuration for pixel-style cards
 *
 * Simple font switching between normal and pixel fonts.
 * Default is pixel font to match the retro/GameBoy theme.
 */
export const cardVariants = cva('', {
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
