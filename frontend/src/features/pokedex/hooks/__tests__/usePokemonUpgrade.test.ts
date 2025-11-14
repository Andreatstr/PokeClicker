import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {
  usePokemonUpgrade,
  useUpgradePokemonMutation,
} from '../usePokemonUpgrade';

// Mock Apollo Client
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('@apollo/client', () => ({
  useQuery: (query: any, options: any) => mockUseQuery(query, options),
  useMutation: (mutation: any) => mockUseMutation(mutation),
  gql: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/graphql', () => ({
  POKEMON_UPGRADE_QUERY: {},
  UPGRADE_POKEMON_MUTATION: {},
}));

describe('usePokemonUpgrade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useQuery with pokemonId', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderHook(() => usePokemonUpgrade(25));
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        variables: {pokemonId: 25},
        skip: false,
      })
    );
  });

  it('should skip query when pokemonId is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderHook(() => usePokemonUpgrade(null));
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({skip: true})
    );
  });

  it('should skip when pokemonId is 0 (falsy)', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderHook(() => usePokemonUpgrade(0));
    // 0 is falsy, so it will skip with !pokemonId check
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({skip: true})
    );
  });

  it('should return upgrade data when query succeeds', () => {
    const mockUpgrade = {pokemon_id: 25, level: 5};
    mockUseQuery.mockReturnValue({
      data: {pokemonUpgrade: mockUpgrade},
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const {result} = renderHook(() => usePokemonUpgrade(25));
    expect(result.current.upgrade).toEqual(mockUpgrade);
  });

  it('should return undefined when data is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const {result} = renderHook(() => usePokemonUpgrade(25));
    expect(result.current.upgrade).toBeUndefined();
  });

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    const {result} = renderHook(() => usePokemonUpgrade(25));
    expect(result.current.loading).toBe(true);
  });

  it('should return error state', () => {
    const mockError = new Error('Query failed');
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: mockError,
      refetch: vi.fn(),
    });
    const {result} = renderHook(() => usePokemonUpgrade(25));
    expect(result.current.error).toBe(mockError);
  });

  it('should return refetch function', () => {
    const mockRefetch = vi.fn();
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const {result} = renderHook(() => usePokemonUpgrade(25));
    expect(result.current.refetch).toBe(mockRefetch);
  });

  it('should return all fields', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const {result} = renderHook(() => usePokemonUpgrade(25));
    expect(result.current).toHaveProperty('upgrade');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
  });

  it('should handle different Pokemon IDs', () => {
    mockUseQuery.mockReturnValue({
      data: {pokemonUpgrade: {pokemon_id: 150, level: 10}},
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const {result} = renderHook(() => usePokemonUpgrade(150));
    expect(result.current.upgrade?.pokemon_id).toBe(150);
  });

  it('should update when pokemonId changes', () => {
    mockUseQuery.mockReturnValue({
      data: {pokemonUpgrade: {pokemon_id: 25, level: 5}},
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const {rerender} = renderHook(({id}) => usePokemonUpgrade(id), {
      initialProps: {id: 25},
    });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({variables: {pokemonId: 25}})
    );
    mockUseQuery.mockReturnValue({
      data: {pokemonUpgrade: {pokemon_id: 50, level: 3}},
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    rerender({id: 50});
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({variables: {pokemonId: 50}})
    );
  });
});

describe('useUpgradePokemonMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useMutation with UPGRADE_POKEMON_MUTATION', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    renderHook(() => useUpgradePokemonMutation());
    expect(mockUseMutation).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should return tuple format', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
  });

  it('should return mutation function as first element', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    expect(typeof result.current[0]).toBe('function');
    expect(result.current[0]).toBe(mockMutate);
  });

  it('should return mutation state as second element', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    expect(result.current[1]).toHaveProperty('loading');
    expect(result.current[1]).toHaveProperty('error');
  });

  it('should return loading state', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([mockMutate, {loading: true, error: null}]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    expect(result.current[1].loading).toBe(true);
  });

  it('should return error state', () => {
    const mockError = new Error('Mutation failed');
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: mockError},
    ]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    expect(result.current[1].error).toBe(mockError);
  });

  it('should allow calling mutation function', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    const [upgradePokemon] = result.current;
    upgradePokemon({variables: {pokemonId: 25}});
    expect(mockMutate).toHaveBeenCalledWith({variables: {pokemonId: 25}});
  });

  it('should handle different Pokemon IDs', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result} = renderHook(() => useUpgradePokemonMutation());
    const [upgradePokemon] = result.current;
    upgradePokemon({variables: {pokemonId: 1}});
    expect(mockMutate).toHaveBeenCalledWith({variables: {pokemonId: 1}});
    upgradePokemon({variables: {pokemonId: 150}});
    expect(mockMutate).toHaveBeenCalledWith({variables: {pokemonId: 150}});
  });
});

describe('integration', () => {
  it('should work with both hooks in same component', () => {
    mockUseQuery.mockReturnValue({
      data: {pokemonUpgrade: {pokemon_id: 25, level: 5}},
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result: queryResult} = renderHook(() => usePokemonUpgrade(25));
    const {result: mutationResult} = renderHook(() =>
      useUpgradePokemonMutation()
    );
    expect(queryResult.current.upgrade?.level).toBe(5);
    expect(typeof mutationResult.current[0]).toBe('function');
  });

  it('should refetch query after mutation', () => {
    const mockRefetch = vi.fn();
    mockUseQuery.mockReturnValue({
      data: {pokemonUpgrade: {pokemon_id: 25, level: 5}},
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue([
      mockMutate,
      {loading: false, error: null},
    ]);
    const {result: queryResult} = renderHook(() => usePokemonUpgrade(25));
    const {result: mutationResult} = renderHook(() =>
      useUpgradePokemonMutation()
    );
    mutationResult.current[0]({variables: {pokemonId: 25}});
    queryResult.current.refetch();
    expect(mockRefetch).toHaveBeenCalled();
  });
});
