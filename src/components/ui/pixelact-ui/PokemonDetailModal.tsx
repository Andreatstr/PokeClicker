import { Dialog, DialogBody } from './dialog'
import { Progress } from './progress'
import { Button } from '@/components/ui/pixelact-ui/button'
import type { Pokemon } from '@/data/mockData'
import './styles/PokemonDetailModal.css'

interface Props {
  pokemon: Pokemon | null
  isOpen: boolean
  onClose: () => void
  onSelectPokemon?: (name: string) => void
}

export function PokemonDetailModal({ pokemon, isOpen, onClose, onSelectPokemon }: Props) {
  if (!pokemon) return null

  const fullEvolutionChain = [
    {
      name: pokemon.name,
      sprite: pokemon.sprite,
    },
    ...(pokemon.evolution ?? []),
  ]

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        <div className="modalHeader">
          <h2 className="pokemonName">{pokemon.name}</h2>
          <Button variant="default" className="closeButton" onClick={onClose}>X</Button>
        </div>

        <div className="modalContainer">
          {/* Left Box */}
          <aside className="leftBox">
            <figure className="spriteFrame">
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="spriteImage"
                style={{ imageRendering: 'pixelated' }}
              />
            </figure>

            <div className="infoGrid">
              <div><strong>Height:</strong> <span>{pokemon.height ?? '—'}</span></div>
              <div><strong>Weight:</strong> <span>{pokemon.weight ?? '—'}</span></div>
              <div><strong>Gender:</strong> <span>{pokemon.genderRatio ?? '—'}</span></div>
              <div><strong>Habitat:</strong> <span>{pokemon.habitat ?? '—'}</span></div>
            
              <div className="abilitiesList">
                <strong>Abilities:</strong>
                <ul>
                  {pokemon.abilities?.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            </div>
          </aside>

          {/* Right Box */}
          <section className="rightBox">
            {/* Stats Section */}
            <div className="statsSection">
              <div className="statsHeaderRow">
                <span></span>
                <span>Default Stats</span>
                <span>Your Stats</span>
              </div>

              <div className="statsGrid">
                <div className="statsLabels">
                  <span>HP</span>
                  <span>Attack</span>
                  <span>Defense</span>
                  <span>Sp. Atk</span>
                  <span>Sp. Def</span>
                  <span>Speed</span>
                </div>
                <div className="statsBars">
                  <Progress value={pokemon.stats?.hp ?? 0} max={255} />
                  <Progress value={pokemon.stats?.attack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.defense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spAttack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spDefense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.speed ?? 0} max={255} />
                </div>
                <div className="statsBars">
                  <Progress value={pokemon.stats?.hp ?? 0} max={255} />
                  <Progress value={pokemon.stats?.attack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.defense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spAttack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spDefense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.speed ?? 0} max={255} />
                </div>
              </div>
            </div>

            {/* Evolution Section */}
            <div className="evolutionWrapper">
              <h3>Evolution</h3>
              <div className="evolutionChain">
                {[0, 1, 2].map((i) => {
                  const evo = fullEvolutionChain[i]
                  const next = fullEvolutionChain[i + 1]
                  return (
                    <div key={i} className={`evolutionItem ${!evo ? 'invisible' : ''}`}>
                      {evo && (
                        <>
                          <button
                            className="evolutionButton"
                            onClick={() => onSelectPokemon?.(evo.name)}
                            title={`View ${evo.name}`}
                          >
                            <img src={evo.sprite} alt={evo.name} className="evolutionImage" />
                          </button>
                          {i < 2 && next && <span className="evolutionArrow">→</span>}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </DialogBody>
    </Dialog>
  )
}

export default PokemonDetailModal