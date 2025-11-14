import {useState, useRef} from 'react';
import {GameConfig, getPokemonCost} from '@/config';
import {usePurchasePokemon} from './usePurchasePokemon';
import {useAuth} from '@features/auth';
import {toDecimal} from '@/lib/decimal';
import {useCandyOperations} from '@/contexts/CandyOperationsContext';
import {useError} from '@/hooks/useError';

/**
 * Custom hook to handle Pokemon purchase logic with error handling and animations
 */
export function usePokemonPurchaseHandler() {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const {getLocalRareCandy, flushPendingCandy} = useCandyOperations();
  const {addSuccess} = useError();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const errorTimeoutRef = useRef<number | null>(null);

  const handlePurchase = async (
    pokemonId: number,
    pokemonName?: string,
    onSuccess?: (pokemonId: number) => void
  ) => {
    // Clear any existing error timeout to prevent race conditions
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    // Client-side validation: Check if user can afford the Pokemon
    // Use getLocalRareCandy() if available (most up-to-date), otherwise fall back to user.rare_candy
    const currentCandy = getLocalRareCandy() || user?.rare_candy || '0';
    const cost = getPokemonCost(pokemonId);
    if (toDecimal(currentCandy).lt(cost)) {
      setError('Not enough Rare Candy!');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, GameConfig.purchase.errorDisplayDuration);
      return;
    }

    // Flush any pending candy to server before purchase to ensure server has latest amount
    if (flushPendingCandy) {
      try {
        await flushPendingCandy();
      } catch (err) {
        // If flush fails, still attempt purchase - server will validate
        console.warn('Failed to flush candy before purchase:', err);
      }
    }

    try {
      const result = await purchasePokemon({
        variables: {pokemonId},
      });

      // Check for GraphQL errors first (Apollo's errorPolicy: 'all' returns both data and errors)
      // This handles cases where server rejects the purchase (e.g., not enough candy)
      if (result.errors && result.errors.length > 0) {
        const errorMessage =
          result.errors[0]?.message || 'Failed to purchase Pokémon';
        setError(errorMessage);
        errorTimeoutRef.current = setTimeout(() => {
          setError(null);
          errorTimeoutRef.current = null;
        }, GameConfig.purchase.errorDisplayDuration);
        return; // Don't show success or update UI if there are errors
      }

      // Only proceed if there are no errors and server confirmed the purchase
      if (result.data?.purchasePokemon) {
        updateUser(result.data.purchasePokemon);

        // Show success toast notification only after server confirmation
        if (pokemonName) {
          const capitalizedName =
            pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
          addSuccess(`Successfully bought ${capitalizedName}!`);
        }

        onSuccess?.(pokemonId);

        // Trigger animation after successful purchase
        setIsAnimating(true);
        setTimeout(
          () => setIsAnimating(false),
          GameConfig.purchase.successAnimationDuration
        );
      }
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
