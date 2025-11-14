/**
 * Icon name registry and type definitions
 *
 * Maps icon names to their component identifiers.
 * Used for type-safe icon name references.
 */
export const icons = {
  search: 'SearchIcon',
  close: 'CloseIcon',
  user: 'UserIcon',
  sun: 'SunIcon',
  moon: 'MoonIcon',
  menu: 'MenuIcon',
} as const;

export type IconName = keyof typeof icons;
