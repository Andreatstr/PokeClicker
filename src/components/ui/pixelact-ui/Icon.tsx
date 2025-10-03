import React from 'react'
import type { IconProps } from './icons'
import { SearchIcon, CloseIcon, UserIcon, SunIcon, MoonIcon, MenuIcon } from './icons'
import type { IconName } from './icon-types'

const icons = {
  search: SearchIcon,
  close: CloseIcon,
  user: UserIcon,
  sun: SunIcon,
  moon: MoonIcon,
  menu: MenuIcon,
} as const

export const Icon: React.FC<{ name: IconName } & IconProps> = ({ name, ...props }) => {
  const IconComponent = icons[name]
  return <IconComponent {...props} />
}
