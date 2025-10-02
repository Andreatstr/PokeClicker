export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  pokedexNumber: string;
  height?: string
  weight?: string
  genderRatio?: string
  habitat?: string
  abilities?: string[]
  stats?: { hp: number; attack: number; defense: number; spAttack: number; spDefense: number; speed: number }
  yourStats?: { hp: number; attack: number; defense: number; spAttack: number; spDefense: number; speed: number }
  evolution?: number[];
}

export const mockPokemonData: Pokemon[] = [
  {
    id: 1,
    name: "Bulbasaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    pokedexNumber: "001",
    height: "0.7 m",
    weight: "6.9 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Grassland",
    abilities: ["Overgrow", "Chlorophyll"],
    stats: {
      hp: 45,
      attack: 49,
      defense: 49,
      spAttack: 65,
      spDefense: 65,
      speed: 45
    },
    evolution: [2, 3]
  },
  {
    id: 2,
    name: "Ivysaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
    pokedexNumber: "002",
    height: "1.0 m",
    weight: "13.0 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Grassland",
    abilities: ["Overgrow", "Chlorophyll"],
    stats: {
      hp: 60,
      attack: 62,
      defense: 63,
      spAttack: 80,
      spDefense: 80,
      speed: 60
    },
    evolution: [1, 3]
  },
  {
    id: 3,
    name: "Venusaur",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
    pokedexNumber: "003",
    height: "2.0 m",
    weight: "100.0 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Grassland",
    abilities: ["Overgrow", "Chlorophyll"],
    stats: {
      hp: 80,
      attack: 82,
      defense: 83,
      spAttack: 100,
      spDefense: 100,
      speed: 80
    },
    yourStats: {
      hp: 90,
      attack: 92,
      defense: 93,
      spAttack: 110,
      spDefense: 110,
      speed: 90
    },
    evolution: [1, 2]
  },
  {
    id: 4,
    name: "Charmander",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
    pokedexNumber: "004",
    height: "0.6 m",
    weight: "8.5 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Mountain",
    abilities: ["Blaze", "Solar Power"],
    stats: {
      hp: 39,
      attack: 52,
      defense: 43,
      spAttack: 60,
      spDefense: 50,
      speed: 65
    },
    evolution: [5, 6]
  },
  {
    id: 5,
    name: "Charmeleon",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
    pokedexNumber: "005",
    height: "1.1 m",
    weight: "19.0 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Mountain",
    abilities: ["Blaze", "Solar Power"],
    stats: {
      hp: 58,
      attack: 64,
      defense: 58,
      spAttack: 80,
      spDefense: 65,
      speed: 80
    },
    evolution: [4, 6]
  },
  {
    id: 6,
    name: "Charizard",
    types: ["fire", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    pokedexNumber: "006",
    height: "1.7 m",
    weight: "90.5 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Mountain",
    abilities: ["Blaze", "Solar Power"],
    stats: {
      hp: 78,
      attack: 84,
      defense: 78,
      spAttack: 109,
      spDefense: 85,
      speed: 100
    },
    evolution: [4, 5]
  },
  {
    id: 7,
    name: "Squirtle",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
    pokedexNumber: "007",
    height: "0.5 m",
    weight: "9.0 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Waters Edge",
    abilities: ["Torrent", "Rain Dish"],
    stats: {
      hp: 44,
      attack: 48,
      defense: 65,
      spAttack: 50,
      spDefense: 64,
      speed: 43
    },
    evolution: [8, 9]
  },
  {
    id: 8,
    name: "Wartortle",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
    pokedexNumber: "008",
    height: "1.0 m",
    weight: "22.5 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Waters Edge",
    abilities: ["Torrent", "Rain Dish"],
    stats: {
      hp: 59,
      attack: 63,
      defense: 80,
      spAttack: 65,
      spDefense: 80,
      speed: 58
    },
    evolution: [7, 9]
  },
  {
    id: 9,
    name: "Blastoise",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
    pokedexNumber: "009",
    height: "1.6 m",
    weight: "85.5 kg",
    genderRatio: "87.5% ♂ / 12.5% ♀",
    habitat: "Waters Edge",
    abilities: ["Torrent", "Rain Dish"],
    stats: {
      hp: 79,
      attack: 83,
      defense: 100,
      spAttack: 85,
      spDefense: 105,
      speed: 78
    },
    evolution: [7, 8]
  },
  {
    id: 10,
    name: "Caterpie",
    types: ["bug"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
    pokedexNumber: "010",
    height: "0.3 m",
    weight: "2.9 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Shield Dust", "Run Away"],
    stats: {
      hp: 45,
      attack: 30,
      defense: 35,
      spAttack: 20,
      spDefense: 20,
      speed: 45
    },
    evolution: [11, 12]
  },
  {
    id: 11,
    name: "Metapod",
    types: ["bug"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png",
    pokedexNumber: "011",
    height: "0.7 m",
    weight: "9.9 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Shed Skin"],
    stats: {
      hp: 50,
      attack: 20,
      defense: 55,
      spAttack: 25,
      spDefense: 25,
      speed: 30
    },
    evolution: [10, 12]
  },
  {
    id: 12,
    name: "Butterfree",
    types: ["bug", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
    pokedexNumber: "012",
    height: "1.1 m",
    weight: "32.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Compound Eyes", "Tinted Lens"],
    stats: {
      hp: 60,
      attack: 45,
      defense: 50,
      spAttack: 90,
      spDefense: 80,
      speed: 70
    },
    evolution: [10, 11]
  },
  {
    id: 13,
    name: "Weedle",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png",
    pokedexNumber: "013",
    height: "0.3 m",
    weight: "3.2 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Shield Dust", "Run Away"],
    stats: {
      hp: 40,
      attack: 35,
      defense: 30,
      spAttack: 20,
      spDefense: 20,
      speed: 50
    },
    evolution: [14, 15]
  },
  {
    id: 14,
    name: "Kakuna",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png",
    pokedexNumber: "014",
    height: "0.6 m",
    weight: "10.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Shed Skin"],
    stats: {
      hp: 45,
      attack: 25,
      defense: 50,
      spAttack: 25,
      spDefense: 25,
      speed: 35
    },
    evolution: [13, 15]
  },
  {
    id: 15,
    name: "Beedrill",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
    pokedexNumber: "015",
    height: "1.0 m",
    weight: "29.5 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Swarm", "Sniper"],
    stats: {
      hp: 65,
      attack: 90,
      defense: 40,
      spAttack: 45,
      spDefense: 80,
      speed: 75
    },
    evolution: [13, 14]
  },
  {
    id: 16,
    name: "Pidgey",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
    pokedexNumber: "016",
    height: "0.3 m",
    weight: "1.8 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Keen Eye", "Tangled Feet", "Big Pecks"],
    stats: {
      hp: 40,
      attack: 45,
      defense: 40,
      spAttack: 35,
      spDefense: 35,
      speed: 56
    },
    evolution: [17, 18]
  },
  {
    id: 17,
    name: "Pidgeotto",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
    pokedexNumber: "017",
    height: "1.1 m",
    weight: "30.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Keen Eye", "Tangled Feet", "Big Pecks"],
    stats: {
      hp: 63,
      attack: 60,
      defense: 55,
      spAttack: 50,
      spDefense: 50,
      speed: 71
    },
    evolution: [16, 18]
  },
  {
    id: 18,
    name: "Pidgeot",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png",
    pokedexNumber: "018",
    height: "1.5 m",
    weight: "39.5 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Keen Eye", "Tangled Feet", "Big Pecks"],
    stats: {
      hp: 83,
      attack: 80,
      defense: 75,
      spAttack: 70,
      spDefense: 70,
      speed: 101
    },
    evolution: [16, 17]
  },
  {
    id: 19,
    name: "Rattata",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
    pokedexNumber: "019",
    height: "0.3 m",
    weight: "3.5 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Grassland",
    abilities: ["Run Away", "Guts", "Hustle"],
    stats: {
      hp: 30,
      attack: 56,
      defense: 35,
      spAttack: 25,
      spDefense: 35,
      speed: 72
    },
    evolution: [20]
  },
  {
    id: 20,
    name: "Raticate",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png",
    pokedexNumber: "020",
    height: "0.7 m",
    weight: "18.5 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Grassland",
    abilities: ["Run Away", "Guts", "Hustle"],
    stats: {
      hp: 55,
      attack: 81,
      defense: 60,
      spAttack: 50,
      spDefense: 70,
      speed: 97
    },
    evolution: [19]
  },
  {
    id: 21,
    name: "Spearow",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png",
    pokedexNumber: "021",
    height: "0.3 m",
    weight: "2.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Grassland",
    abilities: ["Keen Eye", "Sniper"],
    stats: {
      hp: 40,
      attack: 60,
      defense: 30,
      spAttack: 31,
      spDefense: 31,
      speed: 70
    },
    evolution: [22]
  },
  {
    id: 22,
    name: "Fearow",
    types: ["normal", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png",
    pokedexNumber: "022",
    height: "1.2 m",
    weight: "38.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Grassland",
    abilities: ["Keen Eye", "Sniper"],
    stats: {
      hp: 65,
      attack: 90,
      defense: 65,
      spAttack: 61,
      spDefense: 61,
      speed: 100
    },
    evolution: [21]
  },
  {
    id: 23,
    name: "Ekans",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png",
    pokedexNumber: "023",
    height: "2.0 m",
    weight: "6.9 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Grassland",
    abilities: ["Intimidate", "Shed Skin", "Unnerve"],
    stats: {
      hp: 35,
      attack: 60,
      defense: 44,
      spAttack: 40,
      spDefense: 54,
      speed: 55
    },
    evolution: [24]
  },
  {
    id: 24,
    name: "Arbok",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png",
    pokedexNumber: "024",
    height: "3.5 m",
    weight: "65.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Grassland",
    abilities: ["Intimidate", "Shed Skin", "Unnerve"],
    stats: {
      hp: 60,
      attack: 95,
      defense: 69,
      spAttack: 65,
      spDefense: 79,
      speed: 80
    },
    evolution: [23]
  },
  {
    id: 25,
    name: "Pikachu",
    types: ["electric"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    pokedexNumber: "025",
    height: "0.4 m",
    weight: "6.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Static", "Lightning Rod"],
    stats: {
      hp: 35,
      attack: 55,
      defense: 40,
      spAttack: 50,
      spDefense: 50,
      speed: 90
    },
    evolution: [26]
  },
  {
    id: 26,
    name: "Raichu",
    types: ["electric"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
    pokedexNumber: "026",
    height: "0.8 m",
    weight: "30.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Forest",
    abilities: ["Static", "Lightning Rod"],
    stats: {
      hp: 60,
      attack: 90,
      defense: 55,
      spAttack: 90,
      spDefense: 80,
      speed: 110
    },
    evolution: [25]
  },
  {
    id: 27,
    name: "Sandshrew",
    types: ["ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
    pokedexNumber: "027",
    height: "0.6 m",
    weight: "12.0 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Rough Terrain",
    abilities: ["Sand Veil", "Sand Rush"],
    stats: {
      hp: 50,
      attack: 75,
      defense: 85,
      spAttack: 20,
      spDefense: 30,
      speed: 40
    },
    evolution: [28]
  },
  {
    id: 28,
    name: "Sandslash",
    types: ["ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png",
    pokedexNumber: "028",
    height: "1.0 m",
    weight: "29.5 kg",
    genderRatio: "50% ♂ / 50% ♀",
    habitat: "Rough Terrain",
    abilities: ["Sand Veil", "Sand Rush"],
    stats: {
      hp: 75,
      attack: 100,
      defense: 110,
      spAttack: 45,
      spDefense: 55,
      speed: 65
    },
    evolution: [27]
  },
  {
    id: 29,
    name: "Nidoran♀",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png",
    pokedexNumber: "029",
    height: "0.4 m",
    weight: "7.0 kg",
    genderRatio: "0% ♂ / 100% ♀",
    habitat: "Grassland",
    abilities: ["Poison Point", "Rivalry", "Hustle"],
    stats: {
      hp: 55,
      attack: 47,
      defense: 52,
      spAttack: 40,
      spDefense: 40,
      speed: 41
    },
    evolution: [30]
  },
  {
    id: 30,
    name: "Nidorina",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
    pokedexNumber: "030",
    height: "0.8 m",
    weight: "20.0 kg",
    genderRatio: "0% ♂ / 100% ♀",
    habitat: "Grassland",
    abilities: ["Poison Point", "Rivalry", "Hustle"],
    stats: {
      hp: 70,
      attack: 62,
      defense: 67,
      spAttack: 55,
      spDefense: 55,
      speed: 56
    },
    evolution: [29]
  }
];