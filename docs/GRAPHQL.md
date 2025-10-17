# GraphQL API Dokumentasjon

## Endepunkt

- **Utvikling**: `http://localhost:3001/`
- **Produksjon**: `http://it2810-26.idi.ntnu.no/project2/graphql`

## Schema-oversikt

### Queries

```graphql
# Helsesjekk
health: HealthCheck!

# Hent innlogget bruker (krever autentisering)
me: User!

# Hent Pokémon-liste med filtrering
pokemon(type: String, generation: String, limit: Int, offset: Int): PokemonResponse!

# Hent enkelt Pokémon med ID
pokemonById(id: Int!): Pokemon

# Avansert Pokédex-spørring med søk, filter, sortering
pokedex(
  search: String
  generation: String
  type: String
  sortBy: String
  sortOrder: String
  limit: Int
  offset: Int
  userId: String
): PokedexResponse!
```

### Mutations

```graphql
# Brukerautentisering
signup(username: String!, password: String!): AuthResponse!
login(username: String!, password: String!): AuthResponse!

# Spillhandlinger (krever autentisering)
updateRareCandy(amount: Int!): User!
upgradeStat(stat: String!): User!
purchasePokemon(pokemonId: Int!): User!
```

### Typer

```graphql
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
}

type PokedexPokemon {
  # Samme som Pokemon, men med:
  isOwned: Boolean!  # Om brukeren eier denne Pokémon
  pokedexNumber: Int!
}
```

## Brukseksempler

### Autentisering

```graphql
mutation {
  signup(username: "ash", password: "pikachu123") {
    token
    user {
      _id
      username
    }
  }
}
```

Bruk token i headers: `Authorization: Bearer <token>`

### Hent Pokédex

```graphql
query {
  pokedex(
    search: "char"
    generation: "kanto"
    type: "fire"
    sortBy: "name"
    limit: 20
    offset: 0
  ) {
    pokemon {
      id
      name
      types
      sprite
      isOwned
    }
    total
  }
}
```

### Kjøp Pokémon

```graphql
mutation {
  purchasePokemon(pokemonId: 25) {
    rare_candy
    owned_pokemon_ids
  }
}
```

## Testing

```bash
# Helsesjekk
curl http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status } }"}'
```

For interaktiv testing, bruk GraphQL Playground på `http://localhost:3001/` i utvikling.
