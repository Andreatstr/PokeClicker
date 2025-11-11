import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useClickerActions} from '../useClickerActions';
import type {User} from '@/lib/graphql/types';

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    logError: vi.fn(),
    logInfo: vi.fn(),
    logWarning: vi.fn(),
  },
}));

vi.mock('@/lib/calculateCandyPerClick', () => ({
  calculateCandyPerClick: vi.fn((stats) => {
    // Simulate click power calculation - returns string for Decimal support
    if (stats.clickPower) {
      return String(Math.floor(Math.pow(1.75, stats.clickPower - 1)));
    }
    return '1';
  }),
}));

vi.mock('../utils/statDescriptions', () => ({
  getUpgradeCost: vi.fn((_stat, level) => {
    // Simulate upgrade cost calculation
    return Math.floor(10 * Math.pow(2.5, level - 1));
  }),
}));

describe('useClickerActions', () => {
  // Mock props
  const mockStats = {
    hp: 1,
    attack: 1,
    defense: 1,
    spAttack: 1,
    spDefense: 1,
    speed: 1,
    clickPower: 1,
    passiveIncome: 1,
  };

  const mockProps = {
    stats: mockStats,
    isAuthenticated: true,
    addCandy: vi.fn(),
    deductCandy: vi.fn(),
    flushPendingCandy: vi.fn().mockResolvedValue(undefined),
    localRareCandy: '100',
    setDisplayError: vi.fn(),
    setStats: vi.fn(),
    upgradeStat: vi.fn(),
    updateUser: vi.fn(),
    ownedPokemonCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('handleClick', () => {
    it('should add candy and trigger animation when clicked', () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      act(() => {
        result.current.handleClick();
      });

      expect(mockProps.addCandy).toHaveBeenCalledWith('1'); // clickPower: 1 = 1 candy
      expect(result.current.isAnimating).toBe(true);
      expect(result.current.candies).toHaveLength(1);
    });

    it('should show error when not authenticated', () => {
      const props = {...mockProps, isAuthenticated: false};
      const {result} = renderHook(() => useClickerActions(props));

      act(() => {
        result.current.handleClick();
      });

      expect(mockProps.setDisplayError).toHaveBeenCalledWith(
        'Please log in to play the game'
      );
      expect(mockProps.addCandy).not.toHaveBeenCalled();
    });

    it('should calculate correct candy amount based on stats', () => {
      const props = {
        ...mockProps,
        stats: {...mockStats, clickPower: 5},
      };
      const {result} = renderHook(() => useClickerActions(props));

      act(() => {
        result.current.handleClick();
      });

      // clickPower: 5 = Math.floor(1.75^4) = 9 candies
      expect(mockProps.addCandy).toHaveBeenCalledWith('9');
    });

    it('should remove floating candy after animation', () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      act(() => {
        result.current.handleClick();
      });

      expect(result.current.candies).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(1000); // GameConfig.clicker.candyFloatAnimationDuration
      });

      expect(result.current.candies).toHaveLength(0);
    });

    it('should stop animating after animation duration', () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      act(() => {
        result.current.handleClick();
      });

      expect(result.current.isAnimating).toBe(true);

      act(() => {
        vi.advanceTimersByTime(150); // GameConfig.clicker.clickAnimationDuration
      });

      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('handleUpgrade', () => {
    it('should upgrade stat successfully', async () => {
      const mockUpdatedUser: User = {
        _id: '1',
        username: 'test',
        rare_candy: 90,
        created_at: new Date().toISOString(),
        stats: {...mockStats, clickPower: 2},
        owned_pokemon_ids: [],
        favorite_pokemon_id: null,
        selected_pokemon_id: null,
      };

      mockProps.upgradeStat.mockResolvedValue(mockUpdatedUser);

      const {result} = renderHook(() => useClickerActions(mockProps));

      await act(async () => {
        await result.current.handleUpgrade('clickPower');
      });

      expect(mockProps.flushPendingCandy).toHaveBeenCalled();
      expect(mockProps.deductCandy).toHaveBeenCalledWith('25');
      expect(mockProps.setStats).toHaveBeenCalled();
      expect(mockProps.upgradeStat).toHaveBeenCalledWith(
        'clickPower',
        mockProps.updateUser
      );
    });

    it('should show error when not authenticated', async () => {
      const props = {...mockProps, isAuthenticated: false};
      const {result} = renderHook(() => useClickerActions(props));

      await act(async () => {
        await result.current.handleUpgrade('clickPower');
      });

      expect(mockProps.setDisplayError).toHaveBeenCalledWith(
        'Please log in to upgrade stats'
      );
      expect(mockProps.upgradeStat).not.toHaveBeenCalled();
    });

    it('should not upgrade if insufficient candy', async () => {
      const props = {...mockProps, localRareCandy: '5'}; // Not enough for upgrade
      const {result} = renderHook(() => useClickerActions(props));

      await act(async () => {
        await result.current.handleUpgrade('clickPower');
      });

      expect(mockProps.upgradeStat).not.toHaveBeenCalled();
    });

    it('should calculate correct upgrade cost based on stat level', async () => {
      const props = {
        ...mockProps,
        stats: {...mockStats, clickPower: 3},
        localRareCandy: '200', // Enough to afford upgrade (cost is 162)
      };

      const mockUpdatedUser: User = {
        _id: '1',
        username: 'test',
        rare_candy: 38,
        created_at: new Date().toISOString(),
        stats: {...mockStats, clickPower: 4},
        owned_pokemon_ids: [],
        favorite_pokemon_id: null,
        selected_pokemon_id: null,
      };

      mockProps.upgradeStat.mockResolvedValue(mockUpdatedUser);

      const {result} = renderHook(() => useClickerActions(props));

      await act(async () => {
        await result.current.handleUpgrade('clickPower');
      });

      // Cost for level 3->4 = Math.floor(25 * 1.3416^2) = 44
      expect(mockProps.deductCandy).toHaveBeenCalledWith('44');
    });

    it('should flush pending candy before upgrading', async () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      await act(async () => {
        await result.current.handleUpgrade('clickPower');
      });

      expect(mockProps.flushPendingCandy).toHaveBeenCalledBefore(
        mockProps.upgradeStat as any
      );
    });
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      expect(result.current.isAnimating).toBe(false);
      expect(result.current.candies).toEqual([]);
      expect(typeof result.current.handleClick).toBe('function');
      expect(typeof result.current.handleUpgrade).toBe('function');
    });
  });

  describe('multiple clicks', () => {
    it('should handle multiple rapid clicks', () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      act(() => {
        result.current.handleClick();
        result.current.handleClick();
        result.current.handleClick();
      });

      expect(mockProps.addCandy).toHaveBeenCalledTimes(3);
      expect(result.current.candies).toHaveLength(3);
    });

    it('should clean up old candies correctly', () => {
      const {result} = renderHook(() => useClickerActions(mockProps));

      act(() => {
        result.current.handleClick();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.handleClick();
      });

      expect(result.current.candies).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.candies).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.candies).toHaveLength(0);
    });
  });
});
