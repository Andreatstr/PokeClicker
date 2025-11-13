import * as SelectPrimitive from '@radix-ui/react-select';
import {type VariantProps} from 'class-variance-authority';

import {cn} from '@lib/utils';

import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectGroup as ShadcnSelectGroup,
  SelectItem as ShadcnSelectItem,
  SelectLabel as ShadcnSelectLabel,
  SelectScrollDownButton as ShadcnSelectScrollDownButton,
  SelectScrollUpButton as ShadcnSelectScrollUpButton,
  SelectSeparator as ShadcnSelectSeparator,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@ui/primitives';

import '@ui/pixelact/styles/styles.css';
import {inputVariants} from './select-variants';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

function Select({...props}: React.ComponentProps<typeof ShadcnSelect>) {
  return <ShadcnSelect {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <ShadcnSelectGroup {...props} />;
}

interface SelectValueProps
  extends React.ComponentProps<typeof SelectPrimitive.Value>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

function SelectValue({font, ...props}: SelectValueProps) {
  return <ShadcnSelectValue className={cn(inputVariants({font}))} {...props} />;
}

interface SelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
  isDarkMode?: boolean;
}

function SelectTrigger({
  children,
  className,
  font,
  isDarkMode = false,
  ...props
}: SelectTriggerProps) {
  return (
    <div
      className={cn(
        'relative shadow-(--pixel-box-shadow) box-shadow-margin hover:opacity-80 transition-opacity',
        inputVariants({font}),
        className
      )}
    >
      <ShadcnSelectTrigger
        {...props}
        className={`rounded-none ring-0 w-full border-0 select-none min-h-[44px] focus-visible:ring-3 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--card)] ${isDarkMode ? 'focus-visible:ring-white' : 'focus-visible:ring-[#0066ff]'}`}
        style={
          {
            backgroundColor: 'var(--input)',
            color: 'var(--foreground)',
            '--tw-ring-color': isDarkMode ? 'white' : '#0066ff',
            ...props.style,
          } as React.CSSProperties
        }
      >
        {children}
      </ShadcnSelectTrigger>
    </div>
  );
}

export interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

function SelectContent({
  className,
  children,
  font,
  ...props
}: SelectContentProps) {
  return (
    <ShadcnSelectContent
      className={cn(
        'relative rounded-none border-none shadow-(--pixel-box-shadow) mt-2 select-none max-h-[240px] overflow-y-auto scrollbar-hide',
        inputVariants({font}),
        className
      )}
      style={{
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </ShadcnSelectContent>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <ShadcnSelectLabel className={cn(className)} {...props} />;
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentItem = e.currentTarget;
      const parent = currentItem.parentElement;
      if (!parent) return;

      const items = Array.from(parent.querySelectorAll('[role="option"]'));
      const currentIndex = items.indexOf(currentItem);
      const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
      const nextItem = items[nextIndex] as HTMLElement | undefined;

      if (nextItem) {
        nextItem.focus();
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  return (
    <ShadcnSelectItem
      className={cn(
        className,
        'rounded-none border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring select-none min-h-[44px]'
      )}
      style={
        {
          '--hover-bg': 'var(--retro-secondary)',
          color: 'var(--popover-foreground)',
          ...props.style,
        } as React.CSSProperties & Record<string, string>
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--retro-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      {children}
    </ShadcnSelectItem>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <ShadcnSelectSeparator className={cn(className)} {...props} />;
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnSelectScrollUpButton>) {
  return <ShadcnSelectScrollUpButton className={cn(className)} {...props} />;
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return <ShadcnSelectScrollDownButton className={cn(className)} {...props} />;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
