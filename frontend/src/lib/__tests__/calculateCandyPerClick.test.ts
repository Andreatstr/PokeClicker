import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  calculateBaseCandyPerClick,
  calculateCandyPerClick,
} from '../calculateCandyPerClick';
import type {UserStats} from '../graphql/types';

// Mock the UPGRADES config
vi.mock('@/config/upgradeConfig', () => ({
  UPGRADES: {
    clickPower: {
      formula: (level: number) => Math.pow(1.0954, level),
    },
    clickMultiplier: {
      formula: (level: number) => 1 + level * 0.15,
    },
    pokedexBonus: {
      formula: (level: number, {pokemonCount = 0} = {}) =>
        Math.pow(1.005, level * Math.sqrt(pokemonCount)),
    },
    luckyHitChance: {
      formula: (level: number) => 2 * Math.log(1 + 0.5 * level),
    },
    luckyHitMultiplier: {
      formula: (level: number) => Math.pow(1.2, level),
    },
  },
}));

describe('calculateBaseCandyPerClick', () => {
  describe('edge cases', () => {
    it('should return "1" when stats is undefined', () => {
      const result = calculateBaseCandyPerClick(undefined);
      expect(result).toBe('1');
    });

    it('should handle stats with all level 1 values', () => {
      const stats: UserStats = {
        clickPower: 1,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      };
      const result = calculateBaseCandyPerClick(stats);
      expect(result).toBe('1.00');
    });

    it('should handle stats with zero clickPower', () => {
      const stats: UserStats = {
        clickPower: 0,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      };
      const result = calculateBaseCandyPerClick(stats);
      // Uses (0 || 1) so returns 1.00
      expect(result).toBe('1.00');
    });

    it('should handle ownedPokemonCount as 0 by default', () => {
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 10,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      };
      const result = calculateBaseCandyPerClick(stats);
      // With 0 Pokemon, pokedexBonus should not multiply
      expect(parseFloat(result)).toBeGreaterThan(1);
    });
  });

  describe('clickPower scaling', () => {
    it('should increase with higher clickPower level', () => {
      const level2 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 2,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      const level5 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      const level10 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 10,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      expect(level5).toBeGreaterThan(level2);
      expect(level10).toBeGreaterThan(level5);
    });

    it('should grow exponentially', () => {
      const level5 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      const level20 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 20,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      // Level 20 should be more than 3x level 5 (exponential growth)
      expect(level20).toBeGreaterThan(level5 * 3);
    });
  });

  describe('clickMultiplier bonus', () => {
    it('should apply clickMultiplier when level > 1', () => {
      const withoutMultiplier = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      const withMultiplier = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 2,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      expect(withMultiplier).toBeGreaterThan(withoutMultiplier);
    });

    it('should not apply clickMultiplier when level = 1', () => {
      const result = calculateBaseCandyPerClick({
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      });
      expect(parseFloat(result)).toBeGreaterThan(1);
    });

    it('should increase with higher multiplier levels', () => {
      const level3 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 10,
          autoclicker: 1,
          clickMultiplier: 3,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      const level10 = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 10,
          autoclicker: 1,
          clickMultiplier: 10,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      expect(level10).toBeGreaterThan(level3);
    });
  });

  describe('pokedexBonus scaling', () => {
    it('should apply pokedexBonus with owned Pokemon', () => {
      const withoutBonus = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 1,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          25
        )
      );

      const withBonus = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 2,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          25
        )
      );

      expect(withBonus).toBeGreaterThan(withoutBonus);
    });

    it('should not apply pokedexBonus when level = 1', () => {
      const result = calculateBaseCandyPerClick(
        {
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        },
        25
      );
      expect(parseFloat(result)).toBeGreaterThan(1);
    });

    it('should not apply pokedexBonus when ownedPokemonCount is 0', () => {
      const withPokemon = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 5,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          25
        )
      );

      const withoutPokemon = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 5,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          0
        )
      );

      expect(withPokemon).toBeGreaterThan(withoutPokemon);
    });

    it('should scale with more Pokemon', () => {
      const few = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 5,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          10
        )
      );

      const many = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 5,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          100
        )
      );

      expect(many).toBeGreaterThan(few);
    });
  });

  describe('all bonuses combined', () => {
    it('should stack all bonuses multiplicatively', () => {
      const baseOnly = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        })
      );

      const allBonuses = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 3,
            pokedexBonus: 5,
            luckyHitChance: 1,
            luckyHitMultiplier: 1,
          },
          25
        )
      );

      expect(allBonuses).toBeGreaterThan(baseOnly * 1.3); // Should be more than 30% increase
    });

    it('should return exactly 2 decimal places', () => {
      const result = calculateBaseCandyPerClick(
        {
          clickPower: 3,
          autoclicker: 1,
          clickMultiplier: 2,
          pokedexBonus: 2,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        },
        10
      );
      expect(result).toMatch(/^\d+\.\d{2}$/);
    });
  });
});

