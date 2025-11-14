import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import {CheckIcon} from 'lucide-react';

import {cn} from '@/lib/utils';
import './checkbox.css';

/**
 * Props for pixel-style checkbox
 *
 * @param isDarkMode - Controls focus ring color (white vs blue)
 */
interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  isDarkMode?: boolean;
}

/**
 * Pixel-style checkbox component
 *
 * Features:
 * - Extended touch target (44px minimum via CSS)
 * - Theme-aware focus rings
 * - Smooth check icon transition
 * - Invalid state styling via aria-invalid
 *
 * Uses Radix UI Checkbox primitive for accessibility.
 */
function Checkbox({className, isDarkMode = false, ...props}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground outline-none dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:ring-2 focus-visible:ring-offset-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow disabled:cursor-not-allowed disabled:opacity-50',
        'checkbox-extended-touch',
        className
      )}
      style={
        {
          '--tw-ring-color': isDarkMode ? 'white' : '#0066ff',
          '--tw-ring-offset-color': isDarkMode ? '#1a1a1a' : 'white',
        } as React.CSSProperties
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export {Checkbox};
