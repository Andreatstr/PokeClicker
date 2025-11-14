import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useProfileHandlers} from '../useProfileHandlers';

// Mock dependencies
const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockSetFavoritePokemon = vi.fn();
const mockSetSelectedPokemon = vi.fn();
let mockDeleting = false;

vi.mock('@features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
    updateUser: mockUpdateUser,
  }),
}));

vi.mock('../useProfileMutations', () => ({
  useDeleteUser: () => [mockDeleteUser, {loading: mockDeleting}],
  useSetFavoritePokemon: () => [mockSetFavoritePokemon],
  useSetSelectedPokemon: () => [mockSetSelectedPokemon],
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    logError: vi.fn(),
    logInfo: vi.fn(),
    logWarning: vi.fn(),
  },
}));

const mockAlert = vi.fn();
global.alert = mockAlert;

describe('useProfileHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleting = false;
  });

  it('should return all handler functions', () => {
    const {result} = renderHook(() => useProfileHandlers());
    expect(typeof result.current.handleLogout).toBe('function');
    expect(typeof result.current.handleDeleteAccount).toBe('function');
    expect(typeof result.current.handleSetFavorite).toBe('function');
    expect(typeof result.current.handleSetSelected).toBe('function');
  });

  it('should return deleting state', () => {
    const {result} = renderHook(() => useProfileHandlers());
    expect(result.current.deleting).toBe(false);
  });

  describe('handleLogout', () => {
    it('should call logout function', async () => {
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should call onNavigate with login', async () => {
      const onNavigate = vi.fn();
      const {result} = renderHook(() => useProfileHandlers(onNavigate));
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(onNavigate).toHaveBeenCalledWith('login');
    });

    it('should work without onNavigate', async () => {
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('handleDeleteAccount', () => {
    it('should call deleteUser mutation', async () => {
      mockDeleteUser.mockResolvedValue({data: {}});
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleDeleteAccount();
      });
      expect(mockDeleteUser).toHaveBeenCalled();
    });

    it('should call logout after delete', async () => {
      mockDeleteUser.mockResolvedValue({data: {}});
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleDeleteAccount();
      });
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to login', async () => {
      mockDeleteUser.mockResolvedValue({data: {}});
      const onNavigate = vi.fn();
      const {result} = renderHook(() => useProfileHandlers(onNavigate));
      await act(async () => {
        await result.current.handleDeleteAccount();
      });
      expect(onNavigate).toHaveBeenCalledWith('login');
    });

    it('should show alert on error', async () => {
      mockDeleteUser.mockRejectedValue(new Error('Delete failed'));
      const {result} = renderHook(() => useProfileHandlers());
      try {
        await act(async () => {
          await result.current.handleDeleteAccount();
        });
      } catch {
        // Expected
      }
      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to delete account. Please try again.'
      );
    });

    it('should throw error on failure', async () => {
      mockDeleteUser.mockRejectedValue(new Error('Delete failed'));
      const {result} = renderHook(() => useProfileHandlers());
      await expect(
        act(async () => {
          await result.current.handleDeleteAccount();
        })
      ).rejects.toThrow();
    });

    it('should not logout on error', async () => {
      mockDeleteUser.mockRejectedValue(new Error('Delete failed'));
      const {result} = renderHook(() => useProfileHandlers());
      try {
        await act(async () => {
          await result.current.handleDeleteAccount();
        });
      } catch {
        // Expected
      }
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('handleSetFavorite', () => {
    it('should call mutation with pokemonId', async () => {
      mockSetFavoritePokemon.mockResolvedValue({
        data: {setFavoritePokemon: {_id: '1'}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetFavorite(25);
      });
      expect(mockSetFavoritePokemon).toHaveBeenCalledWith({
        variables: {pokemonId: 25},
      });
    });

    it('should accept null pokemonId', async () => {
      mockSetFavoritePokemon.mockResolvedValue({
        data: {setFavoritePokemon: {_id: '1'}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetFavorite(null);
      });
      expect(mockSetFavoritePokemon).toHaveBeenCalledWith({
        variables: {pokemonId: null},
      });
    });

    it('should update user on success', async () => {
      const updatedUser = {_id: '1', favorite_pokemon_id: 25};
      mockSetFavoritePokemon.mockResolvedValue({
        data: {setFavoritePokemon: updatedUser},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetFavorite(25);
      });
      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    });

    it('should return true on success', async () => {
      mockSetFavoritePokemon.mockResolvedValue({
        data: {setFavoritePokemon: {_id: '1'}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      let returnValue;
      await act(async () => {
        returnValue = await result.current.handleSetFavorite(25);
      });
      expect(returnValue).toBe(true);
    });

    it('should return false on error', async () => {
      mockSetFavoritePokemon.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useProfileHandlers());
      let returnValue;
      await act(async () => {
        returnValue = await result.current.handleSetFavorite(25);
      });
      expect(returnValue).toBe(false);
    });

    it('should show alert on error', async () => {
      mockSetFavoritePokemon.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetFavorite(25);
      });
      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to set favorite Pokemon. Please try again.'
      );
    });

    it('should not update user on error', async () => {
      mockSetFavoritePokemon.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetFavorite(25);
      });
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  describe('handleSetSelected', () => {
    it('should call mutation with pokemonId', async () => {
      mockSetSelectedPokemon.mockResolvedValue({
        data: {setSelectedPokemon: {_id: '1'}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetSelected(25);
      });
      expect(mockSetSelectedPokemon).toHaveBeenCalledWith({
        variables: {pokemonId: 25},
      });
    });

    it('should accept null pokemonId', async () => {
      mockSetSelectedPokemon.mockResolvedValue({
        data: {setSelectedPokemon: {_id: '1'}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetSelected(null);
      });
      expect(mockSetSelectedPokemon).toHaveBeenCalledWith({
        variables: {pokemonId: null},
      });
    });

    it('should update user on success', async () => {
      const updatedUser = {_id: '1', selected_pokemon_id: 25};
      mockSetSelectedPokemon.mockResolvedValue({
        data: {setSelectedPokemon: updatedUser},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetSelected(25);
      });
      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    });

    it('should return true on success', async () => {
      mockSetSelectedPokemon.mockResolvedValue({
        data: {setSelectedPokemon: {_id: '1'}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      let returnValue;
      await act(async () => {
        returnValue = await result.current.handleSetSelected(25);
      });
      expect(returnValue).toBe(true);
    });

    it('should return false on error', async () => {
      mockSetSelectedPokemon.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useProfileHandlers());
      let returnValue;
      await act(async () => {
        returnValue = await result.current.handleSetSelected(25);
      });
      expect(returnValue).toBe(false);
    });

    it('should show alert on error', async () => {
      mockSetSelectedPokemon.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetSelected(25);
      });
      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to set selected Pokemon. Please try again.'
      );
    });

    it('should not update user on error', async () => {
      mockSetSelectedPokemon.mockRejectedValue(new Error('Network error'));
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await result.current.handleSetSelected(25);
      });
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent setFavorite and setSelected', async () => {
      mockSetFavoritePokemon.mockResolvedValue({
        data: {setFavoritePokemon: {_id: '1', favorite_pokemon_id: 25}},
      });
      mockSetSelectedPokemon.mockResolvedValue({
        data: {setSelectedPokemon: {_id: '1', selected_pokemon_id: 30}},
      });
      const {result} = renderHook(() => useProfileHandlers());
      await act(async () => {
        await Promise.all([
          result.current.handleSetFavorite(25),
          result.current.handleSetSelected(30),
        ]);
      });
      expect(mockSetFavoritePokemon).toHaveBeenCalled();
      expect(mockSetSelectedPokemon).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledTimes(2);
    });
  });
});