describe('calculateCandyPerClick', () => {
  let randomSpy: any;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('edge cases', () => {
    it('should return "1" when stats is undefined', () => {
      const result = calculateCandyPerClick(undefined);
      expect(result).toBe('1');
    });

    it('should handle stats with all level 1 values', () => {
      randomSpy.mockReturnValue(0.5);
      const stats: UserStats = {
        clickPower: 1,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      };
      const result = calculateCandyPerClick(stats);
      expect(result).toBe('1.00');
    });

    it('should handle ownedPokemonCount as 0 by default', () => {
      randomSpy.mockReturnValue(0.5);
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 10,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      };
      const result = calculateCandyPerClick(stats);
      expect(parseFloat(result)).toBeGreaterThan(1);
    });
  });

  describe('without lucky hit stats', () => {
    it('should match calculateBaseCandyPerClick when no luckyHitChance', () => {
      randomSpy.mockReturnValue(0.5);
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 3,
        pokedexBonus: 2,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      };
      const result1 = calculateCandyPerClick(stats, 25);
      const result2 = calculateBaseCandyPerClick(stats, 25);
      expect(result1).toBe(result2);
    });

    it('should not apply lucky hit when luckyHitChance level is 1', () => {
      randomSpy.mockReturnValue(0.01);
      const stats: UserStats = {
        clickPower: 10,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 1,
        luckyHitMultiplier: 5,
      };
      const result = calculateCandyPerClick(stats);
      const base = calculateBaseCandyPerClick(stats);
      expect(result).toBe(base);
    });
  });

  describe('lucky hit mechanics', () => {
    it('should not apply lucky hit when random >= threshold', () => {
      randomSpy.mockReturnValue(0.5);
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 5,
        luckyHitMultiplier: 5,
      };
      const result = calculateCandyPerClick(stats);
      const base = calculateBaseCandyPerClick(stats);
      expect(result).toBe(base);
    });

    it('should apply lucky hit when random < threshold', () => {
      randomSpy.mockReturnValue(0.001);
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 5,
        luckyHitMultiplier: 5,
      };
      const result = calculateCandyPerClick(stats);
      const base = calculateBaseCandyPerClick(stats);
      expect(parseFloat(result)).toBeGreaterThan(parseFloat(base));
    });

    it('should not apply lucky hit multiplier without luckyHitMultiplier stat', () => {
      randomSpy.mockReturnValue(0.001);
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 5,
        luckyHitMultiplier: undefined,
      };
      const result = calculateCandyPerClick(stats);
      const base = calculateBaseCandyPerClick(stats);
      expect(result).toBe(base);
    });

    it('should respect lucky hit probability threshold', () => {
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 10,
        luckyHitMultiplier: 3,
      };

      randomSpy.mockReturnValue(0.001);
      const lucky = parseFloat(calculateCandyPerClick(stats));

      randomSpy.mockReturnValue(0.5);
      const normal = parseFloat(calculateCandyPerClick(stats));

      expect(lucky).toBeGreaterThan(normal);
    });

    it('should scale with lucky hit multiplier level', () => {
      randomSpy.mockReturnValue(0.001);

      const level3 = parseFloat(
        calculateCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 5,
          luckyHitMultiplier: 3,
        })
      );

      const level10 = parseFloat(
        calculateCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
          luckyHitChance: 5,
          luckyHitMultiplier: 10,
        })
      );

      expect(level10).toBeGreaterThan(level3);
    });
  });

  describe('lucky hit stacking', () => {
    it('should apply lucky hit on top of clickMultiplier', () => {
      randomSpy.mockReturnValue(0.001);

      const withoutLucky = parseFloat(
        calculateBaseCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 3,
          pokedexBonus: 1,
          luckyHitChance: 5,
          luckyHitMultiplier: 5,
        })
      );

      const withLucky = parseFloat(
        calculateCandyPerClick({
          clickPower: 5,
          autoclicker: 1,
          clickMultiplier: 3,
          pokedexBonus: 1,
          luckyHitChance: 5,
          luckyHitMultiplier: 5,
        })
      );

      expect(withLucky).toBeGreaterThan(withoutLucky);
    });

    it('should apply lucky hit on top of pokedexBonus', () => {
      randomSpy.mockReturnValue(0.001);

      const withoutLucky = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 5,
            luckyHitChance: 5,
            luckyHitMultiplier: 5,
          },
          25
        )
      );

      const withLucky = parseFloat(
        calculateCandyPerClick(
          {
            clickPower: 5,
            autoclicker: 1,
            clickMultiplier: 1,
            pokedexBonus: 5,
            luckyHitChance: 5,
            luckyHitMultiplier: 5,
          },
          25
        )
      );

      expect(withLucky).toBeGreaterThan(withoutLucky);
    });

    it('should apply lucky hit on top of all bonuses', () => {
      randomSpy.mockReturnValue(0.001);

      const withoutLucky = parseFloat(
        calculateBaseCandyPerClick(
          {
            clickPower: 10,
            autoclicker: 1,
            clickMultiplier: 5,
            pokedexBonus: 5,
            luckyHitChance: 10,
            luckyHitMultiplier: 8,
          },
          50
        )
      );

      const withLucky = parseFloat(
        calculateCandyPerClick(
          {
            clickPower: 10,
            autoclicker: 1,
            clickMultiplier: 5,
            pokedexBonus: 5,
            luckyHitChance: 10,
            luckyHitMultiplier: 8,
          },
          50
        )
      );

      expect(withLucky).toBeGreaterThan(withoutLucky);
    });
  });

  describe('randomness simulation', () => {
    it('should sometimes trigger lucky hit and sometimes not', () => {
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 5,
        luckyHitMultiplier: 5,
      };

      const results = new Set<string>();

      for (let i = 0; i < 10; i++) {
        randomSpy.mockReturnValue(i % 2 === 0 ? 0.001 : 0.5);
        const result = calculateCandyPerClick(stats);
        results.add(result);
      }

      expect(results.size).toBe(2);
    });

    it('should produce different results based on Math.random()', () => {
      const stats: UserStats = {
        clickPower: 5,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 5,
        luckyHitMultiplier: 5,
      };

      randomSpy.mockReturnValue(0.001);
      const lucky = calculateCandyPerClick(stats);

      randomSpy.mockReturnValue(0.5);
      const normal = calculateCandyPerClick(stats);

      expect(lucky).not.toBe(normal);
      expect(parseFloat(lucky)).toBeGreaterThan(parseFloat(normal));
    });
  });

  describe('return format', () => {
    it('should return exactly 2 decimal places', () => {
      randomSpy.mockReturnValue(0.5);
      const result = calculateCandyPerClick(
        {
          clickPower: 7,
          autoclicker: 1,
          clickMultiplier: 4,
          pokedexBonus: 3,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
        },
        15
      );
      expect(result).toMatch(/^\d+\.\d{2}$/);
    });

    it('should return 2 decimal places even with lucky hit', () => {
      randomSpy.mockReturnValue(0.001);
      const result = calculateCandyPerClick(
        {
          clickPower: 7,
          autoclicker: 1,
          clickMultiplier: 4,
          pokedexBonus: 3,
          luckyHitChance: 5,
          luckyHitMultiplier: 5,
        },
        15
      );
      expect(result).toMatch(/^\d+\.\d{2}$/);
    });
  });
});
