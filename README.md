# PokéClicker - Prosjekt 2

IT2810 Webutvikling - Gruppe 26

[Live Demo](http://it2810-26.idi.ntnu.no/project2/) (Krever eduroam VPN utenfor NTNU)

## Prosjektkonsept

PokéClicker er en webapplikasjon som kombinerer et inkrementelt klikkespill med en søkbar Pokémon-database. Målet er å skape en interaktiv og engasjerende brukeropplevelse der spillmekanikk og datavisning fungerer sammen.

### Hvordan spillet fungerer

Brukere tjener "rare candy" ved å klikke på Pokémon i et GameBoy-inspirert grensesnitt. Rare candy kan brukes til å:
- Kjøpe nye Pokémon til sin personlige samling
- Oppgradere stats (HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed)
- Øke inntekt per klikk og passiv inntekt

Spillmekanikken gir en naturlig motivasjon for brukere til å utforske Pokédex og interagere med systemet over tid.

## Oppfyllelse av kurskrav

### Funksjonalitet

| Krav | Implementasjon |
|------|----------------|
| **Søkemulighet** | Søkefelt med debouncing (300ms) for case-insensitive søk på Pokémon-navn |
| **Listebasert presentasjon** | Grid-visning med "Load More" paginering (20 Pokémon per side) |
| **Detaljvisning** | Modal med utvidet informasjon om stats, evolusjoner, habitat, abilities |
| **Sortering og filtrering** | Filtrering på region (Kanto/Johto/Hoenn) og type, sortering på ID/navn/type |
| **Brukergenererte data** | Brukerkontoer med personlige Pokémon-samlinger og upgrade-progresjon (planlagt) |
| **Universell utforming** | ARIA-labels, tastaturnavigasjon, semantisk HTML, høy kontrast |
| **Bærekraftig webutvikling** | Debounced søk, lazy loading, optimalisert rendering, effektiv dataoverføring |

### Teknologi

- **Frontend**: React 19 + TypeScript + Vite
- **State management**: React hooks (planlagt: Redux/Apollo for brukersesjon)
- **Styling**: Tailwind CSS + Radix UI komponenter
- **Backend**: GraphQL API (Node.js + TypeScript) *(planlagt for del 2)*
- **Database**: MongoDB på VM
- **Testing**: Vitest for komponenter, Playwright for E2E *(planlagt for del 3)*

## Status: Første underveisinnlevering

Denne innleveringen viser konseptet med mock data og statisk kodet eksempeldata. Vi demonstrerer:

**Implementert nå:**
- Pokédex med søk, filtrering og sortering (mock data i `src/data/mockData.ts`)
- Klikkespill med upgrade-system (localStorage for lokal lagring)
- Responsiv design med GameBoy-estetikk
- Paginering og debounced søk
- Modal med detaljert Pokémon-informasjon

**Planlagt for neste innlevering:**
- GraphQL backend på VM (port 3001)
- Database for brukere og brukerdata
- Autentisering/innlogging
- Pokémon API-integrasjon (PokéAPI) for dynamiske data

## Datamodell (planlagt)

### User (MongoDB document)
```typescript
interface User {
  _id: ObjectId
  username: string
  password_hash: string
  created_at: Date

  rare_candy: number
  stats: {
    hp: number
    attack: number
    defense: number
    sp_attack: number
    sp_defense: number
    speed: number
  }
  owned_pokemon_ids: number[]  // Array av PokéAPI IDs
}
```

**Hvorfor MongoDB framfor PostgreSQL?**

Vi valgte MongoDB fordi vår datamodell ikke krever relasjonelle joins. All brukerdata lagres i ett enkelt dokument per bruker, med nested objects (stats) og arrays (owned_pokemon_ids). Dette gjør MongoDB til et bedre valg:

- **Ingen joins nødvendig**: Vi trenger aldri å slå sammen data fra flere tabeller
- **Naturlig datastruktur**: Stats lagres som nested object, ikke som separate rader
- **Array-operasjoner**: Legge til/sjekke Pokémon-eierskap er enklere med arrays
- **Fleksibilitet**: Lettere å legge til nye felt senere uten migrasjoner

### Pokémon-data (fra API)
Pokémon-informasjon (navn, typer, stats, sprites) hentes fra [PokéAPI](https://pokeapi.co/) i stedet for å lagres i egen database. Dette reduserer duplisering og holder data oppdatert.

## Kjøre prosjektet lokalt

### Installasjon
```bash
git clone https://git.ntnu.no/IT2810-H25/T26-Project-2.git
cd T26-Project-2
pnpm install  # eller npm install
```

### Utviklingsmiljø
```bash
pnpm run dev     # Start dev server
pnpm run build   # Bygg for produksjon
pnpm run lint    # Kjør linting
```

## Fremtidig utvikling

### Del 2 - Backend og database
- Sette opp GraphQL backend på VM
- Implementere MongoDB database for brukerdata
- Integrere med PokéAPI
- Autentisering med JWT

### Del 3 - Fullstendig prototype
- Brukerregistrering og innlogging
- Pokémon-kjøp med rare candy
- Persistent upgrade-system per bruker
- Leaderboard/statistikk
- Tilgjengelighetstesting

### Del 4 - Testing og kvalitetssikring
- Vitest for komponenter og utilities
- Playwright E2E-tester
- Performance-optimalisering
- Kodekvalitet og dokumentasjon
