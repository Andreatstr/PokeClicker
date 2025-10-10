export const typeDefs = `#graphql
  type Query {
    health: HealthCheck!
    hello: String!
    pokemon(
      type: String
      generation: String
      limit: Int
      offset: Int
    ): PokemonResponse!
    pokemonById(id: Int!): Pokemon
  }

  type HealthCheck {
    status: String!
    timestamp: String!
  }

  type Pokemon {
    id: Int!
    name: String!
    types: [String!]!
    sprite: String!
    stats: PokemonStats!
    height: Int!
    weight: Int!
    abilities: [String!]!
  }

  type PokemonStats {
    hp: Int!
    attack: Int!
    defense: Int!
    spAttack: Int!
    spDefense: Int!
    speed: Int!
  }

  type PokemonResponse {
    pokemon: [Pokemon!]!
    total: Int!
  }
`;
