export function getContrastColor(bgColor: string): string {
  // Map Tailwind color classes to their hex values
  const colorMap: Record<string, string> = {
    'bg-gray-400': '#9ca3af',
    'bg-gray-500': '#6b7280',
    'bg-gray-600': '#4b5563',
    'bg-gray-700': '#374151',
    'bg-gray-800': '#1f2937',
    'bg-red-500': '#ef4444',
    'bg-red-600': '#dc2626',
    'bg-red-700': '#b91c1c',
    'bg-red-800': '#991b1b',
    'bg-red-900': '#7f1d1d',
    'bg-blue-200': '#bfdbfe',
    'bg-blue-500': '#3b82f6',
    'bg-blue-600': '#2563eb',
    'bg-blue-700': '#1d4ed8',
    'bg-blue-800': '#1e40af',
    'bg-yellow-400': '#facc15',
    'bg-yellow-600': '#ca8a04',
    'bg-yellow-700': '#a16207',
    'bg-yellow-800': '#854d0e',
    'bg-green-400': '#4ade80',
    'bg-green-500': '#22c55e',
    'bg-green-600': '#16a34a',
    'bg-green-700': '#15803d',
    'bg-green-800': '#166534',
    'bg-purple-500': '#a855f7',
    'bg-purple-600': '#9333ea',
    'bg-purple-700': '#7e22ce',
    'bg-purple-800': '#6b21a8',
    'bg-indigo-400': '#818cf8',
    'bg-indigo-600': '#4f46e5',
    'bg-indigo-700': '#4338ca',
    'bg-indigo-800': '#3730a3',
    'bg-indigo-900': '#312e81',
    'bg-pink-300': '#f9a8d4',
    'bg-pink-400': '#f472b6',
    'bg-pink-500': '#ec4899',
    'bg-pink-600': '#db2777',
    'bg-pink-700': '#be185d',
    'bg-pink-800': '#9d174d',
    'bg-cyan-400': '#22d3ee',
    'bg-cyan-500': '#06b6d4',
    'bg-cyan-600': '#0891b2',
    'bg-cyan-700': '#0e7490',
    'bg-amber-600': '#d97706',
    'bg-amber-700': '#a16207',
    'bg-amber-800': '#92400e',
    'bg-lime-500': '#84cc16',
    'bg-lime-600': '#65a30d',
    'bg-lime-700': '#4d7c0f',
    'bg-lime-800': '#365314',
    'bg-stone-500': '#78716c',
    'bg-stone-600': '#57534e',
    'bg-stone-700': '#44403c',
    'bg-stone-800': '#292524',
    'bg-violet-500': '#8b5cf6',
    'bg-violet-600': '#7c3aed',
    'bg-violet-700': '#6d28d9',
    'bg-violet-800': '#5b21b6',
    'bg-slate-600': '#475569',
    'bg-slate-700': '#334155',
    'bg-slate-800': '#1e293b',
    'bg-slate-900': '#0f172a',
  };

  const hex = colorMap[bgColor] || '#000000';

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate relative luminance using proper sRGB formula
  const toLinear = (c: number) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  const contrastWithWhite = (1 + 0.05) / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / (0 + 0.05);

  // Return black for light backgrounds (luminance > 0.5 gives better contrast), white for dark
  return contrastWithWhite >= contrastWithBlack ? 'text-white' : 'text-black';
}

export function getStatBarColors() {
  return {
    hp: {color: 'bg-red-300', upgradeColor: 'bg-red-600'},
    attack: {color: 'bg-orange-300', upgradeColor: 'bg-orange-600'},
    defense: {color: 'bg-blue-300', upgradeColor: 'bg-blue-600'},
    spAttack: {color: 'bg-purple-300', upgradeColor: 'bg-purple-600'},
    spDefense: {color: 'bg-yellow-300', upgradeColor: 'bg-yellow-600'},
    speed: {color: 'bg-pink-300', upgradeColor: 'bg-pink-600'},
  };
}

export function getUnknownPokemonColors(isDarkMode: boolean) {
  return isDarkMode
    ? {
        badge: 'bg-gray-500',
        cardBg: 'bg-gradient-to-br from-gray-700 to-gray-800',
        cardBorder: 'border-gray-600',
        shadow: 'shadow-gray-600/50',
      }
    : {
        badge: 'bg-gray-400',
        cardBg: 'bg-gradient-to-br from-gray-200 to-gray-300',
        cardBorder: 'border-gray-400',
        shadow: 'shadow-gray-400/50',
      };
}

