import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import {cn} from '@/lib/utils';

/**
 * Base label primitive
 *
 * Wraps Radix UI Label with accessibility features:
 * - Automatic association with form controls
 * - Disabled state handling via group-data and peer
 * - Select-none for better UX
 *
 * Used as foundation for pixelact label component.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export {Label};
