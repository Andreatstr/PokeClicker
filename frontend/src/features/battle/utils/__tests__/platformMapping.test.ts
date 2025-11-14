import {describe, it, expect} from 'vitest';
import {getPlatformImage} from '../platformMapping';

describe('getPlatformImage', () => {
  describe('Type to Platform Mapping', () => {
    it('should return grass platform for grass type', () => {
      const result = getPlatformImage(['grass']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should return grass platform for bug type', () => {
      const result = getPlatformImage(['bug']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should return rock platform for fire type', () => {
      const result = getPlatformImage(['fire']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should return water platform for water type', () => {
      const result = getPlatformImage(['water']);
      expect(result).toBe('/project2/plattforms/water.webp');
    });

    it('should return ice platform for ice type', () => {
      const result = getPlatformImage(['ice']);
      expect(result).toBe('/project2/plattforms/ice.webp');
    });

    it('should return lightdirt platform for electric type', () => {
      const result = getPlatformImage(['electric']);
      expect(result).toBe('/project2/plattforms/lightdirt.webp');
    });

    it('should return sand platform for ground type', () => {
      const result = getPlatformImage(['ground']);
      expect(result).toBe('/project2/plattforms/sand.webp');
    });

    it('should return rock platform for rock type', () => {
      const result = getPlatformImage(['rock']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should return museum platform for psychic type', () => {
      const result = getPlatformImage(['psychic']);
      expect(result).toBe('/project2/plattforms/museum.webp');
    });

    it('should return museum platform for ghost type', () => {
      const result = getPlatformImage(['ghost']);
      expect(result).toBe('/project2/plattforms/museum.webp');
    });

    it('should return steel-gym platform for steel type', () => {
      const result = getPlatformImage(['steel']);
      expect(result).toBe('/project2/plattforms/steel-gym.webp');
    });

    it('should return rock platform for fighting type', () => {
      const result = getPlatformImage(['fighting']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should return mud platform for poison type', () => {
      const result = getPlatformImage(['poison']);
      expect(result).toBe('/project2/plattforms/mud.webp');
    });

    it('should return rock platform for dragon type', () => {
      const result = getPlatformImage(['dragon']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should return forest platform for fairy type', () => {
      const result = getPlatformImage(['fairy']);
      expect(result).toBe('/project2/plattforms/forest.webp');
    });

    it('should return forest platform for dark type', () => {
      const result = getPlatformImage(['dark']);
      expect(result).toBe('/project2/plattforms/forest.webp');
    });

    it('should return grass platform for flying type', () => {
      const result = getPlatformImage(['flying']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should return grass platform for normal type', () => {
      const result = getPlatformImage(['normal']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });
  });

  describe('Dual Type Pokemon', () => {
    it('should use first type for dual-type Pokemon', () => {
      const result = getPlatformImage(['fire', 'flying']);
      expect(result).toBe('/project2/plattforms/rock.webp'); // fire -> rock
    });

    it('should ignore secondary type', () => {
      const result = getPlatformImage(['grass', 'poison']);
      expect(result).toBe('/project2/plattforms/grass.webp'); // grass -> grass
    });

    it('should handle water/flying combination', () => {
      const result = getPlatformImage(['water', 'flying']);
      expect(result).toBe('/project2/plattforms/water.webp'); // water -> water
    });

    it('should handle psychic/fairy combination', () => {
      const result = getPlatformImage(['psychic', 'fairy']);
      expect(result).toBe('/project2/plattforms/museum.webp'); // psychic -> museum
    });

    it('should handle dragon/flying combination', () => {
      const result = getPlatformImage(['dragon', 'flying']);
      expect(result).toBe('/project2/plattforms/rock.webp'); // dragon -> rock
    });
  });

  describe('Case Sensitivity', () => {
    it('should handle uppercase types', () => {
      const result = getPlatformImage(['FIRE']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should handle mixed case types', () => {
      const result = getPlatformImage(['WaTeR']);
      expect(result).toBe('/project2/plattforms/water.webp');
    });

    it('should handle all caps types', () => {
      const result = getPlatformImage(['ELECTRIC']);
      expect(result).toBe('/project2/plattforms/lightdirt.webp');
    });
  });

  describe('Edge Cases', () => {
    it('should return default grass platform for unknown type', () => {
      const result = getPlatformImage(['unknown']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should return default grass platform for empty type', () => {
      const result = getPlatformImage(['']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should handle empty array', () => {
      const result = getPlatformImage([]);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should handle undefined first type', () => {
      const result = getPlatformImage([undefined as any]);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should handle null in types array', () => {
      const result = getPlatformImage([null as any]);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });
  });

  describe('Platform Path Format', () => {
    it('should return path with correct base URL', () => {
      const result = getPlatformImage(['fire']);
      expect(result).toContain('/project2/plattforms/');
    });

    it('should return path with .webp extension', () => {
      const result = getPlatformImage(['water']);
      expect(result.endsWith('.webp')).toBe(true);
    });

    it('should return valid path format', () => {
      const result = getPlatformImage(['grass']);
      expect(result).toMatch(/^\/project2\/plattforms\/\w+\.webp$/);
    });
  });

  describe('All Type Coverage', () => {
    it('should handle all 18 Pokemon types', () => {
      const allTypes = [
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

      allTypes.forEach((type) => {
        const result = getPlatformImage([type]);
        expect(result).toBeDefined();
        expect(result).toContain('.webp');
      });
    });
  });

  describe('Multiple Pokemon Scenarios', () => {
    it('should handle Bulbasaur (grass/poison)', () => {
      const result = getPlatformImage(['grass', 'poison']);
      expect(result).toBe('/project2/plattforms/grass.webp');
    });

    it('should handle Charmander (fire)', () => {
      const result = getPlatformImage(['fire']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should handle Squirtle (water)', () => {
      const result = getPlatformImage(['water']);
      expect(result).toBe('/project2/plattforms/water.webp');
    });

    it('should handle Pikachu (electric)', () => {
      const result = getPlatformImage(['electric']);
      expect(result).toBe('/project2/plattforms/lightdirt.webp');
    });

    it('should handle Mewtwo (psychic)', () => {
      const result = getPlatformImage(['psychic']);
      expect(result).toBe('/project2/plattforms/museum.webp');
    });

    it('should handle Gengar (ghost/poison)', () => {
      const result = getPlatformImage(['ghost', 'poison']);
      expect(result).toBe('/project2/plattforms/museum.webp');
    });

    it('should handle Dragonite (dragon/flying)', () => {
      const result = getPlatformImage(['dragon', 'flying']);
      expect(result).toBe('/project2/plattforms/rock.webp');
    });

    it('should handle Steelix (steel/ground)', () => {
      const result = getPlatformImage(['steel', 'ground']);
      expect(result).toBe('/project2/plattforms/steel-gym.webp');
    });
  });

  describe('Consistency', () => {
    it('should return same result for same input', () => {
      const result1 = getPlatformImage(['fire']);
      const result2 = getPlatformImage(['fire']);
      expect(result1).toBe(result2);
    });

    it('should return same result for equivalent case variations', () => {
      const result1 = getPlatformImage(['fire']);
      const result2 = getPlatformImage(['FIRE']);
      const result3 = getPlatformImage(['Fire']);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('Platform Variety', () => {
    it('should use different platforms for different types', () => {
      const platforms = new Set<string>();
      const types = ['grass', 'fire', 'water', 'electric', 'psychic', 'steel'];

      types.forEach((type) => {
        platforms.add(getPlatformImage([type]));
      });

      // Should have multiple unique platforms (not all the same)
      expect(platforms.size).toBeGreaterThan(1);
    });

    it('should have variety in platform assignments', () => {
      const grassPlatform = getPlatformImage(['grass']);
      const rockPlatform = getPlatformImage(['fire']);
      const waterPlatform = getPlatformImage(['water']);

      expect(grassPlatform).not.toBe(rockPlatform);
      expect(grassPlatform).not.toBe(waterPlatform);
      expect(rockPlatform).not.toBe(waterPlatform);
    });
  });

  describe('Platform Groups', () => {
    it('should group similar types to same platform', () => {
      // Grass platform group
      expect(getPlatformImage(['grass'])).toBe(getPlatformImage(['bug']));
      expect(getPlatformImage(['grass'])).toBe(getPlatformImage(['flying']));
      expect(getPlatformImage(['grass'])).toBe(getPlatformImage(['normal']));
    });

    it('should group psychic/ghost to museum', () => {
      expect(getPlatformImage(['psychic'])).toBe(getPlatformImage(['ghost']));
    });

    it('should group fairy/dark to forest', () => {
      expect(getPlatformImage(['fairy'])).toBe(getPlatformImage(['dark']));
    });

    it('should map multiple types to rock platform', () => {
      const rockTypes = ['fire', 'rock', 'fighting', 'dragon'];
      const rockPlatform = '/project2/plattforms/rock.webp';

      rockTypes.forEach((type) => {
        expect(getPlatformImage([type])).toBe(rockPlatform);
      });
    });
  });
});
