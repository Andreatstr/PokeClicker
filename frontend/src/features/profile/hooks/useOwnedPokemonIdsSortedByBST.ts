/**
 * Hook to fetch owned Pokemon IDs sorted by BST (Base Stat Total)
 *
 * Efficiently fetches only the IDs of the user's owned Pokemon, sorted by strength (BST descending).
 * Used for paginated selectors and performance optimization when displaying large collections.
 *
 * @param userId - The user ID whose Pokemon should be fetched
 * @returns Apollo query result with sorted array of Pokemon IDs
 *
 * @example
 * const { data, loading } = useOwnedPokemonIdsSortedByBST(userId);
 * const sortedIds = data?.ownedPokemonIdsSortedByBST || [];
 */
import {useQuery, gql} from '@apollo/client';

/**
 * GraphQL query to fetch owned Pokemon IDs sorted by BST for a user
 */
const OWNED_POKEMON_IDS_SORTED_BY_BST = gql`
  query OwnedPokemonIdsSortedByBST($userId: String!) {
    ownedPokemonIdsSortedByBST(userId: $userId)
  }
`;

/**
 * React hook to fetch sorted owned Pokemon IDs for a user
 *
 * @param userId - The user ID to fetch Pokemon for
 * @returns Apollo useQuery result
 */
export function useOwnedPokemonIdsSortedByBST(userId: string) {
  return useQuery(OWNED_POKEMON_IDS_SORTED_BY_BST, {
    variables: {userId},
    skip: !userId,
  });
}
