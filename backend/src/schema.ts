/**
 * GraphQL Schema Definition
 * Complete type system for Pokemon clicker game API
 */

export const typeDefs = `#graphql
  type Query {
    health: HealthCheck!
    hello: String!
    me: User!
    pokemon(
      type: String
      generation: String
      limit: Int
      offset: Int
    ): PokemonResponse!
    pokemonById(id: Int!): Pokemon
    pokemonByIds(ids: [Int!]!): [Pokemon!]!
    pokedex(
      search: String
      generation: String
      types: [String!]
      sortBy: String
      sortOrder: String
      limit: Int
      offset: Int
      userId: String
      ownedOnly: Boolean
    ): PokedexResponse!
    pokemonUpgrade(pokemonId: Int!): PokemonUpgrade
    getRanks(input: RanksInput): RanksResponse!
    pokemonByBSTRange(minBST: Int!, maxBST: Int!, limit: Int): [PokedexPokemon!]!
    ownedPokemonIdsSortedByBST(userId: String!): [Int!]!
  }

  type HealthCheck {
    status: String!
    timestamp: String!
  }

	type User {
    _id: ID!
    username: String!
    rare_candy: String!
    created_at: String!
    stats: UserStats!
    owned_pokemon_ids: [Int!]!
    favorite_pokemon_id: Int
    selected_pokemon_id: Int
    showInRanks: Boolean
    isGuestUser: Boolean
  }

	type UserStats {
    hp: Int!
    attack: Int!
    defense: Int!
    spAttack: Int!
    spDefense: Int!
    speed: Int!
    # PokeClicker upgrades:
    clickPower: Int
    autoclicker: Int
    luckyHitChance: Int
    luckyHitMultiplier: Int
    clickMultiplier: Int
    pokedexBonus: Int
  }

	type AuthResponse {
    token: String!
    user: User!
  }

	type Mutation {
    signup(username: String!, password: String!, isGuestUser: Boolean): AuthResponse!
    login(username: String!, password: String!): AuthResponse!
    updateRareCandy(amount: String!): User!
    upgradeStat(stat: String!): User!
    purchasePokemon(pokemonId: Int!): User!
    catchPokemon(pokemonId: Int!): User!
    deleteUser: Boolean!
    setFavoritePokemon(pokemonId: Int): User!
    setSelectedPokemon(pokemonId: Int): User!
    upgradePokemon(pokemonId: Int!): PokemonUpgrade!
    updateRanksPreference(showInRanks: Boolean!): User!
  }

  type PokemonUpgrade {
    pokemon_id: Int!
    level: Int!
    cost: String!
    user: User
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
    evolution: [Int!]!
    isOwned: Boolean!
    pokedexNumber: Int!
    bst: Int
    price: String
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

  type PokedexPokemon {
    id: Int!
    name: String!
    types: [String!]!
    sprite: String!
    pokedexNumber: Int!
    stats: PokemonStats
    height: Int
    weight: Int
    bst: Int
    price: String
    abilities: [String!]
    evolution: [Int!]
    isOwned: Boolean!
  }

  type PokedexResponse {
    pokemon: [PokedexPokemon!]!
    total: Int!
    facets: FilterFacets
  }

  type FilterFacets {
    byGeneration: [GenerationFacet!]!
    byType: [TypeFacet!]!
    isDynamic: Boolean!
    ownedCount: Int!
    totalCount: Int!
  }

  type GenerationFacet {
    generation: String!
    count: Int!
  }

  type TypeFacet {
    type: String!
    count: Int!
  }

  type RanksEntry {
    position: Int!
    username: String!
    score: String!
    userId: ID!
    showInRanks: Boolean!
  }

  type RanksResponse {
    candyLeague: [RanksEntry!]!
    pokemonLeague: [RanksEntry!]!
    totalPlayers: Int!
    userCandyRank: Int
    userPokemonRank: Int
  }

  input RanksInput {
    limit: Int = 50
    offset: Int = 0
  }
`;
