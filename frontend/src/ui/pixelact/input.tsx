import * as React from 'react';
import {cn} from '@lib/utils';
import '@ui/pixelact/styles/styles.css';

export interface PixelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, PixelInputProps>(
  ({className, disabled, ...props}, ref) => {
    return (
      <input
        className={cn(
          'pixel__input pixel-font max-w-full p-2 text-foreground shadow-(--pixel-box-shadow) placeholder:text-sm md:placeholder:text-base box-shadow-margin disabled:opacity-40',
          'outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]',
          disabled && 'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        style={{
          backgroundColor: 'var(--input)',
          color: 'var(--foreground)',
          ...props.style,
        }}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'PixelInput';

export {Input};
