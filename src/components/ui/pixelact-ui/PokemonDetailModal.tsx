import { Dialog, DialogBody } from './dialog'
import { Progress } from './progress'
import { Badge } from './badge'
import { Button } from '@/components/ui/pixelact-ui/button'
import type { Pokemon } from '@/data/mockData'
import './styles/PokemonDetailModal.css'

interface Props {
  pokemon: Pokemon | null
  isOpen: boolean
  onClose: () => void
}

export function PokemonDetailModal({ pokemon, isOpen, onClose }: Props) {
  if (!pokemon) return null

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        <div className="modalContainer">
          {/* Left Box */}
          <aside className="leftBox">
            <div>
              <img src={pokemon.sprite} alt={pokemon.name} />
              <h2>{pokemon.name}</h2>
            </div>
            <ul>
              <li>Height: 0.3 m</li>
              <li>Weight: 3.5 kg</li>
              <li>Gender: ♂ / ♀</li>
              <li>Habitat: Grassland</li>
              <li>Abilities:</li>
              <ul>
                {pokemon.abilities?.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </ul>
          </aside>

          {/* Right Box */}
          <section className="rightBox">
            <div className="statsSection">
              <div className="statsHeaderRow">
                <span></span>
                <span>Default Stats</span>
                <span>Your Stats</span>
              </div>

              <div className="statsGrid">
                {/* Labels */}
                <div className="statsLabels">
                  <span>HP</span>
                  <span>Attack</span>
                  <span>Defense</span>
                  <span>Sp. Atk</span>
                  <span>Sp. Def</span>
                  <span>Speed</span>
                </div>

                {/* Default Stats */}
                <div className="statsBars">
                  <Progress value={pokemon.stats?.hp ?? 0} max={255} />
                  <Progress value={pokemon.stats?.attack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.defense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spAttack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spDefense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.speed ?? 0} max={255} />
                </div>

                {/* Your Stats */}
                <div className="statsBars">
                  {/* These can be dynamic later */}
                  <Progress value={pokemon.stats?.hp ?? 0} max={255} />
                  <Progress value={pokemon.stats?.attack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.defense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spAttack ?? 0} max={255} />
                  <Progress value={pokemon.stats?.spDefense ?? 0} max={255} />
                  <Progress value={pokemon.stats?.speed ?? 0} max={255} />
                </div>
              </div>
            </div>

            <div className="evolutionSection">
              <h3>Evolution</h3>
              <div className="evolutionRow">
                {[0, 1, 2].map((i) => {
                  const evo = pokemon.evolution?.[i]
                  return (
                    <div key={i} className="evolutionItem">
                      <p>{evo?.name || 'Empty'}</p>
                      {evo ? (
                        <Button variant="default">
                          <img src={evo.sprite} alt={evo.name} />
                        </Button>
                      ) : (
                        <div className="w-16 h-16 border-2 border-black bg-gray-100 flex items-center justify-center">
                          <span>Empty</span>
                        </div>
                      )}
                      {i < 2 && <span className="evolutionArrow">→</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="buttonRow">
              <Button variant="default">Click with {pokemon.name}</Button>
              <Button variant="default" onClick={onClose}>Close</Button>
            </div>
          </section>
        </div>
      </DialogBody>
    </Dialog>
  )
}

export default PokemonDetailModal