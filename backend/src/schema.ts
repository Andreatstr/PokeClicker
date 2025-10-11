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

	type User {
    _id: ID!
    username: String!
    rare_candy: Int!
    created_at: String!
    stats: UserStats!
    owned_pokemon_ids: [Int!]!
  }

	type UserStats {
    hp: Int!
    attack: Int!
    defense: Int!
    spAttack: Int!
    spDefense: Int!
    speed: Int!
  }

	type AuthResponse {
    token: String!
    user: User!
  }

	type Mutation {
    signup(username: String!, password: String!): AuthResponse!
    login(username: String!, password: String!): AuthResponse!
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
