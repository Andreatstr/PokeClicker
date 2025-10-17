import {cva} from 'class-variance-authority';

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
