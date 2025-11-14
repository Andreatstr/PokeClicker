import {useMutation, type Reference} from '@apollo/client';
import {useAuth} from '@features/auth';
import {
  PURCHASE_POKEMON_MUTATION,
  type PurchasePokemonData,
  type PurchasePokemonVariables,
} from '@/lib/graphql';
import {toDecimal} from '@/lib/decimal';
import {getPokemonCost} from '@/config';

/**
 * Hook for purchasing Pokemon with optimistic UI updates
 *
 * Features:
 * - Mutation to unlock Pokemon using Rare Candy currency
 * - Optimistic response for instant UI feedback (no loading flash)
 * - Automatic cache update to reflect ownership across all Pokedex queries
 * - Rare Candy deduction calculated client-side for immediate display
 *
 * Optimistic update strategy:
 * - Immediately shows Pokemon as purchased before server confirms
 * - Updates user's Rare Candy balance optimistically
 * - Reverts automatically if mutation fails (Apollo built-in)
 * - Cache update ensures isOwned field syncs across all queries
 *
 * @returns Mutation function with optimistic response configuration
 */
export function usePurchasePokemon() {
  const {user} = useAuth();

  return useMutation<PurchasePokemonData, PurchasePokemonVariables>(
    PURCHASE_POKEMON_MUTATION,
    {
      update(cache, {data}) {
        if (!data?.purchasePokemon) return;

        // Get the ID of the purchased Pokemon (last item in owned_pokemon_ids array)
        const purchasedPokemonId =
          data.purchasePokemon.owned_pokemon_ids[
            data.purchasePokemon.owned_pokemon_ids.length - 1
          ];

        // Update all cached pokedex queries to show Pokemon as owned
        // Prevents need for refetch - UI updates instantly from cache
        cache.modify({
          fields: {
            pokedex(existingPokedexRef, {readField}) {
              if (!existingPokedexRef) return existingPokedexRef;

              const pokemonArray = readField<readonly Reference[]>(
                'pokemon',
                existingPokedexRef
              );
              if (!pokemonArray) return existingPokedexRef;

              // Update each Pokemon reference that matches the purchased ID
              pokemonArray.forEach((pokemonRef) => {
                const pokemonId = readField<number>('id', pokemonRef);
                if (pokemonId === purchasedPokemonId) {
                  const pokemonCacheId = cache.identify({
                    __typename: 'Pokemon',
                    id: pokemonId,
                  });
                  if (pokemonCacheId) {
                    cache.modify({
                      id: pokemonCacheId,
                      fields: {
                        isOwned() {
                          return true;
                        },
                      },
                    });
                  }
                }
              });

              return existingPokedexRef;
            },
          },
        });
      },
      // Optimistic response constructs expected server response before mutation completes
      // This provides instant UI feedback while request is in flight
      optimisticResponse: (variables) => {
        // Use actual user data from context for accurate optimistic state
        if (!user) {
          // Fallback to placeholder if no user (shouldn't happen in normal flow)
          return {
            purchasePokemon: {
              __typename: 'User',
              _id: '',
              username: '',
              rare_candy: '0',
              created_at: new Date().toISOString(),
              owned_pokemon_ids: [variables.pokemonId],
              favorite_pokemon_id: null,
              selected_pokemon_id: null,
              showInRanks: true,
              stats: {
                __typename: 'UserStats',
                hp: 1,
                attack: 1,
                defense: 1,
                spAttack: 1,
                spDefense: 1,
                speed: 1,
                clickPower: 1,
                autoclicker: 1,
                luckyHitChance: 1,
                luckyHitMultiplier: 1,
                clickMultiplier: 1,
                pokedexBonus: 1,
              },
            },
          };
        }

        // Calculate optimistic rare_candy after purchase
        const pokemonCost = getPokemonCost(variables.pokemonId);
        const optimisticRareCandy = toDecimal(user.rare_candy)
          .minus(pokemonCost)
          .toString();

        // Return optimistic response with actual user data
        return {
          purchasePokemon: {
            __typename: 'User',
            _id: user._id,
            username: user.username,
            rare_candy: optimisticRareCandy,
            created_at: user.created_at,
            owned_pokemon_ids: [...user.owned_pokemon_ids, variables.pokemonId],
            favorite_pokemon_id: user.favorite_pokemon_id ?? null,
            selected_pokemon_id: user.selected_pokemon_id ?? null,
            showInRanks: user.showInRanks ?? true,
            stats: user.stats
              ? {
                  __typename: 'UserStats',
                  hp: user.stats.hp,
                  attack: user.stats.attack,
                  defense: user.stats.defense,
                  spAttack: user.stats.spAttack,
                  spDefense: user.stats.spDefense,
                  speed: user.stats.speed,
                  clickPower: user.stats.clickPower ?? 1,
                  autoclicker: user.stats.autoclicker ?? 1,
                  luckyHitChance: user.stats.luckyHitChance ?? 1,
                  luckyHitMultiplier: user.stats.luckyHitMultiplier ?? 1,
                  clickMultiplier: user.stats.clickMultiplier ?? 1,
                  pokedexBonus: user.stats.pokedexBonus ?? 1,
                }
              : {
                  __typename: 'UserStats',
                  hp: 1,
                  attack: 1,
                  defense: 1,
                  spAttack: 1,
                  spDefense: 1,
                  speed: 1,
                  clickPower: 1,
                  autoclicker: 1,
                  luckyHitChance: 1,
                  luckyHitMultiplier: 1,
                  clickMultiplier: 1,
                  pokedexBonus: 1,
                },
          },
        };
      },
    }
  );
}
