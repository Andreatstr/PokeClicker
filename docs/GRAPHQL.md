# GraphQL API Documentation

## Endpoints

- **Development**: `http://localhost:3001/`
- **Production**: `http://it2810-26.idi.ntnu.no/project2/graphql`

## Schema Overview

### Queries

```graphql
# Health check
health: HealthCheck!

# Get logged-in user (requires authentication)
me: User!

# Get Pokemon list with filtering
pokemon(
  type: String
  generation: String
  limit: Int
  offset: Int
): PokemonResponse!

# Get single Pokemon by ID
pokemonById(id: Int!): Pokemon

# Get multiple Pokemon by IDs
pokemonByIds(ids: [Int!]!): [Pokemon!]!

# Advanced Pokedex query with search, filter, sorting
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

# Get Pokemon upgrade information
pokemonUpgrade(pokemonId: Int!): PokemonUpgrade

# Get leaderboard rankings
getRanks(input: RanksInput): RanksResponse!

# Get Pokemon within BST range
pokemonByBSTRange(minBST: Int!, maxBST: Int!, limit: Int): [PokedexPokemon!]!
```

### Mutations

```graphql
# User authentication
signup(username: String!, password: String!, isGuestUser: Boolean): AuthResponse!
login(username: String!, password: String!): AuthResponse!

# Game actions (require authentication)
updateRareCandy(amount: String!): User!
upgradeStat(stat: String!): User!
purchasePokemon(pokemonId: Int!): User!
catchPokemon(pokemonId: Int!): User!
upgradePokemon(pokemonId: Int!): PokemonUpgrade!

# User preferences
setFavoritePokemon(pokemonId: Int): User!
setSelectedPokemon(pokemonId: Int): User!
updateRanksPreference(showInRanks: Boolean!): User!

# Account management
deleteUser: Boolean!
```

### Types

#### User Types

```graphql
type User {
  _id: ID!
  username: String!
  rare_candy: String!              # Stored as string for arbitrary precision
  created_at: String!
  stats: UserStats!
  owned_pokemon_ids: [Int!]!
  favorite_pokemon_id: Int         # For World/Battle
  selected_pokemon_id: Int         # For Clicker
  showInRanks: Boolean
  isGuestUser: Boolean
}

type UserStats {
  # Battle stats
  hp: Int!
  attack: Int!
  defense: Int!
  spAttack: Int!
  spDefense: Int!
  speed: Int!

  # Clicker upgrades
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
```

#### Pokemon Types

```graphql
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
  bst: Int                          # Base Stat Total
  price: String                     # Stored as string for arbitrary precision
}

type PokemonStats {
  hp: Int!
  attack: Int!
  defense: Int!
  spAttack: Int!
  spDefense: Int!
  speed: Int!
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
  facets: FilterFacets              # For filter counts
}
```

#### Other Types

```graphql
type PokemonUpgrade {
  pokemon_id: Int!
  level: Int!
  cost: String!
  user: User
}

type FilterFacets {
  byGeneration: [GenerationFacet!]!
  byType: [TypeFacet!]!
  isDynamic: Boolean!               # Whether counts are real-time or static
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

type HealthCheck {
  status: String!
  timestamp: String!
}
```

## Usage Examples

### Authentication

#### Sign Up
```graphql
mutation {
  signup(username: "ash", password: "pikachu123") {
    token
    user {
      _id
      username
      rare_candy
      owned_pokemon_ids
    }
  }
}
```

#### Login
```graphql
mutation {
  login(username: "ash", password: "pikachu123") {
    token
    user {
      _id
      username
    }
  }
}
```

**Important**: Use the returned token in headers for authenticated requests:
```
Authorization: Bearer <token>
```

### Querying Data

#### Get Current User
```graphql
query {
  me {
    username
    rare_candy
    owned_pokemon_ids
    stats {
      hp
      attack
      clickPower
      autoclicker
    }
  }
}
```

#### Search Pokedex
```graphql
query {
  pokedex(
    search: "char"
    generation: "kanto"
    types: ["fire"]
    sortBy: "price"
    sortOrder: "asc"
    limit: 20
    offset: 0
  ) {
    pokemon {
      id
      name
      types
      sprite
      isOwned
      price
      bst
    }
    total
    facets {
      byGeneration {
        generation
        count
      }
      byType {
        type
        count
      }
      isDynamic
      ownedCount
      totalCount
    }
  }
}
```

#### Get Pokemon Details
```graphql
query {
  pokemonById(id: 25) {
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
    abilities
    evolution
    height
    weight
    price
  }
}
```

#### Get Leaderboards
```graphql
query {
  getRanks {
    candyLeague {
      position
      username
      score
    }
    pokemonLeague {
      position
      username
      score
    }
    totalPlayers
    userCandyRank
    userPokemonRank
  }
}
```

### Mutations

#### Purchase Pokemon
```graphql
mutation {
  purchasePokemon(pokemonId: 25) {
    rare_candy
    owned_pokemon_ids
  }
}
```

#### Catch Pokemon (from battle)
```graphql
mutation {
  catchPokemon(pokemonId: 25) {
    owned_pokemon_ids
  }
}
```

#### Update Rare Candy
```graphql
mutation {
  updateRareCandy(amount: "1000") {
    rare_candy
  }
}
```

#### Upgrade Stat
```graphql
mutation {
  upgradeStat(stat: "clickPower") {
    stats {
      clickPower
    }
    rare_candy
  }
}
```

Available stats:
- Battle stats: `hp`, `attack`, `defense`, `spAttack`, `spDefense`, `speed`
- Clicker stats: `clickPower`, `autoclicker`, `luckyHitChance`, `luckyHitMultiplier`, `clickMultiplier`, `pokedexBonus`

#### Upgrade Pokemon Level
```graphql
mutation {
  upgradePokemon(pokemonId: 25) {
    pokemon_id
    level
    cost
    user {
      rare_candy
    }
  }
}
```

#### Set Favorite Pokemon
```graphql
mutation {
  setFavoritePokemon(pokemonId: 25) {
    favorite_pokemon_id
  }
}
```

#### Set Selected Pokemon (for clicker)
```graphql
mutation {
  setSelectedPokemon(pokemonId: 25) {
    selected_pokemon_id
  }
}
```

#### Update Ranks Visibility
```graphql
mutation {
  updateRanksPreference(showInRanks: true) {
    showInRanks
  }
}
```

#### Delete Account
```graphql
mutation {
  deleteUser
}
```

## Testing

### Health Check
```bash
curl http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status timestamp } }"}'
```

### Authenticated Request
```bash
curl http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"query":"{ me { username rare_candy } }"}'
```

### Interactive Testing
Use GraphQL Playground at `http://localhost:3001/` in development for interactive testing.

## Important Notes

### Arbitrary Precision Numbers
`rare_candy` and `price` fields are stored as **strings** to support numbers larger than JavaScript's `Number.MAX_SAFE_INTEGER` (2^53). Always pass these as strings in mutations:

```graphql
# Correct
updateRareCandy(amount: "999999999999999999999")

# Incorrect (will lose precision)
updateRareCandy(amount: 999999999999999999999)
```

### Authentication
All mutations except `signup` and `login` require authentication. Include the JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Filter Facets
The `pokedex` query returns `facets` with counts for each filter option. The `isDynamic` field indicates whether counts are computed in real-time (true) or use precomputed values (false) based on query complexity.

### Rate Limiting
The API enforces rate limiting of **1000 requests per 15 minutes** per IP address. Excessive requests will receive a 429 status code.
