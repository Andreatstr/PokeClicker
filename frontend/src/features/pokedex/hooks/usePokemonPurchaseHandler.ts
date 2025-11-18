import {useState, useRef} from 'react';
import {GameConfig, getPokemonCost} from '@/config';
import {usePurchasePokemon} from './usePurchasePokemon';
import {useAuth} from '@features/auth';
import {toDecimal} from '@/lib/decimal';
import {useError} from '@/hooks/useError';
import {useCandyContext} from '@/contexts/useCandyContext';

/**
 * Custom hook to handle Pokemon purchase logic with error handling and animations
 *
 * Now uses global candy context to:
 * - Check candy balance (including unsynced passive income)
 * - Flush pending candy to backend before purchase
 * - Ensure backend has accurate amount for validation
 */
export function usePokemonPurchaseHandler() {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser} = useAuth();
  const {addSuccess} = useError();
  const {localRareCandy, flushPendingCandy} = useCandyContext();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const errorTimeoutRef = useRef<number | null>(null);

  const handlePurchase = async (
    pokemonId: number,
    onSuccess?: (pokemonId: number) => void,
    actualPrice?: string,
    pokemonName?: string
  ) => {
    // Clear any existing error timeout to prevent race conditions
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    // Client-side validation: Check if user can afford the Pokemon
    // Use global candy context (includes unsynced passive income)
    // Use actual price from API if available, otherwise fallback to estimation
    const cost = actualPrice ?? getPokemonCost(pokemonId).toString();
    if (toDecimal(localRareCandy).lt(toDecimal(cost))) {
      setError('Not enough Rare Candy!');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, GameConfig.purchase.errorDisplayDuration);
      return;
    }

    // CRITICAL: Flush pending candy to backend before purchase
    // This ensures backend has accurate candy count for validation
    try {
      await flushPendingCandy();
    } catch {
      setError('Failed to sync candy. Please try again.');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, GameConfig.purchase.errorDisplayDuration);
      return;
    }

    try {
      const result = await purchasePokemon({
        variables: {pokemonId, price: actualPrice},
      });

      // Update AuthContext with the server response
      // Apollo optimistic response already updated the UI immediately
      if (result.data?.purchasePokemon) {
        updateUser(result.data.purchasePokemon);

        // Show success notification
        const displayName = pokemonName
          ? pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)
          : `Pokemon #${pokemonId}`;
        addSuccess(`Successfully bought ${displayName}!`);
      }

      onSuccess?.(pokemonId);

      // Trigger animation after successful purchase
      setIsAnimating(true);
      setTimeout(
        () => setIsAnimating(false),
        GameConfig.purchase.successAnimationDuration
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to purchase Pokémon';
      setError(errorMessage);
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, GameConfig.purchase.errorDisplayDuration);
    }
  };

  return {
    handlePurchase,
    error,
    isAnimating,
  };
}
