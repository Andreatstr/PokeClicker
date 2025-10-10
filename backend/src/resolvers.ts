import {fetchPokemon, fetchPokemonById} from './pokeapi.js';

export const resolvers = {
  Query: {
    health: () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),
    hello: () => 'Hello from PokéClicker GraphQL API!',
    pokemon: async (
      _: unknown,
      args: {
        type?: string;
        generation?: string;
        limit?: number;
        offset?: number;
      }
    ) => {
      return fetchPokemon(args);
    },
    pokemonById: async (_: unknown, args: {id: number}) => {
      return fetchPokemonById(args.id);
    },
  },
};
