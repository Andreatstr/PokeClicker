import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGameMutations } from '../useGameMutations'
import { createMockUser } from '../../../../test/factories'

// Mock Apollo Client mutations
const mockUpdateRareCandyMutation = vi.fn()
const mockUpgradeStatMutation = vi.fn()

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client')
  return {
    ...actual,
    useMutation: vi.fn((mutation) => {
      if (mutation.definitions[0].name.value === 'UpdateRareCandy') {
        return [mockUpdateRareCandyMutation, { loading: false, error: null }]
      }
      if (mutation.definitions[0].name.value === 'UpgradeStat') {
        return [mockUpgradeStatMutation, { loading: false, error: null }]
      }
      return [vi.fn(), { loading: false, error: null }]
    }),
  }
})

describe('useGameMutations hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return mutation functions and loading state', () => {
    const { result } = renderHook(() => useGameMutations())

    expect(result.current).toHaveProperty('updateRareCandy')
    expect(result.current).toHaveProperty('upgradeStat')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('error')

    expect(typeof result.current.updateRareCandy).toBe('function')
    expect(typeof result.current.upgradeStat).toBe('function')
    expect(typeof result.current.loading).toBe('boolean')
  })

  it('should call updateRareCandy mutation with correct variables', async () => {
    const mockUser = createMockUser()
    const mockResult = { data: { updateRareCandy: mockUser } }
    mockUpdateRareCandyMutation.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useGameMutations())

    await result.current.updateRareCandy(100)

    expect(mockUpdateRareCandyMutation).toHaveBeenCalledWith({
      variables: { amount: 100 },
    })
  })

  it('should call upgradeStat mutation with correct variables', async () => {
    const mockUser = createMockUser()
    const mockResult = { data: { upgradeStat: mockUser } }
    mockUpgradeStatMutation.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useGameMutations())

    await result.current.upgradeStat('hp')

    expect(mockUpgradeStatMutation).toHaveBeenCalledWith({
      variables: { stat: 'hp' },
    })
  })

  it('should return user data from updateRareCandy mutation', async () => {
    const mockUser = createMockUser()
    const mockResult = { data: { updateRareCandy: mockUser } }
    mockUpdateRareCandyMutation.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useGameMutations())

    const user = await result.current.updateRareCandy(100)

    expect(user).toEqual(mockUser)
  })

  it('should return user data from upgradeStat mutation', async () => {
    const mockUser = createMockUser()
    const mockResult = { data: { upgradeStat: mockUser } }
    mockUpgradeStatMutation.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useGameMutations())

    const user = await result.current.upgradeStat('attack')

    expect(user).toEqual(mockUser)
  })

  it('should call onCompleted callback when provided', async () => {
    const mockUser = createMockUser()
    const mockResult = { data: { updateRareCandy: mockUser } }
    mockUpdateRareCandyMutation.mockResolvedValue(mockResult)
    const onCompleted = vi.fn()

    const { result } = renderHook(() => useGameMutations())

    await result.current.updateRareCandy(100, onCompleted)

    expect(onCompleted).toHaveBeenCalledWith(mockUser)
  })

  it('should call onCompleted callback for upgradeStat when provided', async () => {
    const mockUser = createMockUser()
    const mockResult = { data: { upgradeStat: mockUser } }
    mockUpgradeStatMutation.mockResolvedValue(mockResult)
    const onCompleted = vi.fn()

    const { result } = renderHook(() => useGameMutations())

    await result.current.upgradeStat('defense', onCompleted)

    expect(onCompleted).toHaveBeenCalledWith(mockUser)
  })

  it('should handle updateRareCandy mutation errors', async () => {
    const mockError = new Error('Network error')
    mockUpdateRareCandyMutation.mockRejectedValue(mockError)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useGameMutations())

    await expect(result.current.updateRareCandy(100)).rejects.toThrow('Network error')
    expect(consoleSpy).toHaveBeenCalledWith('Failed to update rare candy:', mockError)

    consoleSpy.mockRestore()
  })

  it('should handle upgradeStat mutation errors', async () => {
    const mockError = new Error('Network error')
    mockUpgradeStatMutation.mockRejectedValue(mockError)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useGameMutations())

    await expect(result.current.upgradeStat('hp')).rejects.toThrow('Network error')
    expect(consoleSpy).toHaveBeenCalledWith('Failed to upgrade stat:', mockError)

    consoleSpy.mockRestore()
  })

  it('should not call onCompleted when mutation fails', async () => {
    const mockError = new Error('Network error')
    mockUpdateRareCandyMutation.mockRejectedValue(mockError)
    const onCompleted = vi.fn()

    const { result } = renderHook(() => useGameMutations())

    try {
      await result.current.updateRareCandy(100, onCompleted)
    } catch (error) {
      // Expected to throw
    }

    expect(onCompleted).not.toHaveBeenCalled()
  })

  it('should not call onCompleted when no data is returned', async () => {
    const mockResult = { data: null }
    mockUpdateRareCandyMutation.mockResolvedValue(mockResult)
    const onCompleted = vi.fn()

    const { result } = renderHook(() => useGameMutations())

    await result.current.updateRareCandy(100, onCompleted)

    expect(onCompleted).not.toHaveBeenCalled()
  })
})
