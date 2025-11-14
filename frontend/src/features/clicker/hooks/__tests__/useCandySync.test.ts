import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useCandySync} from '../useCandySync';
import type {User} from '@features/auth';

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    logError: vi.fn(),
    logInfo: vi.fn(),
    logWarning: vi.fn(),
  },
}));

const mockUpdateRareCandy = vi.fn();

vi.mock('../useGameMutations', () => ({
  useGameMutations: () => ({
    updateRareCandy: mockUpdateRareCandy,
    upgradeStat: vi.fn(),
    loading: false,
    error: null,
  }),
}));

describe('useCandySync', () => {
  const mockUser: User = {
    _id: '1',
    username: 'test',
    rare_candy: 100,
    created_at: new Date().toISOString(),
    stats: {
      hp: 1,
      attack: 1,
      defense: 1,
      spAttack: 1,
      spDefense: 1,
      speed: 1,
      clickPower: 1,
      passiveIncome: 1,
    },
    owned_pokemon_ids: [],
    favorite_pokemon_id: null,
    selected_pokemon_id: null,
  };

  const mockProps = {
    user: mockUser,
    isAuthenticated: true,
    updateUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with user candy amount', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      expect(result.current.localRareCandy).toBe('100');
      expect(result.current.unsyncedAmount).toBe('0');
      expect(result.current.displayError).toBeNull();
    });

    it('should initialize with 0 when no user', () => {
      const props = {...mockProps, user: null};
      const {result} = renderHook(() => useCandySync(props));

      expect(result.current.localRareCandy).toBe('0');
      expect(result.current.unsyncedAmount).toBe('0');
    });

    it('should update local candy when user changes', () => {
      const {result, rerender} = renderHook((props) => useCandySync(props), {
        initialProps: {...mockProps, user: null},
      });

      expect(result.current.localRareCandy).toBe('0');

      rerender(mockProps);

      expect(result.current.localRareCandy).toBe('100');
    });
  });

  describe('addCandy', () => {
    it('should add candy locally and track unsynced amount', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(10);
      });

      expect(result.current.localRareCandy).toBe('110');
      expect(result.current.unsyncedAmount).toBe('10');
    });

    it('should accumulate multiple additions', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(5);
        result.current.addCandy(3);
        result.current.addCandy(7);
      });

      expect(result.current.localRareCandy).toBe('115');
      expect(result.current.unsyncedAmount).toBe('15');
    });
  });

  describe('deductCandy', () => {
    it('should deduct candy locally', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.deductCandy(20);
      });

      expect(result.current.localRareCandy).toBe('80');
    });

    it('should not affect unsynced amount', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(10);
        result.current.deductCandy(5);
      });

      expect(result.current.localRareCandy).toBe('105');
      expect(result.current.unsyncedAmount).toBe('10'); // Only additions tracked
    });
  });

  describe('batching - no amount threshold', () => {
    it('should not flush immediately regardless of amount', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(1000); // Large amount
      });

      // Should not flush immediately - only time-based flushing now
      expect(mockUpdateRareCandy).not.toHaveBeenCalled();
      expect(result.current.unsyncedAmount).toBe('1000');
    });

    it('should accumulate large amounts without immediate flush', () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(100);
        result.current.addCandy(500);
        result.current.addCandy(1000);
      });

      expect(mockUpdateRareCandy).not.toHaveBeenCalled();
      expect(result.current.unsyncedAmount).toBe('1600');
    });
  });

  describe('batching - time threshold', () => {
    it('should flush after time threshold', async () => {
      mockUpdateRareCandy.mockResolvedValue(undefined);
      const {result} = renderHook(() => useCandySync(mockProps));

      await act(async () => {
        result.current.addCandy(10);
      });

      expect(mockUpdateRareCandy).not.toHaveBeenCalled();

      // Advance time to trigger flush (10000ms by default)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });

      // Flush should have been called after timer expires
      expect(mockUpdateRareCandy).toHaveBeenCalledWith(
        '10',
        mockProps.updateUser
      );
    });

    it('should cancel timer on manual flush', async () => {
      mockUpdateRareCandy.mockResolvedValue(undefined);
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(10);
      });

      // Manual flush before timer
      await act(async () => {
        await result.current.flushPendingCandy();
      });

      expect(mockUpdateRareCandy).toHaveBeenCalledTimes(1);

      // Timer should not trigger another flush
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockUpdateRareCandy).toHaveBeenCalledTimes(1);
    });
  });

  describe('flushPendingCandy', () => {
    it('should do nothing when no unsynced candy', async () => {
      const {result} = renderHook(() => useCandySync(mockProps));

      await act(async () => {
        await result.current.flushPendingCandy();
      });

      expect(mockUpdateRareCandy).not.toHaveBeenCalled();
    });

    it('should do nothing when not authenticated', async () => {
      const props = {...mockProps, isAuthenticated: false};
      const {result} = renderHook(() => useCandySync(props));

      act(() => {
        result.current.addCandy(10);
      });

      await act(async () => {
        await result.current.flushPendingCandy();
      });

      expect(mockUpdateRareCandy).not.toHaveBeenCalled();
    });

    it('should handle sync errors and retry', async () => {
      const error = new Error('Network error');
      mockUpdateRareCandy.mockRejectedValue(error);

      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(10);
      });

      await act(async () => {
        await result.current.flushPendingCandy();
      });

      // Should show error
      expect(result.current.displayError).toBe(
        'Failed to save progress. Will retry...'
      );
      // Should restore unsynced amount for retry
      expect(result.current.unsyncedAmount).toBe('10');

      // Error should clear after timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.displayError).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid adds followed by flush', async () => {
      mockUpdateRareCandy.mockResolvedValue(undefined);
      const {result} = renderHook(() => useCandySync(mockProps));

      act(() => {
        result.current.addCandy(1);
        result.current.addCandy(2);
        result.current.addCandy(3);
      });

      await act(async () => {
        await result.current.flushPendingCandy();
      });

      expect(mockUpdateRareCandy).toHaveBeenCalledWith(
        '6',
        mockProps.updateUser
      );
      expect(result.current.localRareCandy).toBe('106');
      expect(result.current.unsyncedAmount).toBe('0');
    });
  });
});
