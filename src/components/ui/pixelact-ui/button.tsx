import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button as ShadcnButton } from "@/components/ui/button";
import "@/components/ui/pixelact-ui/styles/styles.css";
import "./button.css";

const pixelButtonVariants = cva(
  "pixel__button pixel-font cursor-pointer rounded-none w-fit items-center justify-center whitespace-nowrap text-sm transition-colors transition-all duration-100 select-none outline-none [-webkit-tap-highlight-color:transparent]",
  {
    variants: {
      variant: {
        default: "pixel-default__button box-shadow-margin",
        secondary: "pixel-secondary__button box-shadow-margin",
        warning: "pixel-warning__button box-shadow-margin",
        success: "pixel-success__button box-shadow-margin",
        destructive: "pixel-destructive__button box-shadow-margin",
        link: "pixel-link__button bg-transparent text-link underline-offset-4 underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pixelButtonVariants> {
  asChild?: boolean;
  bgColor?: string;
}

const Button = React.forwardRef<
  React.ComponentRef<typeof ShadcnButton>,
  PixelButtonProps
>(({ className, variant, size, onClick, bgColor, style, ...props }, ref) => {
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

  // Function to darken a hex color
  const darkenColor = (color: string, percent: number = 30): string => {
    // Remove # if present
    const hex = color.replace('#', '')

    // Parse RGB
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Darken each component
    const darkenedR = Math.max(0, Math.floor(r * (100 - percent) / 100))
    const darkenedG = Math.max(0, Math.floor(g * (100 - percent) / 100))
    const darkenedB = Math.max(0, Math.floor(b * (100 - percent) / 100))

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`
  }

  const buttonStyle = {
    backgroundColor: bgColor,
    ...(bgColor && {
      '--custom-inner-border-color': darkenColor(bgColor),
    }),
    ...style
  } as React.CSSProperties & Record<string, string>

  return (
    <ShadcnButton
      className={cn(
        pixelButtonVariants({ variant, size }),
        "!rounded-none",
        bgColor && "custom-color-button",
        className
      )}
      style={buttonStyle}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      tabIndex={-1}
      ref={ref}
      {...props}
    />
  );
});

export { Button };
