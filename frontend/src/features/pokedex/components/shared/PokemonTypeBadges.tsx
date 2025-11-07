import {getTypeColors, getContrastColor} from '../../utils/typeColors';

interface PokemonTypeBadgesProps {
  types: string[];
  isDarkMode: boolean;
  size?: 'small' | 'medium';
}

/**
 * Displays Pokemon type badges with appropriate colors
 */
export function PokemonTypeBadges({
  types,
  isDarkMode,
  size = 'medium',
}: PokemonTypeBadgesProps) {
  const sizeClasses =
    size === 'small'
      ? 'text-[8px] px-2 py-0.5'
      : 'text-[10px] md:text-xs px-2 py-1';

  return (
    <ul
      className="flex flex-wrap gap-1 md:gap-2 list-none p-0 m-0"
      role="list"
      aria-label="Pokemon types"
    >
      {types.map((type) => {
        const typeColors = getTypeColors(type, isDarkMode);
        const textColor = getContrastColor(typeColors.badge);
        return (
          <li
            key={type}
            className={`${typeColors.badge} ${textColor} ${sizeClasses} font-bold uppercase border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
            style={{textShadow: 'none'}}
          >
            {type}
          </li>
        );
      })}
    </ul>
  );
}
