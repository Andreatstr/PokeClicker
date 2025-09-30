import { useState } from 'react'
import { mockPokemonData, type Pokemon } from './data/mockData'
import { PokemonDetailModal } from './components/ui/pixelact-ui/PokemonDetailModal'
import { Card } from '@/components/ui/pixelact-ui/card'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Label } from '@/components/ui/pixelact-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/pixelact-ui/select'
import { Sun, User } from 'lucide-react'

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
    setModalOpen(true)
    console.log('Clicked on:', pokemon.name)
  }

  const closeModal = () => {
    setSelectedPokemon(null)
    setModalOpen(false)
  }

  return (
    <>
      <header className="bg-[#e8e8d0] p-4 md:p-8">
        <nav className="bg-[#e8e8d0] rounded-lg p-4 md:p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-full overflow-hidden">
          <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black pixel-font whitespace-nowrap overflow-hidden text-ellipsis">
              PokeClicker
            </h1>

            <menu className="flex items-center gap-2 m-0 p-0 list-none flex-wrap justify-end">
              <li>
                <Button variant="default" size="sm" className="text-xs md:text-sm">
                  PokeClicker
                </Button>
              </li>
              <li>
                <Button variant="default" size="sm" className="text-xs md:text-sm">
                  Pokedex
                </Button>
              </li>
              <li>
                <Button variant="default" size="sm" className="w-9 h-9 p-0" aria-label="Toggle theme">
                  <Sun className="w-4 h-4" />
                </Button>
              </li>
              <li>
                <Button variant="default" size="sm" className="w-9 h-9 p-0 rounded-full overflow-hidden" aria-label="User profile">
                  <User className="w-4 h-4" />
                </Button>
              </li>
            </menu>
          </section>
        </nav>
      </header>

      <main className="bg-[#e8e8d0] min-h-screen px-4 md:px-8 pb-8">
        {/* Search Bar */}
        <section className="mb-6 max-w-4xl mx-auto">
          <form className="bg-[#e8e8d0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4" role="search">
            <Label htmlFor="pokemon-search" className="sr-only">Search Pokemon</Label>
            <Input
              id="pokemon-search"
              type="search"
              placeholder="search"
              className="w-full border-0 text-xl"
            />
          </form>
        </section>

        {/* Filters and Count */}
        <section className="mb-6">
          <form className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm pixel-font text-black">
              Showing: xx-xx
            </p>

            <fieldset className="flex flex-wrap gap-4 border-0 p-0 m-0">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-bold text-black">REGION</Label>
                <Select>
                  <SelectTrigger className="w-[280px] text-sm">
                    <SelectValue placeholder="Kanto (1-151)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kanto">Kanto (1-151)</SelectItem>
                    <SelectItem value="johto">Johto (152-251)</SelectItem>
                    <SelectItem value="hoenn">Hoenn (252-386)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-bold text-black">TYPE</Label>
                <Select>
                  <SelectTrigger className="w-[220px] text-sm">
                    <SelectValue placeholder="all types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">all types</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="grass">Grass</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-bold text-black">SORT BY</Label>
                <Select>
                  <SelectTrigger className="w-[220px] text-sm">
                    <SelectValue placeholder="ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">ID</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
          </form>
        </section>

        {/* Pokemon Grid */}
        <section className="max-w-[2000px] mx-auto">
          <ul className="grid gap-4 md:gap-6 list-none p-0 m-0" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
            justifyContent: 'center'
          }}>
            {mockPokemonData.map((pokemon) => (
              <li key={pokemon.id}>
                <Card
                  className="cursor-pointer hover:translate-y-[-4px] transition-transform duration-150 bg-[#e8e8d0] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-[280px]"
                  onClick={() => handlePokemonClick(pokemon)}
                >
                  <article className="text-center">
                    <figure className="bg-white border-2 border-black p-6 mb-4 aspect-square flex items-center justify-center m-0">
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </figure>
                    <p className="pixel-font text-xs text-gray-600 mb-1">
                      #{pokemon.pokedexNumber}
                    </p>
                    <p className="pixel-font text-lg font-bold text-black mb-3">
                      {pokemon.name}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className={`px-3 py-1 text-xs pixel-font font-bold text-white uppercase ${getTypeColor(type)}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </article>
                </Card>
              </li>
            ))}
          </ul>

          {/* Load More Button */}
          <footer className="flex justify-center mt-8">
            <Button variant="default" size="lg">
              Load more
            </Button>
          </footer>
        </section>
      </main>

      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}

function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  }
  return typeColors[type] || 'bg-gray-400'
}

export default App
