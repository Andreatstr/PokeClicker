import {cva} from 'class-variance-authority';

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
