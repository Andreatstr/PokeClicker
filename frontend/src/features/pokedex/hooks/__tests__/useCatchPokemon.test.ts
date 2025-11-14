import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useCatchPokemon} from '../useCatchPokemon';

// Mock Apollo Client
const mockUseMutation = vi.fn();

vi.mock('@apollo/client', () => ({
  useMutation: (mutation: any, options: any) => {
    mockUseMutation(mutation, options);
    return [vi.fn(), {loading: false, error: null}];
  },
  gql: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/graphql', () => ({
  CATCH_POKEMON_MUTATION: {},
}));

describe('useCatchPokemon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useMutation with CATCH_POKEMON_MUTATION', () => {
    renderHook(() => useCatchPokemon());
    expect(mockUseMutation).toHaveBeenCalled();
  });

  it('should return mutation tuple', () => {
    const {result} = renderHook(() => useCatchPokemon());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
  });

  it('should have update function in options', () => {
    renderHook(() => useCatchPokemon());
    const callArgs = mockUseMutation.mock.calls[0];
    expect(callArgs[1]).toHaveProperty('update');
    expect(typeof callArgs[1].update).toBe('function');
  });

  describe('cache update', () => {
    let updateFn: any;
    let mockCache: any;

    beforeEach(() => {
      mockCache = {
        modify: vi.fn(),
        identify: vi.fn().mockReturnValue('Pokemon:25'),
      };
      renderHook(() => useCatchPokemon());
      updateFn = mockUseMutation.mock.calls[0][1].update;
    });

    it('should return early when data is null', () => {
      updateFn(mockCache, {data: null});
      expect(mockCache.modify).not.toHaveBeenCalled();
    });

    it('should return early when catchPokemon is null', () => {
      updateFn(mockCache, {data: {catchPokemon: null}});
      expect(mockCache.modify).not.toHaveBeenCalled();
    });

    it('should call cache.modify with valid data', () => {
      const data = {catchPokemon: {owned_pokemon_ids: [25]}};
      updateFn(mockCache, {data});
      expect(mockCache.modify).toHaveBeenCalled();
    });

    it('should extract caught Pokemon from end of array', () => {
      const data = {catchPokemon: {owned_pokemon_ids: [1, 2, 3, 25]}};
      updateFn(mockCache, {data});
      expect(mockCache.modify).toHaveBeenCalled();
    });

    it('should handle single Pokemon in array', () => {
      const data = {catchPokemon: {owned_pokemon_ids: [25]}};
      updateFn(mockCache, {data});
      expect(mockCache.modify).toHaveBeenCalled();
    });

    it('should modify pokedex field', () => {
      const data = {catchPokemon: {owned_pokemon_ids: [25]}};
      updateFn(mockCache, {data});
      expect(mockCache.modify).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.objectContaining({
            pokedex: expect.any(Function),
          }),
        })
      );
    });
  });

  describe('pokedex field modifier', () => {
    let pokedexModifier: any;
    let mockCache: any;

    beforeEach(() => {
      mockCache = {
        modify: vi.fn((options: any) => {
          if (options.fields?.pokedex) {
            pokedexModifier = options.fields.pokedex;
          }
        }),
        identify: vi.fn().mockReturnValue('Pokemon:25'),
      };
      renderHook(() => useCatchPokemon());
      const updateFn = mockUseMutation.mock.calls[0][1].update;
      const data = {catchPokemon: {owned_pokemon_ids: [25]}};
      updateFn(mockCache, {data});
    });

    it('should return existing ref when null', () => {
      const readField = vi.fn();
      const result = pokedexModifier(null, {readField});
      expect(result).toBeNull();
    });

    it('should return existing ref when pokemon array is null', () => {
      const readField = vi.fn().mockReturnValue(null);
      const existingRef = {__ref: 'Pokedex:1'};
      const result = pokedexModifier(existingRef, {readField});
      expect(result).toBe(existingRef);
    });

    it('should iterate through pokemon array', () => {
      const mockPokemonRef = {__ref: 'Pokemon:25'};
      const pokemonArray = [mockPokemonRef] as const;
      const readField = vi.fn((field: string) => {
        if (field === 'pokemon') return pokemonArray;
        if (field === 'id') return 25;
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      pokedexModifier(existingRef, {readField});
      expect(readField).toHaveBeenCalledWith('id', mockPokemonRef);
    });

    it('should call identify for matching Pokemon', () => {
      const mockPokemonRef = {__ref: 'Pokemon:25'};
      const pokemonArray = [mockPokemonRef] as const;
      const readField = vi.fn((field: string) => {
        if (field === 'pokemon') return pokemonArray;
        if (field === 'id') return 25;
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      pokedexModifier(existingRef, {readField});
      expect(mockCache.identify).toHaveBeenCalledWith({
        __typename: 'Pokemon',
        id: 25,
      });
    });

    it('should modify isOwned field to true', () => {
      const mockPokemonRef = {__ref: 'Pokemon:25'};
      const pokemonArray = [mockPokemonRef] as const;
      const readField = vi.fn((field: string) => {
        if (field === 'pokemon') return pokemonArray;
        if (field === 'id') return 25;
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      mockCache.modify.mockClear();
      let isOwnedFn: any;
      mockCache.modify.mockImplementation((options: any) => {
        if (options.id === 'Pokemon:25') {
          isOwnedFn = options.fields.isOwned;
        }
      });
      pokedexModifier(existingRef, {readField});
      expect(typeof isOwnedFn).toBe('function');
      expect(isOwnedFn()).toBe(true);
    });

    it('should not modify when identify returns null', () => {
      mockCache.identify.mockReturnValue(null);
      const mockPokemonRef = {__ref: 'Pokemon:25'};
      const pokemonArray = [mockPokemonRef] as const;
      const readField = vi.fn((field: string) => {
        if (field === 'pokemon') return pokemonArray;
        if (field === 'id') return 25;
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      mockCache.modify.mockClear();
      pokedexModifier(existingRef, {readField});
      expect(mockCache.modify).not.toHaveBeenCalled();
    });

    it('should only update matching Pokemon ID', () => {
      const mockPokemonRef1 = {__ref: 'Pokemon:1'};
      const mockPokemonRef2 = {__ref: 'Pokemon:25'};
      const mockPokemonRef3 = {__ref: 'Pokemon:50'};
      const pokemonArray = [
        mockPokemonRef1,
        mockPokemonRef2,
        mockPokemonRef3,
      ] as const;
      const readField = vi.fn((field: string, ref: any) => {
        if (field === 'pokemon') return pokemonArray;
        if (field === 'id') {
          if (ref === mockPokemonRef1) return 1;
          if (ref === mockPokemonRef2) return 25;
          if (ref === mockPokemonRef3) return 50;
        }
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      mockCache.modify.mockClear();
      pokedexModifier(existingRef, {readField});
      expect(mockCache.modify).toHaveBeenCalledTimes(1);
      expect(mockCache.modify).toHaveBeenCalledWith({
        id: 'Pokemon:25',
        fields: {isOwned: expect.any(Function)},
      });
    });

    it('should handle empty pokemon array', () => {
      const pokemonArray: readonly any[] = [];
      const readField = vi.fn((field: string) => {
        if (field === 'pokemon') return pokemonArray;
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      mockCache.modify.mockClear();
      const result = pokedexModifier(existingRef, {readField});
      expect(result).toBe(existingRef);
      expect(mockCache.modify).not.toHaveBeenCalled();
    });

    it('should return existing pokedex reference', () => {
      const mockPokemonRef = {__ref: 'Pokemon:25'};
      const pokemonArray = [mockPokemonRef] as const;
      const readField = vi.fn((field: string) => {
        if (field === 'pokemon') return pokemonArray;
        if (field === 'id') return 25;
        return null;
      });
      const existingRef = {__ref: 'Pokedex:1'};
      const result = pokedexModifier(existingRef, {readField});
      expect(result).toBe(existingRef);
    });
  });

  it('should not throw when Pokemon is not in cache', () => {
    const mockCache = {
      modify: vi.fn((options: any) => {
        if (options.fields?.pokedex) {
          const pokedexModifier = options.fields.pokedex;
          const readField = vi.fn(() => null);
          expect(() => {
            pokedexModifier({__ref: 'Pokedex:1'}, {readField});
          }).not.toThrow();
        }
      }),
      identify: vi.fn(),
    };
    renderHook(() => useCatchPokemon());
    const updateFn = mockUseMutation.mock.calls[0][1].update;
    const data = {catchPokemon: {owned_pokemon_ids: [999]}};
    expect(() => {
      updateFn(mockCache, {data});
    }).not.toThrow();
  });
});
