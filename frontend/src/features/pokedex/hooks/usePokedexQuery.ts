import {useQuery, gql} from '@apollo/client';
import {POKEMON_STATS_FRAGMENT} from '@/lib/graphql/fragments';

const POKEDEX_QUERY = gql`
  ${POKEMON_STATS_FRAGMENT}
  query Pokedex(
    $search: String
    $generation: String
    $type: String
    $sortBy: String
    $sortOrder: String
    $limit: Int
    $offset: Int
    $userId: String
    $ownedOnly: Boolean
  ) {
    pokedex(
      search: $search
      generation: $generation
      type: $type
      sortBy: $sortBy
      sortOrder: $sortOrder
      limit: $limit
      offset: $offset
      userId: $userId
      ownedOnly: $ownedOnly
    ) {
      pokemon {
        id
        name
        types
        sprite
        pokedexNumber
        stats {
          ...PokemonStatsFields
        }
        height
        weight
        abilities
        evolution
        isOwned
      }
      total
    }
  }
`;

export interface PokedexPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  pokedexNumber: number;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  } | null;
  height?: number | null;
  weight?: number | null;
  abilities?: string[] | null;
  evolution?: number[] | null;
  isOwned?: boolean;
}

interface PokedexData {
  pokedex: {
    pokemon: PokedexPokemon[];
    total: number;
  };
}

interface PokedexVariables {
  search?: string;
  generation?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
  userId?: string;
  ownedOnly?: boolean;
}

export function usePokedexQuery(variables: PokedexVariables) {
  const {data, loading, error, refetch} = useQuery<
    PokedexData,
    PokedexVariables
  >(POKEDEX_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {data, loading, error, refetch};
}
