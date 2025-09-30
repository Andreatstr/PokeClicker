import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-variants"

function Button({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Immediately blur to prevent focus
    e.currentTarget.blur()

    if (onClick) {
      onClick(e)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    // Force blur on touch end for mobile
    e.currentTarget.blur()
    if (document.activeElement === e.currentTarget) {
      (document.activeElement as HTMLElement).blur()
    }
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      tabIndex={-1}
      {...props}
    />
  )
}

export { Button }
