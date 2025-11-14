import React from 'react';
import type {IconProps} from './icons';
import {
  SearchIcon,
  CloseIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
} from './icons';
import type {IconName} from './icon-types';

// Map of icon names to their corresponding components
const icons = {
  search: SearchIcon,
  close: CloseIcon,
  user: UserIcon,
  sun: SunIcon,
  moon: MoonIcon,
  menu: MenuIcon,
} as const;

/**
 * Icon component wrapper for pixel-style icons
 *
 * Provides a unified interface for rendering pixel art icons by name.
 * All icons are rendered using SVG paths optimized for retro/pixel aesthetics.
 *
 * @param name - The icon identifier (search, close, user, sun, moon, menu)
 * @param props - Additional SVG props (className, size, etc.)
 */
export const Icon: React.FC<{name: IconName} & IconProps> = ({
  name,
  ...props
}) => {
  const IconComponent = icons[name];
  return <IconComponent {...props} />;
};
