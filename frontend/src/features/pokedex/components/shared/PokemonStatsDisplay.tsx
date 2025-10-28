import {StackedProgress} from '@features/clicker';
import {getStatBarColors} from '../../utils/typeColors';
import type {PokemonStats} from '@features/pokedex';

interface PokemonStatsDisplayProps {
  stats: PokemonStats;
  upgradeLevel?: number;
  isDarkMode: boolean;
}

/**
 * Displays Pokemon stats with progress bars
 * Shows base stats and upgraded stats (if applicable)
 */
export function PokemonStatsDisplay({
  stats,
  upgradeLevel = 1,
  isDarkMode,
}: PokemonStatsDisplayProps) {
  const statColors = getStatBarColors(isDarkMode);

  // Calculate upgraded stats (3% per level)
  const statMultiplier = 1 + 0.03 * (upgradeLevel - 1);
  const upgradedStats = {
    hp: Math.floor((stats?.hp || 0) * statMultiplier),
    attack: Math.floor((stats?.attack || 0) * statMultiplier),
    defense: Math.floor((stats?.defense || 0) * statMultiplier),
    spAttack: Math.floor((stats?.spAttack || 0) * statMultiplier),
    spDefense: Math.floor((stats?.spDefense || 0) * statMultiplier),
    speed: Math.floor((stats?.speed || 0) * statMultiplier),
  };

  return (
    <section className="w-full bg-tranparent border-none p-2 md:p-3 mb-2 md:mb-3 font-press-start">
      <div className="statsSection">
        <div className="statsHeaderRow grid grid-cols-[1fr,4fr] mb-1 text-[10px] md:text-xs font-bold text-center">
          <span></span>
        </div>

        <div className="statsGrid grid grid-cols-[1fr,4fr] grid-rows-auto gap-1">
          <div className="statsLabels col-start-1 row-start-1 flex flex-col justify-between font-bold text-[10px] md:text-xs">
            <span>HP</span>
            <span>Attack</span>
            <span>Defense</span>
            <span>Sp. Atk</span>
            <span>Sp. Def</span>
            <span>Speed</span>
          </div>
          <div className="statsBars col-start-2 row-start-1 flex flex-col gap-1">
            <StackedProgress
              baseValue={stats?.hp ?? 0}
              yourValue={upgradedStats.hp}
              max={255}
              color={statColors.hp.color}
              upgradeColor={statColors.hp.upgradeColor}
            />
            <StackedProgress
              baseValue={stats?.attack ?? 0}
              yourValue={upgradedStats.attack}
              max={255}
              color={statColors.attack.color}
              upgradeColor={statColors.attack.upgradeColor}
            />
            <StackedProgress
              baseValue={stats?.defense ?? 0}
              yourValue={upgradedStats.defense}
              max={255}
              color={statColors.defense.color}
              upgradeColor={statColors.defense.upgradeColor}
            />
            <StackedProgress
              baseValue={stats?.spAttack ?? 0}
              yourValue={upgradedStats.spAttack}
              max={255}
              color={statColors.spAttack.color}
              upgradeColor={statColors.spAttack.upgradeColor}
            />
            <StackedProgress
              baseValue={stats?.spDefense ?? 0}
              yourValue={upgradedStats.spDefense}
              max={255}
              color={statColors.spDefense.color}
              upgradeColor={statColors.spDefense.upgradeColor}
            />
            <StackedProgress
              baseValue={stats?.speed ?? 0}
              yourValue={upgradedStats.speed}
              max={255}
              color={statColors.speed.color}
              upgradeColor={statColors.speed.upgradeColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
