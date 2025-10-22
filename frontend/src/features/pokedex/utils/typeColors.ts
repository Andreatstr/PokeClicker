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
      badge: 'bg-gray-800',
      cardBg: 'bg-gradient-to-br from-gray-800/20 to-gray-900/20',
      cardBorder: 'border-gray-600/40',
      shadow: 'shadow-gray-600/20',
    },
    fire: {
      badge: 'bg-red-800',
      cardBg: 'bg-gradient-to-br from-red-900/15 to-red-800/15',
      cardBorder: 'border-red-700/30',
      shadow: 'shadow-red-700/15',
    },
    water: {
      badge: 'bg-blue-800',
      cardBg: 'bg-gradient-to-br from-blue-900/15 to-blue-800/15',
      cardBorder: 'border-blue-700/30',
      shadow: 'shadow-blue-700/15',
    },
    electric: {
      badge: 'bg-yellow-800',
      cardBg: 'bg-gradient-to-br from-yellow-900/15 to-yellow-800/15',
      cardBorder: 'border-yellow-700/30',
      shadow: 'shadow-yellow-700/15',
    },
    grass: {
      badge: 'bg-green-800',
      cardBg: 'bg-gradient-to-br from-green-900/15 to-green-800/15',
      cardBorder: 'border-green-700/30',
      shadow: 'shadow-green-700/15',
    },
    ice: {
      badge: 'bg-cyan-700',
      cardBg: 'bg-gradient-to-br from-cyan-800/15 to-cyan-700/15',
      cardBorder: 'border-cyan-600/30',
      shadow: 'shadow-cyan-600/15',
    },
    fighting: {
      badge: 'bg-red-900',
      cardBg: 'bg-gradient-to-br from-red-900/15 to-red-800/15',
      cardBorder: 'border-red-700/30',
      shadow: 'shadow-red-700/15',
    },
    poison: {
      badge: 'bg-purple-800',
      cardBg: 'bg-gradient-to-br from-purple-900/15 to-purple-800/15',
      cardBorder: 'border-purple-700/30',
      shadow: 'shadow-purple-700/15',
    },
    ground: {
      badge: 'bg-amber-800',
      cardBg: 'bg-gradient-to-br from-amber-900/15 to-amber-800/15',
      cardBorder: 'border-amber-700/30',
      shadow: 'shadow-amber-700/15',
    },
    flying: {
      badge: 'bg-indigo-800',
      cardBg: 'bg-gradient-to-br from-indigo-900/15 to-indigo-800/15',
      cardBorder: 'border-indigo-700/30',
      shadow: 'shadow-indigo-700/15',
    },
    psychic: {
      badge: 'bg-pink-800',
      cardBg: 'bg-gradient-to-br from-pink-900/15 to-pink-800/15',
      cardBorder: 'border-pink-700/30',
      shadow: 'shadow-pink-700/15',
    },
    bug: {
      badge: 'bg-lime-800',
      cardBg: 'bg-gradient-to-br from-lime-900/15 to-lime-800/15',
      cardBorder: 'border-lime-700/30',
      shadow: 'shadow-lime-700/15',
    },
    rock: {
      badge: 'bg-stone-800',
      cardBg: 'bg-gradient-to-br from-stone-900/15 to-stone-800/15',
      cardBorder: 'border-stone-700/30',
      shadow: 'shadow-stone-700/15',
    },
    ghost: {
      badge: 'bg-violet-800',
      cardBg: 'bg-gradient-to-br from-violet-900/15 to-violet-800/15',
      cardBorder: 'border-violet-700/30',
      shadow: 'shadow-violet-700/15',
    },
    dragon: {
      badge: 'bg-indigo-900',
      cardBg: 'bg-gradient-to-br from-indigo-900/15 to-indigo-800/15',
      cardBorder: 'border-indigo-700/30',
      shadow: 'shadow-indigo-700/15',
    },
    dark: {
      badge: 'bg-slate-900',
      cardBg: 'bg-gradient-to-br from-slate-900/15 to-slate-800/15',
      cardBorder: 'border-slate-700/30',
      shadow: 'shadow-slate-700/15',
    },
    steel: {
      badge: 'bg-gray-800',
      cardBg: 'bg-gradient-to-br from-gray-800/15 to-gray-900/15',
      cardBorder: 'border-gray-700/30',
      shadow: 'shadow-gray-700/15',
    },
    fairy: {
      badge: 'bg-pink-700',
      cardBg: 'bg-gradient-to-br from-pink-800/15 to-pink-700/15',
      cardBorder: 'border-pink-600/30',
      shadow: 'shadow-pink-600/15',
    },
  };

  const colorMap = isDarkMode ? darkModeColors : lightModeColors;
  return colorMap[type] || colorMap.normal;
}
