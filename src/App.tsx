import { useState, useEffect } from 'react'
import { mockPokemonData, type Pokemon } from './data/mockData'
import { Card } from '@/components/ui/pixelact-ui/card'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/pixelact-ui/avatar'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Label } from '@/components/ui/pixelact-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/pixelact-ui/select'
import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/pixelact-ui/menubar'
import React from 'react'
import { SearchIcon, CloseIcon, UserIcon, SunIcon, MoonIcon, MenuIcon } from '@/components/ui/pixelact-ui/icons'
import { PokeClicker } from './components/PokeClicker'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>(mockPokemonData)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<'clicker' | 'pokedex'>('clicker')

  const handlePokemonClick = (pokemon: Pokemon) => {
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <header className="bg-[#e8e8d0] p-2 sm:p-4 md:p-8">
        <Menubar className="w-full justify-between h-14 sm:h-16 md:h-20 px-2 sm:px-4 py-2 sm:py-3 md:py-4">
          <div className="flex items-center">
            <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-black pixel-font whitespace-nowrap flex-shrink-[2] min-w-0">
              PokeClicker
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              className="text-xs md:text-sm"
              onClick={() => setCurrentPage('clicker')}
            >
              PokeClicker
            </Button>
            <Button
              className="text-xs md:text-sm"
              onClick={() => setCurrentPage('pokedex')}
            >
              Pokedex
            </Button>

            <Button onClick={toggleTheme} className="p-2">
              {isDarkMode ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>

            <Button className="p-2">
              <UserIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button onClick={toggleMobileMenu} className="p-2">
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </Menubar>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-[#e8e8d0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
            <div className="flex flex-col gap-3">
              <Button
                className="w-full text-sm"
                onClick={() => setCurrentPage('clicker')}
              >
                PokeClicker
              </Button>
              <Button
                className="w-full text-sm"
                onClick={() => setCurrentPage('pokedex')}
              >
                Pokedex
              </Button>

              <div className="flex items-center justify-center gap-4 mt-2">
                <Button onClick={toggleTheme} className="p-2">
                  {isDarkMode ? (
                    <SunIcon className="w-4 h-4" />
                  ) : (
                    <MoonIcon className="w-4 h-4" />
                  )}
                </Button>

                <Button className="p-2">
                  <UserIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="bg-[#e8e8d0] min-h-screen px-4 md:px-8 pb-8">
        {currentPage === 'clicker' ? (
          <section className="py-8">
            <PokeClicker />
          </section>
        ) : (
          <>
            {/* Search Bar */}
            <section className="mb-6 max-w-4xl mx-auto">
              <form className="bg-[#e8e8d0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4" role="search" onSubmit={(e) => e.preventDefault()}>
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
                  <p className="pixel-font text-xl text-gray-600">No Pokemon found</p>
                  <p className="pixel-font text-sm text-gray-500 mt-2">Try a different search term</p>
                </div>
              ) : (
                <>
                  <ul className="grid gap-4 md:gap-6 list-none p-0 m-0" style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
                    justifyContent: 'center'
                  }}>
                    {filteredPokemon.map((pokemon) => (
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
                </>
              )}
            </section>
          </>
        )}
      </main>
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