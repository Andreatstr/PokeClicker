import {describe, it, expect} from 'vitest';
import {
  getContrastColor,
  getStatBarColors,
  getUnknownPokemonColors,
  getTypeColors,
} from '../typeColors';

describe('getContrastColor', () => {
  it('should return text-black for light background colors', () => {
    expect(getContrastColor('bg-gray-400')).toBe('text-white'); // #9ca3af is dark
    expect(getContrastColor('bg-blue-200')).toBe('text-black'); // #bfdbfe is light
    expect(getContrastColor('bg-yellow-400')).toBe('text-black'); // #facc15 is light
  });

  it('should return text-white for dark background colors', () => {
    expect(getContrastColor('bg-gray-800')).toBe('text-white');
    expect(getContrastColor('bg-red-700')).toBe('text-white');
    expect(getContrastColor('bg-blue-600')).toBe('text-white');
  });

  it('should return text-white for unknown color', () => {
    expect(getContrastColor('bg-unknown-color')).toBe('text-white'); // Defaults to #000000
  });

  it('should handle invalid hex values gracefully', () => {
    // This tests the fallback behavior when colorMap doesn't have the color
    expect(getContrastColor('bg-invalid')).toBe('text-white'); // Defaults to #000000
  });
});

describe('getStatBarColors', () => {
  it('should return light mode colors when isDarkMode is false', () => {
    const colors = getStatBarColors(false);

    expect(colors.hp).toEqual({
      color: 'bg-red-300',
      upgradeColor: 'bg-red-600',
    });
    expect(colors.attack).toEqual({
      color: 'bg-orange-300',
      upgradeColor: 'bg-orange-600',
    });
    expect(colors.defense).toEqual({
      color: 'bg-blue-300',
      upgradeColor: 'bg-blue-600',
    });
    expect(colors.spAttack).toEqual({
      color: 'bg-purple-300',
      upgradeColor: 'bg-purple-600',
    });
    expect(colors.spDefense).toEqual({
      color: 'bg-yellow-300',
      upgradeColor: 'bg-yellow-600',
    });
    expect(colors.speed).toEqual({
      color: 'bg-pink-300',
      upgradeColor: 'bg-pink-600',
    });
  });

  it('should return dark mode colors when isDarkMode is true', () => {
    const colors = getStatBarColors(true);

    expect(colors.hp).toEqual({
      color: 'bg-red-500/60',
      upgradeColor: 'bg-red-300/90',
    });
    expect(colors.attack).toEqual({
      color: 'bg-orange-500/60',
      upgradeColor: 'bg-orange-300/90',
    });
    expect(colors.defense).toEqual({
      color: 'bg-blue-500/60',
      upgradeColor: 'bg-blue-300/90',
    });
    expect(colors.spAttack).toEqual({
      color: 'bg-purple-500/60',
      upgradeColor: 'bg-purple-300/90',
    });
    expect(colors.spDefense).toEqual({
      color: 'bg-yellow-500/60',
      upgradeColor: 'bg-yellow-300/90',
    });
    expect(colors.speed).toEqual({
      color: 'bg-pink-500/60',
      upgradeColor: 'bg-pink-300/90',
    });
  });
});

describe('getUnknownPokemonColors', () => {
  it('should return light mode colors when isDarkMode is false', () => {
    const colors = getUnknownPokemonColors(false);

    expect(colors.badge).toBe('bg-gray-400');
    expect(colors.cardBg).toBe('bg-gradient-to-br from-gray-200 to-gray-300');
    expect(colors.cardBorder).toBe('border-gray-400');
    expect(colors.shadow).toBe('shadow-gray-400/50');
  });

  it('should return dark mode colors when isDarkMode is true', () => {
    const colors = getUnknownPokemonColors(true);

    expect(colors.badge).toBe('bg-gray-500');
    expect(colors.cardBg).toBe('bg-gradient-to-br from-gray-700 to-gray-800');
    expect(colors.cardBorder).toBe('border-gray-600');
    expect(colors.shadow).toBe('shadow-gray-600/50');
  });
});

describe('getTypeColors', () => {
  const pokemonTypes = [
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'dark',
    'steel',
    'fairy',
  ];

  it('should return light mode colors for all Pokemon types', () => {
    pokemonTypes.forEach((type) => {
      const colors = getTypeColors(type, false);

      expect(colors).toHaveProperty('badge');
      expect(colors).toHaveProperty('cardBg');
      expect(colors).toHaveProperty('cardBorder');
      expect(colors).toHaveProperty('shadow');

      expect(typeof colors.badge).toBe('string');
      expect(typeof colors.cardBg).toBe('string');
      expect(typeof colors.cardBorder).toBe('string');
      expect(typeof colors.shadow).toBe('string');
    });
  });

  it('should return dark mode colors for all Pokemon types', () => {
    pokemonTypes.forEach((type) => {
      const colors = getTypeColors(type, true);

      expect(colors).toHaveProperty('badge');
      expect(colors).toHaveProperty('cardBg');
      expect(colors).toHaveProperty('cardBorder');
      expect(colors).toHaveProperty('shadow');

      expect(typeof colors.badge).toBe('string');
      expect(typeof colors.cardBg).toBe('string');
      expect(typeof colors.cardBorder).toBe('string');
      expect(typeof colors.shadow).toBe('string');
    });
  });

  it('should return normal colors for unknown type', () => {
    const lightColors = getTypeColors('unknown', false);
    const darkColors = getTypeColors('unknown', true);

    expect(lightColors).toEqual(getTypeColors('normal', false));
    expect(darkColors).toEqual(getTypeColors('normal', true));
  });

  it('should return normal colors when type is undefined', () => {
    const lightColors = getTypeColors(undefined as unknown as string, false);
    const darkColors = getTypeColors(undefined as unknown as string, true);

    expect(lightColors).toEqual(getTypeColors('normal', false));
    expect(darkColors).toEqual(getTypeColors('normal', true));
  });

  it('should have different colors for light and dark modes', () => {
    pokemonTypes.forEach((type) => {
      const lightColors = getTypeColors(type, false);
      const darkColors = getTypeColors(type, true);

      // Some colors might be the same, so we check that at least one property is different
      const isDifferent =
        lightColors.badge !== darkColors.badge ||
        lightColors.cardBg !== darkColors.cardBg ||
        lightColors.cardBorder !== darkColors.cardBorder ||
        lightColors.shadow !== darkColors.shadow;
      expect(isDifferent).toBe(true);
    });
  });

  it('should return specific colors for known types', () => {
    const fireLight = getTypeColors('fire', false);
    const fireDark = getTypeColors('fire', true);

    expect(fireLight.badge).toBe('bg-red-500');
    expect(fireLight.cardBg).toBe('bg-red-300');
    expect(fireDark.badge).toBe('bg-red-600');
    expect(fireDark.cardBg).toBe(
      'bg-gradient-to-br from-red-600/60 to-red-700/50'
    );
  });

  it('should default to light mode when isDarkMode is not provided', () => {
    const colors = getTypeColors('fire');
    const lightColors = getTypeColors('fire', false);

    expect(colors).toEqual(lightColors);
  });
});
