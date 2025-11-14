import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {usePokemonPurchaseHandler} from '../usePokemonPurchaseHandler';
import type {User} from '@/lib/graphql/types';

// Mock dependencies
const mockPurchasePokemon = vi.fn();
const mockUpdateUser = vi.fn();
const mockFlushPendingCandy = vi.fn();
let mockUser: User = {
  _id: '1',
  username: 'testuser',
  rare_candy: 1000,
  created_at: new Date().toISOString(),
  stats: {
    clickPower: 1,
    autoclicker: 1,
    clickMultiplier: 1,
    pokedexBonus: 1,
    luckyHitChance: 1,
    luckyHitMultiplier: 1,
  },
  owned_pokemon_ids: [],
  favorite_pokemon_id: null,
  selected_pokemon_id: null,
};

vi.mock('../usePurchasePokemon', () => ({
  usePurchasePokemon: () => [mockPurchasePokemon],
}));

vi.mock('@features/auth', () => ({
  useAuth: () => ({
    user: mockUser,
    updateUser: mockUpdateUser,
  }),
}));

vi.mock('@/contexts/CandyOperationsContext', () => ({
  useCandyOperations: () => ({
    localRareCandy: String(mockUser.rare_candy),
    flushPendingCandy: mockFlushPendingCandy,
    addCandy: vi.fn(),
    registerOperations: vi.fn(),
  }),
}));

vi.mock('@/lib/decimal', () => ({
  toDecimal: (value: any) => ({
    lt: (other: any) => {
      const val = typeof value === 'number' ? value : parseFloat(String(value));
      const otherVal =
        typeof other === 'number' ? other : parseFloat(String(other));
      return val < otherVal;
    },
  }),
}));

vi.mock('@/config', () => ({
  GameConfig: {
    purchase: {
      errorDisplayDuration: 1200,
      successAnimationDuration: 800,
    },
  },
  getPokemonCost: (pokemonId: number) => {
    const tier = Math.floor(pokemonId / 10);
    return Math.floor(100 * Math.pow(1.5, tier));
  },
}));

describe('usePokemonPurchaseHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockFlushPendingCandy.mockResolvedValue(undefined);
    mockUser = {
      _id: '1',
      username: 'testuser',
      rare_candy: 1000,
      created_at: new Date().toISOString(),
      stats: {
        clickPower: 1,
        autoclicker: 1,
        clickMultiplier: 1,
        pokedexBonus: 1,
        luckyHitChance: 1,
        luckyHitMultiplier: 1,
      },
      owned_pokemon_ids: [],
      favorite_pokemon_id: null,
      selected_pokemon_id: null,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with no error and not animating', () => {
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    expect(result.current.error).toBeNull();
    expect(result.current.isAnimating).toBe(false);
    expect(typeof result.current.handlePurchase).toBe('function');
  });

  it('should show error when user has insufficient candy', async () => {
    mockUser.rare_candy = 50;
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.error).toBe('Not enough Rare Candy!');
    expect(mockPurchasePokemon).not.toHaveBeenCalled();
  });

  it('should not call mutation when user cannot afford Pokemon', async () => {
    mockUser.rare_candy = 10;
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(1);
    });
    expect(mockPurchasePokemon).not.toHaveBeenCalled();
  });

  it('should proceed when user has exact amount of candy', async () => {
    mockUser.rare_candy = 100;
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(1);
    });
    expect(mockPurchasePokemon).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('should proceed when user has more than enough candy', async () => {
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(1);
    });
    expect(mockPurchasePokemon).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('should clear error after errorDisplayDuration', async () => {
    mockUser.rare_candy = 50;
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.error).toBe('Not enough Rare Candy!');
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.error).toBeNull();
  });

  it('should clear previous error timeout on new purchase', async () => {
    mockUser.rare_candy = 50;
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.error).toBe('Not enough Rare Candy!');
    act(() => {
      vi.advanceTimersByTime(600);
    });
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.error).toBe('Not enough Rare Candy!');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.error).toBe('Not enough Rare Candy!');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.error).toBeNull();
  });

  it('should call purchasePokemon mutation with correct variables', async () => {
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(mockPurchasePokemon).toHaveBeenCalledWith({
      variables: {pokemonId: 25},
    });
  });

  it('should update AuthContext with server response', async () => {
    const updatedUser = {
      ...mockUser,
      rare_candy: 832,
      owned_pokemon_ids: [25],
    };
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: updatedUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
  });

  it('should call onSuccess callback with pokemonId', async () => {
    const onSuccess = vi.fn();
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25, onSuccess);
    });
    expect(onSuccess).toHaveBeenCalledWith(25);
  });

  it('should not call onSuccess if mutation fails', async () => {
    const onSuccess = vi.fn();
    mockPurchasePokemon.mockRejectedValue(new Error('Failed'));
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25, onSuccess);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should trigger animation after successful purchase', async () => {
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.isAnimating).toBe(true);
  });

  it('should stop animating after successAnimationDuration', async () => {
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.isAnimating).toBe(true);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.isAnimating).toBe(false);
  });

  it('should set error when mutation fails', async () => {
    mockPurchasePokemon.mockRejectedValue(new Error('Purchase failed'));
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.error).toBe('Purchase failed');
  });

  it('should handle non-Error exceptions', async () => {
    mockPurchasePokemon.mockRejectedValue('String error');
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.error).toBe('Failed to purchase Pokémon');
  });

  it('should not update user on mutation error', async () => {
    mockPurchasePokemon.mockRejectedValue(new Error('Failed'));
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('should not animate on mutation error', async () => {
    mockPurchasePokemon.mockRejectedValue(new Error('Failed'));
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(result.current.isAnimating).toBe(false);
  });

  it('should not update user when mutation returns no data', async () => {
    mockPurchasePokemon.mockResolvedValue({data: null});
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('should not update user when purchasePokemon is null', async () => {
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: null},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('should handle different Pokemon IDs', async () => {
    mockUser.rare_candy = 100000; // Ensure enough candy for both purchases
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(1);
    });
    expect(mockPurchasePokemon).toHaveBeenCalledWith({
      variables: {pokemonId: 1},
    });
    mockPurchasePokemon.mockClear();
    await act(async () => {
      await result.current.handlePurchase(150);
    });
    expect(mockPurchasePokemon).toHaveBeenCalledWith({
      variables: {pokemonId: 150},
    });
  });

  it('should work without onSuccess callback', async () => {
    mockPurchasePokemon.mockResolvedValue({
      data: {purchasePokemon: mockUser},
    });
    const {result} = renderHook(() => usePokemonPurchaseHandler());
    await act(async () => {
      await result.current.handlePurchase(25);
    });
    expect(mockPurchasePokemon).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });
});
