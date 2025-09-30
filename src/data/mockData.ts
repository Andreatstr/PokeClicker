export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  pokedexNumber: string;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  abilities?: string[];
  moves?: string[];
  evolution?: {
    name: string;
    sprite: string;
  }[];
}

export const mockPokemonData: Pokemon[] = [
  {
    id: 1,
    name: "Bulbasaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    pokedexNumber: "001"
  },
  {
    id: 2,
    name: "Ivysaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
    pokedexNumber: "002"
  },
  {
    id: 3,
    name: "Venusaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
    pokedexNumber: "003"
  },
  {
    id: 4,
    name: "Charmander",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
    pokedexNumber: "004"
  },
  {
    id: 5,
    name: "Charmeleon",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
    pokedexNumber: "005"
  },
  {
    id: 6,
    name: "Charizard",
    types: ["fire", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    pokedexNumber: "006"
  },
  {
    id: 7,
    name: "Squirtle",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
    pokedexNumber: "007"
  },
  {
    id: 8,
    name: "Wartortle",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
    pokedexNumber: "008"
  },
  {
    id: 9,
    name: "Blastoise",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
    pokedexNumber: "009"
  },
  {
    id: 10,
    name: "Caterpie",
    types: ["bug"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
    pokedexNumber: "010"
  },
  {
    id: 11,
    name: "Metapod",
    types: ["bug"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png",
    pokedexNumber: "011"
  },
  {
    id: 12,
    name: "Butterfree",
    types: ["bug", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
    pokedexNumber: "012"
  },
  {
    id: 13,
    name: "Weedle",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png",
    pokedexNumber: "013"
  },
  {
    id: 14,
    name: "Kakuna",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png",
    pokedexNumber: "014"
  },
  {
    id: 15,
    name: "Beedrill",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
    pokedexNumber: "015"
  },
  {
    id: 16,
    name: "Pidgey",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
    pokedexNumber: "016"
  },
  {
    id: 17,
    name: "Pidgeotto",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
    pokedexNumber: "017"
  },
  {
    id: 18,
    name: "Pidgeot",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png",
    pokedexNumber: "018"
  },
  {
    id: 19,
    name: "Rattata",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
    pokedexNumber: "019",
    stats: {
      hp: 30,
      attack: 56,
      defense: 35,
      spAttack: 25,
      spDefense: 35,
      speed: 72
    },
    abilities: ["Run Away", "Guts", "Hustle"],
    moves: ["Tackle", "Quick Attack", "Bite", "Hyper Fang"],
    evolution: [
      {
        name: "Raticate",
        sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png"
      }
    ]
  },
  {
    id: 20,
    name: "Raticate",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png",
    pokedexNumber: "020"
  },
  {
    id: 21,
    name: "Spearow",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png",
    pokedexNumber: "021"
  },
  {
    id: 22,
    name: "Fearow",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png",
    pokedexNumber: "022"
  },
  {
    id: 23,
    name: "Ekans",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png",
    pokedexNumber: "023"
  },
  {
    id: 24,
    name: "Arbok",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png",
    pokedexNumber: "024"
  },
  {
    id: 25,
    name: "Pikachu",
    types: ["electric"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    pokedexNumber: "025"
  },
  {
    id: 26,
    name: "Raichu",
    types: ["electric"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
    pokedexNumber: "026"
  },
  {
    id: 27,
    name: "Sandshrew",
    types: ["ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
    pokedexNumber: "027"
  },
  {
    id: 28,
    name: "Sandslash",
    types: ["ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png",
    pokedexNumber: "028"
  },
  {
    id: 29,
    name: "Nidoran♀",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png",
    pokedexNumber: "029"
  },
  {
    id: 30,
    name: "Nidorina",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
    pokedexNumber: "030"
  }
];