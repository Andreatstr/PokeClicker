import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {CandyProvider, useCandyContext} from '../CandyContext';
import type {User} from '@features/auth';
import type React from 'react';

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    logError: vi.fn(),
    logInfo: vi.fn(),
    logWarning: vi.fn(),
  },
}));

const mockUpdateRareCandy = vi.fn();
const mockUpgradeStat = vi.fn();

vi.mock('@features/clicker/hooks/useGameMutations', () => ({
  useGameMutations: () => ({
    updateRareCandy: mockUpdateRareCandy,
    upgradeStat: mockUpgradeStat,
    loading: false,
    error: null,
  }),
}));

const mockUser: User = {
  _id: '1',
  username: 'test',
  rare_candy: '100',
  created_at: new Date().toISOString(),
  stats: {
    hp: 1,
    attack: 1,
    defense: 1,
    spAttack: 1,
    spDefense: 1,
    speed: 1,
    clickPower: 1,
    autoclicker: 2, // Level 2 for autoclicker testing
    luckyHitChance: 1,
    luckyHitMultiplier: 1,
    clickMultiplier: 1,
    pokedexBonus: 1,
  },
  owned_pokemon_ids: [],
  favorite_pokemon_id: null,
  selected_pokemon_id: null,
  showInRanks: true,
  isGuestUser: false,
};

const mockUpdateUser = vi.fn();
const mockAuth = {
  user: mockUser,
  token: 'test-token',
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: mockUpdateUser,
};

vi.mock('@features/auth', () => ({
  useAuth: () => mockAuth,
}));

describe('CandyContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockAuth.user = mockUser;
    mockAuth.isAuthenticated = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const wrapper = ({children}: {children: React.ReactNode}) => (
    <CandyProvider>{children}</CandyProvider>
  );

  describe('initialization', () => {
    it('should provide candy context values', () => {
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      expect(result.current.localRareCandy).toBe('100');
      expect(typeof result.current.addCandy).toBe('function');
      expect(typeof result.current.deductCandy).toBe('function');
      expect(typeof result.current.flushPendingCandy).toBe('function');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useCandyContext());
      }).toThrow('useCandyContext must be used within CandyProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('global autoclicker', () => {
    it('should run autoclicker when authenticated', async () => {
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      const initialCandy = result.current.localRareCandy;

      // Advance time to allow autoclicker to generate candy
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000); // 1 second
      });

      // Candy should have increased from autoclicker
      // With autoclicker level 2, it should generate some candy
      const finalCandy = parseFloat(result.current.localRareCandy);
      const initial = parseFloat(initialCandy);

      expect(finalCandy).toBeGreaterThan(initial);
    });

    it('should not run autoclicker during onboarding', async () => {
      const onboardingWrapper = ({children}: {children: React.ReactNode}) => (
        <CandyProvider isOnboarding={true}>{children}</CandyProvider>
      );

      const {result} = renderHook(() => useCandyContext(), {
        wrapper: onboardingWrapper,
      });

      const initialCandy = result.current.localRareCandy;

      // Advance time - autoclicker should NOT generate candy during onboarding
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(result.current.localRareCandy).toBe(initialCandy);
    });

    it('should not run autoclicker when not authenticated', () => {
      mockAuth.isAuthenticated = false;

      const {result} = renderHook(() => useCandyContext(), {wrapper});

      const initialCandy = result.current.localRareCandy;

      // Advance time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Candy should not increase when not authenticated
      expect(result.current.localRareCandy).toBe(initialCandy);
    });
  });

  describe('candy operations', () => {
    it('should add candy and track unsynced amount', () => {
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      act(() => {
        result.current.addCandy('50');
      });

      expect(result.current.localRareCandy).toBe('150');
    });

    it('should deduct candy for purchases', () => {
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      act(() => {
        result.current.deductCandy('30');
      });

      expect(result.current.localRareCandy).toBe('70');
    });

    it('should flush pending candy to backend', async () => {
      mockUpdateRareCandy.mockResolvedValue(undefined);
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      act(() => {
        result.current.addCandy('25');
      });

      await act(async () => {
        await result.current.flushPendingCandy();
      });

      // Should have called backend mutation
      expect(mockUpdateRareCandy).toHaveBeenCalledWith('25', mockUpdateUser);
    });
  });

  describe('error handling', () => {
    it('should expose display error from sync', () => {
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      expect(result.current.displayError).toBeNull();
      expect(typeof result.current.setDisplayError).toBe('function');
    });

    it('should handle sync errors gracefully', async () => {
      mockUpdateRareCandy.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      act(() => {
        result.current.addCandy('10');
      });

      await act(async () => {
        await result.current.flushPendingCandy();
      });

      // Should show error message
      expect(result.current.displayError).toBe(
        'Failed to save progress. Will retry...'
      );
    });
  });

  describe('integration with auth context', () => {
    it('should sync with user candy changes', () => {
      const {result, rerender} = renderHook(() => useCandyContext(), {wrapper});

      expect(result.current.localRareCandy).toBe('100');

      // Update user candy
      mockAuth.user = {...mockUser, rare_candy: '200'};

      rerender();

      // Should reflect new candy amount
      expect(result.current.localRareCandy).toBe('200');
    });

    it('should handle user logout', () => {
      const {result} = renderHook(() => useCandyContext(), {wrapper});

      expect(result.current.localRareCandy).toBe('100');

      // User logs out
      mockAuth.user = null;
      mockAuth.isAuthenticated = false;

      // Should still provide context (but autoclicker won't run)
      expect(result.current.localRareCandy).toBeDefined();
    });
  });
});
