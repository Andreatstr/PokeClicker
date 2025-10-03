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
  },
  {
    id: 31,
    name: "Nidoqueen",
    types: ["poison", "ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png",
    pokedexNumber: "031",
    height: "1.3 m",
    weight: "60.0 kg",
    genderRatio: "0% ♂ / 100% ♀",
    habitat: "Grassland",
    abilities: ["Poison Point", "Rivalry", "Sheer Force"],
    stats: {
      hp: 90,
      attack: 92,
      defense: 87,
      spAttack: 75,
      spDefense: 85,
      speed: 76
    }
  },
  {
    id: 32,
    name: "Nidoran-m",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png",
    pokedexNumber: "032",
    height: "0.5 m",
    weight: "9.0 kg",
    genderRatio: "100% ♂ / 0% ♀",
    habitat: "Grassland",
    abilities: ["Poison Point", "Rivalry", "Hustle"],
    stats: {
      hp: 46,
      attack: 57,
      defense: 40,
      spAttack: 40,
      spDefense: 40,
      speed: 50
    }
  },
  {
    id: 33,
    name: "Nidorino",
    types: ["poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png",
    pokedexNumber: "033",
    height: "0.9 m",
    weight: "19.5 kg",
    genderRatio: "100% ♂ / 0% ♀",
    habitat: "Grassland",
    abilities: ["Poison Point", "Rivalry", "Hustle"],
    stats: {
      hp: 61,
      attack: 72,
      defense: 57,
      spAttack: 55,
      spDefense: 55,
      speed: 65
    }
  },
  {
    id: 34,
    name: "Nidoking",
    types: ["poison", "ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
    pokedexNumber: "034",
    height: "1.4 m",
    weight: "62.0 kg",
    genderRatio: "100% ♂ / 0% ♀",
    habitat: "Grassland",
    abilities: ["Poison Point", "Rivalry", "Sheer Force"],
    stats: {
      hp: 81,
      attack: 102,
      defense: 77,
      spAttack: 85,
      spDefense: 75,
      speed: 85
    }
  },
  {
    id: 35,
    name: "Clefairy",
    types: ["fairy"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png",
    pokedexNumber: "035",
    height: "0.6 m",
    weight: "7.5 kg",
    genderRatio: "25.0% ♂ / 75.0% ♀",
    habitat: "Mountain",
    abilities: ["Cute Charm", "Magic Guard", "Friend Guard"],
    stats: {
      hp: 70,
      attack: 45,
      defense: 48,
      spAttack: 60,
      spDefense: 65,
      speed: 35
    }
  },
  {
    id: 36,
    name: "Clefable",
    types: ["fairy"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png",
    pokedexNumber: "036",
    height: "1.3 m",
    weight: "40.0 kg",
    genderRatio: "25.0% ♂ / 75.0% ♀",
    habitat: "Mountain",
    abilities: ["Cute Charm", "Magic Guard", "Unaware"],
    stats: {
      hp: 95,
      attack: 70,
      defense: 73,
      spAttack: 95,
      spDefense: 90,
      speed: 60
    }
  },
  {
    id: 37,
    name: "Vulpix",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png",
    pokedexNumber: "037",
    height: "0.6 m",
    weight: "9.9 kg",
    genderRatio: "25.0% ♂ / 75.0% ♀",
    habitat: "Grassland",
    abilities: ["Flash Fire", "Drought"],
    stats: {
      hp: 38,
      attack: 41,
      defense: 40,
      spAttack: 50,
      spDefense: 65,
      speed: 65
    }
  },
  {
    id: 38,
    name: "Ninetales",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png",
    pokedexNumber: "038",
    height: "1.1 m",
    weight: "19.9 kg",
    genderRatio: "25.0% ♂ / 75.0% ♀",
    habitat: "Grassland",
    abilities: ["Flash Fire", "Drought"],
    stats: {
      hp: 73,
      attack: 76,
      defense: 75,
      spAttack: 81,
      spDefense: 100,
      speed: 100
    }
  },
  {
    id: 39,
    name: "Jigglypuff",
    types: ["normal", "fairy"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
    pokedexNumber: "039",
    height: "0.5 m",
    weight: "5.5 kg",
    genderRatio: "25.0% ♂ / 75.0% ♀",
    habitat: "Grassland",
    abilities: ["Cute Charm", "Competitive", "Friend Guard"],
    stats: {
      hp: 115,
      attack: 45,
      defense: 20,
      spAttack: 45,
      spDefense: 25,
      speed: 20
    }
  },
  {
    id: 40,
    name: "Wigglytuff",
    types: ["normal", "fairy"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
    pokedexNumber: "040",
    height: "1.0 m",
    weight: "12.0 kg",
    genderRatio: "25.0% ♂ / 75.0% ♀",
    habitat: "Grassland",
    abilities: ["Cute Charm", "Competitive", "Frisk"],
    stats: {
      hp: 140,
      attack: 70,
      defense: 45,
      spAttack: 85,
      spDefense: 50,
      speed: 45
    }
  },
  {
    id: 41,
    name: "Zubat",
    types: ["poison", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
    pokedexNumber: "041",
    height: "0.8 m",
    weight: "7.5 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Cave",
    abilities: ["Inner Focus", "Infiltrator"],
    stats: {
      hp: 40,
      attack: 45,
      defense: 35,
      spAttack: 30,
      spDefense: 40,
      speed: 55
    }
  },
  {
    id: 42,
    name: "Golbat",
    types: ["poison", "flying"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png",
    pokedexNumber: "042",
    height: "1.6 m",
    weight: "55.0 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Cave",
    abilities: ["Inner Focus", "Infiltrator"],
    stats: {
      hp: 75,
      attack: 80,
      defense: 70,
      spAttack: 65,
      spDefense: 75,
      speed: 90
    }
  },
  {
    id: 43,
    name: "Oddish",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png",
    pokedexNumber: "043",
    height: "0.5 m",
    weight: "5.4 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Grassland",
    abilities: ["Chlorophyll", "Run Away"],
    stats: {
      hp: 45,
      attack: 50,
      defense: 55,
      spAttack: 75,
      spDefense: 65,
      speed: 30
    }
  },
  {
    id: 44,
    name: "Gloom",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png",
    pokedexNumber: "044",
    height: "0.8 m",
    weight: "8.6 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Grassland",
    abilities: ["Chlorophyll", "Stench"],
    stats: {
      hp: 60,
      attack: 65,
      defense: 70,
      spAttack: 85,
      spDefense: 75,
      speed: 40
    }
  },
  {
    id: 45,
    name: "Vileplume",
    types: ["grass", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png",
    pokedexNumber: "045",
    height: "1.2 m",
    weight: "18.6 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Grassland",
    abilities: ["Chlorophyll", "Effect Spore"],
    stats: {
      hp: 75,
      attack: 80,
      defense: 85,
      spAttack: 110,
      spDefense: 90,
      speed: 50
    }
  },
  {
    id: 46,
    name: "Paras",
    types: ["bug", "grass"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png",
    pokedexNumber: "046",
    height: "0.3 m",
    weight: "5.4 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Forest",
    abilities: ["Effect Spore", "Dry Skin", "Damp"],
    stats: {
      hp: 35,
      attack: 70,
      defense: 55,
      spAttack: 45,
      spDefense: 55,
      speed: 25
    }
  },
  {
    id: 47,
    name: "Parasect",
    types: ["bug", "grass"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png",
    pokedexNumber: "047",
    height: "1.0 m",
    weight: "29.5 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Forest",
    abilities: ["Effect Spore", "Dry Skin", "Damp"],
    stats: {
      hp: 60,
      attack: 95,
      defense: 80,
      spAttack: 60,
      spDefense: 80,
      speed: 30
    }
  },
  {
    id: 48,
    name: "Venonat",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png",
    pokedexNumber: "048",
    height: "1.0 m",
    weight: "30.0 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Forest",
    abilities: ["Compound Eyes", "Tinted Lens", "Run Away"],
    stats: {
      hp: 60,
      attack: 55,
      defense: 50,
      spAttack: 40,
      spDefense: 55,
      speed: 45
    }
  },
  {
    id: 49,
    name: "Venomoth",
    types: ["bug", "poison"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png",
    pokedexNumber: "049",
    height: "1.5 m",
    weight: "12.5 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Forest",
    abilities: ["Shield Dust", "Tinted Lens", "Wonder Skin"],
    stats: {
      hp: 70,
      attack: 65,
      defense: 60,
      spAttack: 90,
      spDefense: 75,
      speed: 90
    }
  },
  {
    id: 50,
    name: "Diglett",
    types: ["ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png",
    pokedexNumber: "050",
    height: "0.2 m",
    weight: "0.8 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Cave",
    abilities: ["Sand Veil", "Arena Trap", "Sand Force"],
    stats: {
      hp: 10,
      attack: 55,
      defense: 25,
      spAttack: 35,
      spDefense: 45,
      speed: 95
    }
  },
  {
    id: 51,
    name: "Dugtrio",
    types: ["ground"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
    pokedexNumber: "051",
    height: "0.7 m",
    weight: "33.3 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Cave",
    abilities: ["Sand Veil", "Arena Trap", "Sand Force"],
    stats: {
      hp: 35,
      attack: 100,
      defense: 50,
      spAttack: 50,
      spDefense: 70,
      speed: 120
    }
  },
  {
    id: 52,
    name: "Meowth",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
    pokedexNumber: "052",
    height: "0.4 m",
    weight: "4.2 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Urban",
    abilities: ["Pickup", "Technician", "Unnerve"],
    stats: {
      hp: 40,
      attack: 45,
      defense: 35,
      spAttack: 40,
      spDefense: 40,
      speed: 90
    }
  },
  {
    id: 53,
    name: "Persian",
    types: ["normal"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png",
    pokedexNumber: "053",
    height: "1.0 m",
    weight: "32.0 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Urban",
    abilities: ["Limber", "Technician", "Unnerve"],
    stats: {
      hp: 65,
      attack: 70,
      defense: 60,
      spAttack: 65,
      spDefense: 65,
      speed: 115
    }
  },
  {
    id: 54,
    name: "Psyduck",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png",
    pokedexNumber: "054",
    height: "0.8 m",
    weight: "19.6 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Waters Edge",
    abilities: ["Damp", "Cloud Nine", "Swift Swim"],
    stats: {
      hp: 50,
      attack: 52,
      defense: 48,
      spAttack: 65,
      spDefense: 50,
      speed: 55
    }
  },
  {
    id: 55,
    name: "Golduck",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/55.png",
    pokedexNumber: "055",
    height: "1.7 m",
    weight: "76.6 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Waters Edge",
    abilities: ["Damp", "Cloud Nine", "Swift Swim"],
    stats: {
      hp: 80,
      attack: 82,
      defense: 78,
      spAttack: 95,
      spDefense: 80,
      speed: 85
    }
  },
  {
    id: 56,
    name: "Mankey",
    types: ["fighting"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png",
    pokedexNumber: "056",
    height: "0.5 m",
    weight: "28.0 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Mountain",
    abilities: ["Vital Spirit", "Anger Point", "Defiant"],
    stats: {
      hp: 40,
      attack: 80,
      defense: 35,
      spAttack: 35,
      spDefense: 45,
      speed: 70
    }
  },
  {
    id: 57,
    name: "Primeape",
    types: ["fighting"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png",
    pokedexNumber: "057",
    height: "1.0 m",
    weight: "32.0 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Mountain",
    abilities: ["Vital Spirit", "Anger Point", "Defiant"],
    stats: {
      hp: 65,
      attack: 105,
      defense: 60,
      spAttack: 60,
      spDefense: 70,
      speed: 95
    }
  },
  {
    id: 58,
    name: "Growlithe",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png",
    pokedexNumber: "058",
    height: "0.7 m",
    weight: "19.0 kg",
    genderRatio: "75.0% ♂ / 25.0% ♀",
    habitat: "Grassland",
    abilities: ["Intimidate", "Flash Fire", "Justified"],
    stats: {
      hp: 55,
      attack: 70,
      defense: 45,
      spAttack: 70,
      spDefense: 50,
      speed: 60
    }
  },
  {
    id: 59,
    name: "Arcanine",
    types: ["fire"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png",
    pokedexNumber: "059",
    height: "1.9 m",
    weight: "155.0 kg",
    genderRatio: "75.0% ♂ / 25.0% ♀",
    habitat: "Grassland",
    abilities: ["Intimidate", "Flash Fire", "Justified"],
    stats: {
      hp: 90,
      attack: 110,
      defense: 80,
      spAttack: 100,
      spDefense: 80,
      speed: 95
    }
  },
  {
    id: 60,
    name: "Poliwag",
    types: ["water"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png",
    pokedexNumber: "060",
    height: "0.6 m",
    weight: "12.4 kg",
    genderRatio: "50.0% ♂ / 50.0% ♀",
    habitat: "Waters Edge",
    abilities: ["Water Absorb", "Damp", "Swift Swim"],
    stats: {
      hp: 40,
      attack: 50,
      defense: 40,
      spAttack: 40,
      spDefense: 40,
      speed: 90
    }
  }
];