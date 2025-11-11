import {Card, Button} from '@ui/pixelact';
import {ArrowRightIcon} from '@ui/pixelact/icons';
import {formatNumber} from '@/lib/formatNumber';
import {getStatDescription, getUpgradeCost} from '../utils/statDescriptions';
import {toDecimal} from '@/lib/decimal';
import type {UserStats} from '@/lib/graphql/types';
import {UPGRADES} from '@/config/upgradeConfig';

interface UpgradesPanelProps {
  isDarkMode: boolean;
  stats: UserStats;
  currentCandy: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  onUpgrade: (stat: keyof UserStats) => void;
  ownedPokemonCount?: number;
}

type UpgradeKey =
  | 'clickPower'
  | 'autoclicker'
  | 'luckyHitChance'
  | 'luckyHitMultiplier'
  | 'battleRewards'
  | 'clickMultiplier'
  | 'pokedexBonus';

export function UpgradesPanel({
  isDarkMode,
  stats,
  currentCandy,
  isLoading,
  isAuthenticated,
  onUpgrade,
  ownedPokemonCount = 0,
}: UpgradesPanelProps) {
  return (
    <Card
      data-onboarding="upgrade-panel"
      className="border-4 p-6"
      style={{
        background: isDarkMode
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937)'
          : 'linear-gradient(to bottom right, #ebe9e5, #dbd9d5, #ebe9e5)',
        borderColor: isDarkMode ? '#374151' : '#bbb7b2',
        boxShadow: isDarkMode
          ? '8px 8px 0px 0px rgba(55,65,81,1)'
          : '8px 8px 0px 0px rgba(187,183,178,1)',
      }}
    >
      <header
        className="border-2 p-3 mb-4 shadow-inner"
        style={{
          background: isDarkMode
            ? 'linear-gradient(to right, #dc2626, #ea580c, #ca8a04)'
            : 'linear-gradient(to right, #ef4444, #fb923c, #fde047)',
          borderColor: isDarkMode ? '#374151' : '#bbb7b2',
        }}
      >
        <h2
          className="pixel-font text-base font-bold text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
          style={{color: 'white'}}
        >
          POKEMON UPGRADES
        </h2>
      </header>
      <section className="flex flex-col gap-3">
        {stats &&
          (Object.keys(UPGRADES) as UpgradeKey[]).map((key) => {
            const value = stats[key] || 1;
            const cost = getUpgradeCost(key, value);
            const descriptionData = getStatDescription(
              key,
              stats,
              ownedPokemonCount
            );
            const config = UPGRADES[key];
            const barColor = isDarkMode
              ? config.color.dark
              : config.color.light;
            const buttonColor = isDarkMode
              ? config.color.dark
              : config.color.light;

            return (
              <article
                key={key}
                className="border-2 p-3 shadow-md hover:shadow-lg transition-shadow"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(to bottom right, #1f2937, #111827)'
                    : 'linear-gradient(to bottom right, var(--card), #e0deda)',
                  borderColor: isDarkMode ? '#374151' : '#bbb7b2',
                }}
              >
                <header className="flex items-center justify-between gap-4 mb-1">
                  <dl className="flex items-center gap-3 flex-1">
                    <div
                      className="w-2 h-8 border"
                      style={{
                        backgroundColor: barColor,
                        borderColor: isDarkMode ? '#374151' : '#bbb7b2',
                      }}
                      aria-hidden="true"
                    ></div>
                    <div className="flex flex-col">
                      <dt
                        className="pixel-font text-xs"
                        style={{
                          color: isDarkMode
                            ? 'var(--muted-foreground)'
                            : 'var(--muted-foreground)',
                        }}
                      >
                        {config.displayName}
                      </dt>
                      <dd
                        className="pixel-font text-lg font-bold"
                        style={{
                          color: isDarkMode
                            ? 'var(--foreground)'
                            : 'var(--foreground)',
                        }}
                      >
                        LV {String(value)}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    size="sm"
                    onClick={() => onUpgrade(key)}
                    disabled={
                      !isAuthenticated ||
                      toDecimal(currentCandy).lt(cost) ||
                      isLoading
                    }
                    bgColor={buttonColor}
                    className="pixel-font text-xs text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Upgrade"
                  >
                    <span className="drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
                      ↑ {formatNumber(cost)}
                    </span>
                  </Button>{' '}
                </header>
                <footer className="ml-5 flex items-center gap-1">
                  <p
                    className="pixel-font text-xs"
                    style={{
                      color: isDarkMode
                        ? 'var(--foreground)'
                        : 'var(--foreground)',
                    }}
                  >
                    {typeof descriptionData === 'object' &&
                    'current' in descriptionData ? (
                      <>
                        {formatNumber(descriptionData.current, {
                          showDecimals: true,
                        })}
                        <ArrowRightIcon size={14} className="inline mx-1" />
                        {formatNumber(descriptionData.next, {
                          showDecimals: true,
                        })}{' '}
                        {descriptionData.unit}
                      </>
                    ) : (
                      descriptionData
                    )}
                  </p>
                </footer>
              </article>
            );
          })}
      </section>
    </Card>
  );
}
