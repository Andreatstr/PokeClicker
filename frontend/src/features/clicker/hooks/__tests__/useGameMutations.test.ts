import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useGameMutations} from '../useGameMutations';

// Mock the actual mutation function that gets called
const mockUpdateRareCandyMutation = vi.fn();
const mockUpgradeStatMutation = vi.fn();

// Mock loading and error states
let mockCandyLoading = false;
let mockCandyError: Error | null = null;
let mockStatLoading = false;
let mockStatError: Error | null = null;

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useMutation: vi.fn((mutation) => {
      const mutationName = mutation.definitions[0].name.value;
      if (mutationName === 'UpdateRareCandy') {
        return [
          mockUpdateRareCandyMutation,
          {loading: mockCandyLoading, error: mockCandyError},
        ];
      }
      if (mutationName === 'UpgradeStat') {
        return [
          mockUpgradeStatMutation,
          {loading: mockStatLoading, error: mockStatError},
        ];
      }
      return [vi.fn(), {loading: false, error: null}];
    }),
  };
});

describe('useGameMutations hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCandyLoading = false;
    mockCandyError = null;
    mockStatLoading = false;
    mockStatError = null;
  });

  it('should return mutation functions and loading state', () => {
    const {result} = renderHook(() => useGameMutations());

    expect(result.current).toHaveProperty('updateRareCandy');
    expect(result.current).toHaveProperty('upgradeStat');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');

    expect(typeof result.current.updateRareCandy).toBe('function');
    expect(typeof result.current.upgradeStat).toBe('function');
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should return undefined when mutation returns no data', async () => {
    const mockResult = {data: null};
    mockUpdateRareCandyMutation.mockResolvedValue(mockResult);

    const {result} = renderHook(() => useGameMutations());
    const user = await result.current.updateRareCandy(100);

    expect(user).toBeUndefined();
  });
});
