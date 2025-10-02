import { useState, useEffect } from 'react'
import { mockPokemonData, type Pokemon } from './data/mockData'
import { PokemonCard } from './components/PokemonCard'
import { PokemonDetailModal } from './components/ui/pixelact-ui/PokemonDetailModal'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Label } from '@/components/ui/pixelact-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/pixelact-ui/select'
import { SearchIcon, CloseIcon } from '@/components/ui/pixelact-ui/icons'
import { PokeClicker } from './components/PokeClicker'
import { Navbar } from './components/Navbar'

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>(mockPokemonData)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState<'clicker' | 'pokedex'>('clicker')

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
    setModalOpen(true)
    console.log('Clicked on:', pokemon.name)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setFilteredPokemon(mockPokemonData)
    } else {
      const filtered = mockPokemonData.filter(pokemon =>
        pokemon.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      setFilteredPokemon(filtered)
    }
  }, [debouncedSearchTerm])

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="min-h-screen px-4 sm:px-6 md:px-8 pb-8 pt-0" style={{ backgroundColor: 'var(--retro-secondary)' }}>
        {currentPage === 'clicker' ? (
          <section className="py-8">
            <PokeClicker />
          </section>
        ) : (
          <>
            {/* Search Bar */}
            <section className="mb-6 mt-6 sm:mt-4 max-w-4xl mx-auto">
              <form className="p-4" style={{
                backgroundColor: 'var(--retro-primary)',
                border: '4px solid var(--retro-border)',
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'
              }} role="search" onSubmit={(e) => e.preventDefault()}>
                <Label htmlFor="pokemon-search" className="sr-only">Search Pokemon</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="pokemon-search"
                    type="search"
                    placeholder="search"
                    className="w-full border-0 text-xl pl-12 pr-12 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label="Clear search"
                      onKeyDown={(e) => e.key === 'Enter' && handleClearSearch()}
                    >
                      <CloseIcon className="w-5 h-5 text-gray-600 hover:text-black" />
                    </div>
                  )}
                </div>
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
              {filteredPokemon.length === 0 ? (
                <div className="text-center py-16">
                  <p className="pixel-font text-xl ">No Pokemon found</p>
                  <p className="pixel-font text-sm text-[var(--retro-border)] mt-2">Try a different search term</p>
                </div>
              ) : (
                <>
                  <ul className="grid gap-4 md:gap-6 list-none p-0 m-0" style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
                    justifyContent: 'center'
                  }}>
                    {filteredPokemon.map((pokemon) => (
                      <li key={pokemon.id}>
                        <PokemonCard pokemon={pokemon} onClick={handlePokemonClick} />
                      </li>
                    ))}
                  </ul>

                  {/* Load More Button */}
                  <footer className="flex justify-center mt-8">
                    <Button variant="default" size="lg">
                      Load more
                    </Button>
                  </footer>
                </>
              )}
            </section>
          </>
        )}
      </main>

      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSelectPokemon={(name) => {
          const next = mockPokemonData.find((p) => p.name === name)
          if (next) setSelectedPokemon(next)
        }}
      />
    </>
  )
}

export default App
