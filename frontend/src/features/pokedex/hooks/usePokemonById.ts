import {useQuery, gql} from '@apollo/client';

const POKEMON_BY_ID_QUERY = gql`
  query PokemonById($id: Int!) {
    pokemonById(id: $id) {
      id
      name
      types
      sprite
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
      pokedexNumber
    }
  }
`;

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface PokemonById {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokemonStats;
  height: number;
  weight: number;
  abilities: string[];
  evolution: number[];
  isOwned: boolean;
  pokedexNumber: number;
}

export function usePokemonById(id: number | null) {
  return useQuery<{pokemonById: PokemonById | null}>(POKEMON_BY_ID_QUERY, {
    variables: {id},
    skip: id === null,
  });
}
