import {useQuery, gql} from '@apollo/client';

const POKEDEX_QUERY = gql`
  query Pokedex(
    $search: String
    $generation: String
    $type: String
    $sortBy: String
    $sortOrder: String
    $limit: Int
    $offset: Int
    $userId: String
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
    ) {
      pokemon {
        id
        name
        types
        sprite
        pokedexNumber
        stats {
          hp
          attack
          defense
          spAttack
          spDefense
          speed
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
  isOwned: boolean;
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
}

export function usePokedexQuery(variables: PokedexVariables) {
  const {data, loading, error, refetch} = useQuery<PokedexData, PokedexVariables>(POKEDEX_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {data, loading, error, refetch};
}
