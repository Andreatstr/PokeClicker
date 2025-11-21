import {useEffect, useRef} from 'react';
import {Dialog, DialogBody} from '@/ui/pixelact';

interface ClickerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function ClickerHelpModal({
  isOpen,
  onClose,
  isDarkMode,
}: ClickerHelpModalProps) {
  const accentColor = isDarkMode ? '#60a5fa' : '#1e40af';
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus to dialog when opened
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const timeoutId = setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const upgrades = [
    {
      name: 'Click Power',
      icon: '👆',
      effect: 'Increases candy earned per click',
      formula: '1.0954^(level/(1+0.001*level))',
      color: isDarkMode ? '#ff8b8bff' : '#c70101ff',
    },
    {
      name: 'Autoclicker',
      icon: '🤖',
      effect: 'Automatically clicks for you every second',
      formula: '1.0954^(level/(1+0.01*level))',
      color: isDarkMode ? '#f96363ff' : '#940000ff',
    },
    {
      name: 'Lucky Chance',
      icon: '🍀',
      effect: 'Chance for a lucky hit that multiplies candy earned',
      formula: '2*log(1+0.5*level) (caps ~8%)',
      color: isDarkMode ? '#ff71e5ff' : '#9d1984ff',
    },
    {
      name: 'Lucky Power',
      icon: '⚡',
      effect: 'Multiplier applied when you get a lucky hit',
      formula: '1.2^(level/(1+0.01*level))',
      color: isDarkMode ? '#ca7fffff' : '#7b22baff',
    },
    {
      name: 'Click Boost',
      icon: '💪',
      effect: 'Multiplies ALL your income (clicks + autoclicker)',
      formula: '1 + level*0.15',
      color: isDarkMode ? '#79cdcaff' : '#006f6bff',
    },
    {
      name: 'Pokedex Bonus',
      icon: '📖',
      effect: 'Multiplies ALL income - stronger with more Pokemon caught',
      formula: '1.005^(level*√pokemonCount)',
      color: isDarkMode ? '#7ab2eeff' : '#00438bff',
    },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody aria-labelledby="clicker-help-title">
        {/* Mobile drawer handle */}
        <header className="md:hidden flex justify-center mb-2">
          <div
            className="w-12 h-1 bg-gray-400 rounded-full"
            aria-hidden="true"
          ></div>
        </header>

        <div
          id="clicker-help-modal"
          ref={dialogRef}
          tabIndex={-1}
          className={`pixel-font border-4 p-3 md:p-4 relative backdrop-blur-md w-full max-h-[85vh] overflow-y-auto ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-[#f5f1e8] border-black'
          }`}
          style={{
            borderColor: isDarkMode ? '#333333' : 'black',
            boxShadow: isDarkMode
              ? '4px 4px 0px rgba(51,51,51,1)'
              : '4px 4px 0px rgba(0,0,0,1)',
            backgroundColor: isDarkMode
              ? 'rgba(20, 20, 20, 0.98)'
              : 'rgba(245, 241, 232, 1)',
            outline: 'none',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 z-10 py-1 px-2 text-xs bg-red-600 text-white cursor-pointer font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
            onClick={onClose}
            aria-label="Close help"
          >
            X
          </button>

          {/* Header */}
          <header className="mb-3 md:mb-4">
            <h2
              id="clicker-help-title"
              className="pixel-font text-base md:text-lg font-bold"
              style={{color: accentColor}}
            >
              Upgrade Guide
            </h2>
          </header>

          <div className="px-2 md:px-4 pb-2">
            {/* How to Play Section */}
            <section className="mb-4">
              <h3
                className="pixel-font text-sm font-bold mb-2"
                style={{color: accentColor}}
              >
                How to Play
              </h3>
              <p
                className="pixel-font text-xs md:text-sm mb-2"
                style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
              >
                Click on the gameboy screen to earn rare candy! Use candy to
                purchase upgrades that increase your clicking power and unlock
                passive income.
              </p>
            </section>

            {/* Upgrades Section */}
            <section>
              <h3
                className="pixel-font text-sm font-bold mb-2"
                style={{color: accentColor}}
              >
                Available Upgrades
              </h3>
              <div className="space-y-2">
                {upgrades.map((upgrade) => (
                  <div
                    key={upgrade.name}
                    className={`border-2 p-2 md:p-3 rounded-sm ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-black'
                    }`}
                    style={{
                      boxShadow: isDarkMode
                        ? '3px 3px 0px rgba(51,51,51,1)'
                        : '3px 3px 0px rgba(0,0,0,1)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="text-xl md:text-2xl flex-shrink-0"
                        aria-hidden="true"
                      >
                        {upgrade.icon}
                      </span>
                      <div className="flex-1">
                        <h4
                          className="pixel-font text-xs md:text-sm font-bold"
                          style={{color: upgrade.color}}
                        >
                          {upgrade.name}
                        </h4>
                        <p
                          className="pixel-font text-[10px] md:text-xs mt-1"
                          style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                        >
                          {upgrade.effect}
                        </p>
                        <p
                          className="pixel-font text-[9px] md:text-[10px] mt-1 opacity-70"
                          style={{color: isDarkMode ? '#9ca3af' : '#6b7280'}}
                        >
                          Growth: {upgrade.formula}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pro Tips Section */}
            <section className="mt-4">
              <h3
                className="pixel-font text-sm font-bold mb-2"
                style={{color: accentColor}}
              >
                Pro Tips
              </h3>
              <ul className="space-y-1 pixel-font text-[10px] md:text-xs">
                <li
                  className="flex items-start gap-2"
                  style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                >
                  <span className="flex-shrink-0">•</span>
                  <span>
                    <strong>Click Power</strong> and{' '}
                    <strong>Autoclicker</strong> are your main income sources -
                    upgrade these first
                  </span>
                </li>
                <li
                  className="flex items-start gap-2"
                  style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                >
                  <span className="flex-shrink-0">•</span>
                  <span>
                    <strong>Click Boost</strong> is strong early game but scales
                    linearly - other upgrades outpace it later
                  </span>
                </li>
                <li
                  className="flex items-start gap-2"
                  style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                >
                  <span className="flex-shrink-0">•</span>
                  <span>
                    <strong>Pokedex Bonus</strong> is weak early but scales
                    exponentially - becomes very strong at 50+ Pokemon and high
                    levels
                  </span>
                </li>
                <li
                  className="flex items-start gap-2"
                  style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                >
                  <span className="flex-shrink-0">•</span>
                  <span>
                    <strong>Lucky Power</strong> becomes extremely powerful at
                    high levels - pair with <strong>Lucky Chance</strong> for
                    massive income multipliers
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
        <style>
          {`
            #clicker-help-modal::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      </DialogBody>
    </Dialog>
  );
}
