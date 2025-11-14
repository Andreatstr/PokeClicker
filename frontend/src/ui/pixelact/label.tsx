import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import {cn} from '@lib/utils';
import {Label as ShadcnLabel} from '@ui/primitives';

import '@ui/pixelact/styles/styles.css';

interface PixelLabelProps
  extends React.ComponentProps<typeof LabelPrimitive.Root> {
  asChild?: boolean;
}

/**
 * Pixel-style label component
 *
 * Simple wrapper around primitive label with:
 * - Pixel font applied by default
 * - Bottom margin for spacing
 * - Foreground color via CSS custom property
 *
 * Used for form inputs and accessibility labels.
 */
function Label({className, ...props}: PixelLabelProps) {
  return (
    <ShadcnLabel
      className={cn('pixel-font text-foreground mb-2', className)}
      {...props}
    />
  );
}

export {Label};
