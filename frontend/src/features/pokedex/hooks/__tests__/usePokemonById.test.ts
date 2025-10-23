import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePokemonById } from '../usePokemonById'

// Mock Apollo Client useQuery
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  gql: vi.fn().mockReturnValue({}),
}))

// Get the mocked useQuery function
const { useQuery } = await import('@apollo/client')
const mockUseQuery = vi.mocked(useQuery)

describe('usePokemonById hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call useQuery with correct variables when id is provided', () => {
    const mockData = {
      pokemonById: {
        id: 1,
        name: 'bulbasaur',
        types: ['grass', 'poison'],
        sprite: 'https://example.com/bulbasaur.png',
        stats: {
          hp: 45,
          attack: 49,
          defense: 49,
          spAttack: 65,
          spDefense: 65,
          speed: 45,
        },
        height: 0.7,
        weight: 6.9,
        abilities: ['overgrow', 'chlorophyll'],
        evolution: [2, 3],
      },
    }

    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    })

    renderHook(() => usePokemonById(1))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object), // POKEMON_BY_ID_QUERY
      {
        variables: { id: 1 },
        skip: false,
      }
    )
  })

  it('should skip query when id is null', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    })

    renderHook(() => usePokemonById(null))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.any(Object), // POKEMON_BY_ID_QUERY
      {
        variables: { id: null },
        skip: true,
      }
    )
  })

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    })

    const { result } = renderHook(() => usePokemonById(1))

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
    })

    const { result } = renderHook(() => usePokemonById(1))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBe(mockError)
  })

  it('should handle successful data fetch', () => {
    const mockPokemon = {
      id: 1,
      name: 'bulbasaur',
      types: ['grass', 'poison'],
      sprite: 'https://example.com/bulbasaur.png',
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        spAttack: 65,
        spDefense: 65,
        speed: 45,
      },
      height: 0.7,
      weight: 6.9,
      abilities: ['overgrow', 'chlorophyll'],
      evolution: [2, 3],
    }

    const mockData = { pokemonById: mockPokemon }

    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    })

    const { result } = renderHook(() => usePokemonById(1))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle null Pokemon data', () => {
    const mockData = { pokemonById: null }

    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    })

    const { result } = renderHook(() => usePokemonById(999))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data?.pokemonById).toBeNull()
  })

  it('should handle different Pokemon IDs', () => {
    const mockPokemon = {
      id: 25,
      name: 'pikachu',
      types: ['electric'],
      sprite: 'https://example.com/pikachu.png',
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        spAttack: 50,
        spDefense: 50,
        speed: 90,
      },
      height: 0.4,
      weight: 6.0,
      abilities: ['static', 'lightning-rod'],
      evolution: [26],
    }

    const mockData = { pokemonById: mockPokemon }

    mockUseQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined,
    })

    const { result } = renderHook(() => usePokemonById(25))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data?.pokemonById?.id).toBe(25)
    expect(result.current.data?.pokemonById?.name).toBe('pikachu')
  })

  it('should pass through all useQuery return values', () => {
    const mockRefetch = vi.fn()
    const mockNetworkStatus = 7

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: mockRefetch,
      networkStatus: mockNetworkStatus,
    })

    const { result } = renderHook(() => usePokemonById(1))

    expect(result.current.data).toBeUndefined()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeUndefined()
    expect(result.current.refetch).toBe(mockRefetch)
    expect(result.current.networkStatus).toBe(mockNetworkStatus)
  })
})
