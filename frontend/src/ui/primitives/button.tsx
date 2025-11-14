import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {type VariantProps} from 'class-variance-authority';

import {cn} from '@/lib/utils';
import {buttonVariants} from './button-variants';

/**
 * Base button primitive with variant support
 *
 * Provides unstyled button foundation using class-variance-authority.
 * Supports Radix UI Slot pattern via asChild for composition.
 *
 * This primitive is wrapped by pixelact button for themed usage.
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {Button};
