export const icons = {
  search: 'SearchIcon',
  close: 'CloseIcon',
  user: 'UserIcon',
  sun: 'SunIcon',
  moon: 'MoonIcon',
  menu: 'MenuIcon',
} as const;

export type IconName = keyof typeof icons;
