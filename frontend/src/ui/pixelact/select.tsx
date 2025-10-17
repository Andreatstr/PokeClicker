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
}

function SelectTrigger({
  children,
  className,
  font,
  ...props
}: SelectTriggerProps) {
  return (
    <div
      className={cn(
        'relative shadow-(--pixel-box-shadow) box-shadow-margin',
        inputVariants({font}),
        className
      )}
    >
      <ShadcnSelectTrigger
        {...props}
        className={cn(
          'rounded-none ring-0 w-full border-0 !text-black dark:!text-black [&>span]:!text-black [&_svg]:!text-black select-none',
          className
        )}
        style={{
          backgroundColor: 'var(--retro-surface)',
          ...props.style,
        }}
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
        'relative rounded-none border-none shadow-(--pixel-box-shadow) mt-2 !text-black dark:!text-black select-none',
        inputVariants({font}),
        className
      )}
      style={{
        backgroundColor: 'var(--retro-surface)',
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
  return (
    <ShadcnSelectItem
      className={cn(
        className,
        'rounded-none border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring !text-black dark:!text-black select-none'
      )}
      style={
        {
          '--hover-bg': 'var(--retro-secondary)',
        } as React.CSSProperties & Record<string, string>
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--retro-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
      }}
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
