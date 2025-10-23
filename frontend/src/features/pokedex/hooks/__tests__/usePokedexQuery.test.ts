import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePokedexQuery } from '../usePokedexQuery'
import { createMockPokemon } from '../../../../test/factories'

// Mock Apollo Client useQuery
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  gql: vi.fn().mockReturnValue({}),
}))

// Get the mocked useQuery function
const { useQuery } = await import('@apollo/client')
const mockUseQuery = vi.mocked(useQuery)

describe('usePokedexQuery hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return query result with default variables', () => {
    const mockData = {
      pokedex: {
        pokemon: [createMockPokemon()],
        total: 1,
      },
    }
    const mockRefetch = vi.fn()

    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    })

    const { result } = renderHook(() => usePokedexQuery({}))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(result.current.refetch).toBe(mockRefetch)
  })

  it('should pass variables to useQuery', () => {
    const variables = {
      search: 'pikachu',
      type: 'electric',
      limit: 10,
      offset: 0,
    }

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    })

    renderHook(() => usePokedexQuery(variables))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object), // POKEDEX_QUERY
      {
        variables,
        fetchPolicy: 'cache-and-network',
      }
    )
  })

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePokedexQuery({}))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Network error')
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: mockError,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePokedexQuery({}))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBe(mockError)
  })

  it('should handle successful data fetch', () => {
    const mockPokemon = createMockPokemon()
    const mockData = {
      pokedex: {
        pokemon: [mockPokemon],
        total: 1,
      },
    }

    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => usePokedexQuery({}))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle search variables', () => {
    const variables = {
      search: 'charizard',
      limit: 20,
      offset: 0,
    }

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    })

    renderHook(() => usePokedexQuery(variables))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      {
        variables,
        fetchPolicy: 'cache-and-network',
      }
    )
  })

  it('should handle filter variables', () => {
    const variables = {
      type: 'fire',
      generation: '1',
      sortBy: 'name',
      sortOrder: 'asc',
    }

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    })

    renderHook(() => usePokedexQuery(variables))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      {
        variables,
        fetchPolicy: 'cache-and-network',
      }
    )
  })

  it('should handle pagination variables', () => {
    const variables = {
      limit: 50,
      offset: 100,
    }

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    })

    renderHook(() => usePokedexQuery(variables))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      {
        variables,
        fetchPolicy: 'cache-and-network',
      }
    )
  })

  it('should handle user-specific queries', () => {
    const variables = {
      userId: 'user123',
      limit: 10,
      offset: 0,
    }

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    })

    renderHook(() => usePokedexQuery(variables))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object),
      {
        variables,
        fetchPolicy: 'cache-and-network',
      }
    )
  })

  it('should return refetch function', () => {
    const mockRefetch = vi.fn()
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    })

    const { result } = renderHook(() => usePokedexQuery({}))

    expect(result.current.refetch).toBe(mockRefetch)
    expect(typeof result.current.refetch).toBe('function')
  })
})