export function getTypeColors(type: string, isDarkMode: boolean = false) {
  const lightModeColors: Record<
    string,
    {badge: string; cardBg: string; cardBorder: string; shadow: string}
  > = {
    normal: {
      badge: 'bg-gray-400',
      cardBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      cardBorder: 'border-gray-400',
      shadow: 'shadow-gray-400/50',
    },
    fire: {
      badge: 'bg-red-500',
      cardBg: 'bg-red-300',
      cardBorder: 'border-red-400',
      shadow: 'shadow-red-400/50',
    },
    water: {
      badge: 'bg-blue-500',
      cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      cardBorder: 'border-blue-400',
      shadow: 'shadow-blue-400/50',
    },
    electric: {
      badge: 'bg-yellow-400',
      cardBg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      cardBorder: 'border-yellow-400',
      shadow: 'shadow-yellow-400/50',
    },
    grass: {
      badge: 'bg-green-600',
      cardBg: 'bg-green-200',
      cardBorder: 'border-green-400',
      shadow: 'shadow-green-400/50',
    },
    ice: {
      badge: 'bg-blue-200',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      cardBorder: 'border-cyan-300',
      shadow: 'shadow-cyan-300/50',
    },
    fighting: {
      badge: 'bg-red-700',
      cardBg: 'bg-gradient-to-br from-red-100 to-red-200',
      cardBorder: 'border-red-600',
      shadow: 'shadow-red-600/50',
    },
    poison: {
      badge: 'bg-purple-500',
      cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      cardBorder: 'border-purple-400',
      shadow: 'shadow-purple-400/50',
    },
    ground: {
      badge: 'bg-yellow-600',
      cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      cardBorder: 'border-amber-400',
      shadow: 'shadow-amber-400/50',
    },
    flying: {
      badge: 'bg-indigo-400',
      cardBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      cardBorder: 'border-indigo-300',
      shadow: 'shadow-indigo-300/50',
    },
    psychic: {
      badge: 'bg-pink-500',
      cardBg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      cardBorder: 'border-pink-400',
      shadow: 'shadow-pink-400/50',
    },
    bug: {
      badge: 'bg-green-400',
      cardBg: 'bg-gradient-to-br from-lime-50 to-lime-100',
      cardBorder: 'border-lime-400',
      shadow: 'shadow-lime-400/50',
    },
    rock: {
      badge: 'bg-yellow-800',
      cardBg: 'bg-gradient-to-br from-stone-50 to-stone-100',
      cardBorder: 'border-stone-400',
      shadow: 'shadow-stone-400/50',
    },
    ghost: {
      badge: 'bg-purple-700',
      cardBg: 'bg-gradient-to-br from-violet-50 to-violet-100',
      cardBorder: 'border-violet-400',
      shadow: 'shadow-violet-400/50',
    },
    dragon: {
      badge: 'bg-indigo-700',
      cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
      cardBorder: 'border-indigo-600',
      shadow: 'shadow-indigo-600/50',
    },
    dark: {
      badge: 'bg-gray-800',
      cardBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
      cardBorder: 'border-slate-600',
      shadow: 'shadow-slate-600/50',
    },
    steel: {
      badge: 'bg-gray-500',
      cardBg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      cardBorder: 'border-gray-500',
      shadow: 'shadow-gray-500/50',
    },
    fairy: {
      badge: 'bg-pink-300',
      cardBg: 'bg-gradient-to-br from-pink-25 to-pink-50',
      cardBorder: 'border-pink-300',
      shadow: 'shadow-pink-300/50',
    },
  };

  const darkModeColors: Record<
    string,
    {badge: string; cardBg: string; cardBorder: string; shadow: string}
  > = {
    normal: {
      badge: 'bg-gray-600',
      cardBg: 'bg-gradient-to-br from-gray-600/60 to-gray-700/50',
      cardBorder: 'border-gray-500/80',
      shadow: 'shadow-gray-500/50',
    },
    fire: {
      badge: 'bg-red-600',
      cardBg: 'bg-gradient-to-br from-red-600/60 to-red-700/50',
      cardBorder: 'border-red-500/80',
      shadow: 'shadow-red-500/50',
    },
    water: {
      badge: 'bg-blue-600',
      cardBg: 'bg-gradient-to-br from-blue-600/60 to-blue-700/50',
      cardBorder: 'border-blue-500/80',
      shadow: 'shadow-blue-500/50',
    },
    electric: {
      badge: 'bg-yellow-600',
      cardBg: 'bg-gradient-to-br from-yellow-600/60 to-yellow-700/50',
      cardBorder: 'border-yellow-500/80',
      shadow: 'shadow-yellow-500/50',
    },
    grass: {
      badge: 'bg-green-600',
      cardBg: 'bg-gradient-to-br from-green-600/60 to-green-700/50',
      cardBorder: 'border-green-500/80',
      shadow: 'shadow-green-500/50',
    },
    ice: {
      badge: 'bg-cyan-500',
      cardBg: 'bg-gradient-to-br from-cyan-500/60 to-cyan-600/50',
      cardBorder: 'border-cyan-400/80',
      shadow: 'shadow-cyan-400/50',
    },
    fighting: {
      badge: 'bg-red-700',
      cardBg: 'bg-gradient-to-br from-red-600/60 to-red-700/50',
      cardBorder: 'border-red-500/80',
      shadow: 'shadow-red-500/50',
    },
    poison: {
      badge: 'bg-purple-600',
      cardBg: 'bg-gradient-to-br from-purple-600/60 to-purple-700/50',
      cardBorder: 'border-purple-500/80',
      shadow: 'shadow-purple-500/50',
    },
    ground: {
      badge: 'bg-amber-600',
      cardBg: 'bg-gradient-to-br from-amber-600/60 to-amber-700/50',
      cardBorder: 'border-amber-500/80',
      shadow: 'shadow-amber-500/50',
    },
    flying: {
      badge: 'bg-indigo-600',
      cardBg: 'bg-gradient-to-br from-indigo-600/60 to-indigo-700/50',
      cardBorder: 'border-indigo-500/80',
      shadow: 'shadow-indigo-500/50',
    },
    psychic: {
      badge: 'bg-pink-600',
      cardBg: 'bg-gradient-to-br from-pink-600/60 to-pink-700/50',
      cardBorder: 'border-pink-500/80',
      shadow: 'shadow-pink-500/50',
    },
    bug: {
      badge: 'bg-lime-600',
      cardBg: 'bg-gradient-to-br from-lime-600/60 to-lime-700/50',
      cardBorder: 'border-lime-500/80',
      shadow: 'shadow-lime-500/50',
    },
    rock: {
      badge: 'bg-stone-600',
      cardBg: 'bg-gradient-to-br from-stone-600/60 to-stone-700/50',
      cardBorder: 'border-stone-500/80',
      shadow: 'shadow-stone-500/50',
    },
    ghost: {
      badge: 'bg-violet-600',
      cardBg: 'bg-gradient-to-br from-violet-600/60 to-violet-700/50',
      cardBorder: 'border-violet-500/80',
      shadow: 'shadow-violet-500/50',
    },
    dragon: {
      badge: 'bg-indigo-700',
      cardBg: 'bg-gradient-to-br from-indigo-600/60 to-indigo-700/50',
      cardBorder: 'border-indigo-500/80',
      shadow: 'shadow-indigo-500/50',
    },
    dark: {
      badge: 'bg-slate-700',
      cardBg: 'bg-gradient-to-br from-slate-600/60 to-slate-700/50',
      cardBorder: 'border-slate-500/80',
      shadow: 'shadow-slate-500/50',
    },
    steel: {
      badge: 'bg-gray-600',
      cardBg: 'bg-gradient-to-br from-gray-600/60 to-gray-700/50',
      cardBorder: 'border-gray-500/80',
      shadow: 'shadow-gray-500/50',
    },
    fairy: {
      badge: 'bg-pink-500',
      cardBg: 'bg-gradient-to-br from-pink-500/60 to-pink-600/50',
      cardBorder: 'border-pink-400/80',
      shadow: 'shadow-pink-400/50',
    },
  };

  const colorMap = isDarkMode ? darkModeColors : lightModeColors;
  return colorMap[type] || colorMap.normal;
}
