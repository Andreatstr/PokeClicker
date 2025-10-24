import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ApolloError } from '@apollo/client'
import { usePurchasePokemon } from '../usePurchasePokemon'


// Mock Apollo Client useMutation
vi.mock('@apollo/client', () => ({
  useMutation: vi.fn(),
  gql: vi.fn().mockReturnValue({}),
  HttpLink: vi.fn(),
  setContext: vi.fn(),
  ApolloClient: vi.fn(),
  InMemoryCache: vi.fn(),
  from: vi.fn(),
  ApolloError: class MockApolloError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ApolloError'
      this.graphQLErrors = []
      this.protocolErrors = []
      this.clientErrors = []
      this.networkError = null
      this.extraInfo = undefined
    }
    graphQLErrors: any[] = []
    protocolErrors: any[] = []
    clientErrors: any[] = []
    networkError: any = null
    extraInfo: any = undefined
  },
}))

// Get the mocked useMutation function
const { useMutation } = await import('@apollo/client')
const mockUseMutation = useMutation as any

describe('usePurchasePokemon hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return mutation function and loading state', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    const { result } = renderHook(() => usePurchasePokemon())

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toBe(mockMutation)
    expect(result.current[1]).toHaveProperty('loading')
    expect(result.current[1]).toHaveProperty('error')
  })

  it('should call useMutation with correct mutation and options', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    renderHook(() => usePurchasePokemon())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.any(Object), // PURCHASE_POKEMON_MUTATION
      {
        refetchQueries: ['Pokedex', 'Me'],
        optimisticResponse: expect.any(Function),
      }
    )
  })

  it('should provide optimistic response function', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    renderHook(() => usePurchasePokemon())

    const callArgs = mockUseMutation.mock.calls[0]
    const options = callArgs[1]
    const optimisticResponse = options.optimisticResponse

    expect(typeof optimisticResponse).toBe('function')

    const variables = { pokemonId: 25 }
    const result = optimisticResponse(variables)

    expect(result).toHaveProperty('purchasePokemon')
    expect(result.purchasePokemon).toHaveProperty('__typename', 'User')
    expect(result.purchasePokemon).toHaveProperty('_id', '')
    expect(result.purchasePokemon).toHaveProperty('username', '')
    expect(result.purchasePokemon).toHaveProperty('rare_candy', 0)
    expect(result.purchasePokemon).toHaveProperty('owned_pokemon_ids', [25])
    expect(result.purchasePokemon).toHaveProperty('stats')
    expect(result.purchasePokemon.stats).toHaveProperty('__typename', 'UserStats')
    expect(result.purchasePokemon.stats).toHaveProperty('hp', 1)
    expect(result.purchasePokemon.stats).toHaveProperty('attack', 1)
    expect(result.purchasePokemon.stats).toHaveProperty('defense', 1)
    expect(result.purchasePokemon.stats).toHaveProperty('spAttack', 1)
    expect(result.purchasePokemon.stats).toHaveProperty('spDefense', 1)
    expect(result.purchasePokemon.stats).toHaveProperty('speed', 1)
  })

  it('should handle different Pokemon IDs in optimistic response', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    renderHook(() => usePurchasePokemon())

    const callArgs = mockUseMutation.mock.calls[0]
    const options = callArgs[1]
    const optimisticResponse = options.optimisticResponse

    const variables1 = { pokemonId: 1 }
    const result1 = optimisticResponse(variables1)
    expect(result1.purchasePokemon.owned_pokemon_ids).toEqual([1])

    const variables2 = { pokemonId: 999 }
    const result2 = optimisticResponse(variables2)
    expect(result2.purchasePokemon.owned_pokemon_ids).toEqual([999])
  })

  it('should include refetchQueries option', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    renderHook(() => usePurchasePokemon())

    const callArgs = mockUseMutation.mock.calls[0]
    const options = callArgs[1]

    expect(options.refetchQueries).toEqual(['Pokedex', 'Me'])
  })

  it('should return loading state', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: true,
        error: undefined,
        data: undefined,
        called: true,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    const { result } = renderHook(() => usePurchasePokemon())

    expect(result.current[1].loading).toBe(true)
  })

  it('should return error state', () => {
    const mockError = new ApolloError({
      errorMessage: 'Purchase failed',
      graphQLErrors: [],
      protocolErrors: [],
      clientErrors: [],
      networkError: new Error('Purchase failed'),
      extraInfo: undefined,
    })
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: mockError,
        data: undefined,
        called: true,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    const { result } = renderHook(() => usePurchasePokemon())

    expect(result.current[1].error).toBe(mockError)
  })

  it('should return mutation function that can be called', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    const { result } = renderHook(() => usePurchasePokemon())

    expect(typeof result.current[0]).toBe('function')
    expect(result.current[0]).toBe(mockMutation)
  })

  it('should handle optimistic response with current date', () => {
    const mockMutation = vi.fn()
    mockUseMutation.mockReturnValue([
      mockMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn(),
      },
    ])

    renderHook(() => usePurchasePokemon())

    const callArgs = mockUseMutation.mock.calls[0]
    const options = callArgs[1]
    const optimisticResponse = options.optimisticResponse

    const variables = { pokemonId: 25 }
    const result = optimisticResponse(variables)

    expect(result.purchasePokemon.created_at).toBeDefined()
    expect(typeof result.purchasePokemon.created_at).toBe('string')
    expect(new Date(result.purchasePokemon.created_at)).toBeInstanceOf(Date)
  })
})
