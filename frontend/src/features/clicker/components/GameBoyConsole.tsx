import {Card, Button} from '@ui/pixelact';
import {formatNumber} from '@/lib/formatNumber';

interface Candy {
  id: number;
  x: number;
  amount: number;
}

interface GameBoyConsoleProps {
  isDarkMode: boolean;
  isAuthenticated: boolean;
  isAnimating: boolean;
  candies: Candy[];
  selectedPokemonId: number | null;
  onClickScreen: () => void;
}

export function GameBoyConsole({
  isDarkMode,
  isAuthenticated,
  isAnimating,
  candies,
  selectedPokemonId,
  onClickScreen,
}: GameBoyConsoleProps) {
  return (
    <Card
      data-onboarding="clicker-area"
      className="border-4 p-8 w-full max-w-md lg:max-w-lg"
      style={{
        backgroundColor: isDarkMode ? '#757474ff' : '#9FA0A0',
        borderColor: isDarkMode ? '#333333' : 'black',
        boxShadow: isDarkMode
          ? '8px 8px 0px 0px rgba(51,51,51,1)'
          : '8px 8px 0px 0px rgba(0,0,0,1)',
      }}
    >
      <div className="flex flex-col items-center">
        {/* Screen Area */}
        <div
          className="rounded-md p-3 mb-3 w-full shadow-inner border-2"
          style={{
            backgroundColor: isDarkMode ? '#1a1a2e' : '#3E3E52',
            borderColor: isDarkMode ? '#0f0f1a' : '#2a2a3e',
          }}
        >
          {/* Screen Label */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full border"
                style={{
                  backgroundColor: isDarkMode ? '#dc2626' : '#dc2626',
                  borderColor: isDarkMode ? '#333333' : 'black',
                }}
              ></div>
              <span
                className="text-[6px] pixel-font tracking-wider"
                style={{color: isDarkMode ? '#d1d5db' : '#d1d5db'}}
              >
                BATTERY
              </span>
            </div>
            <span
              className="text-[7px] pixel-font tracking-wider"
              style={{color: isDarkMode ? '#d1d5db' : '#d1d5db'}}
            >
              DOT MATRIX WITH STEREO SOUND
            </span>
          </div>

          {/* Screen */}
          <div
            className="p-2 shadow-inner border-2"
            style={{
              backgroundColor: isDarkMode ? '#4a4a2a' : '#8a8a4a',
              borderColor: isDarkMode ? '#0f0f1a' : '#1a1a2e',
            }}
          >
            <button
              onClick={onClickScreen}
              className="w-full aspect-[10/9] flex items-end justify-center border-none cursor-pointer p-0 pb-8 focus:outline-none focus:ring-2 focus:ring-yellow-400 relative overflow-hidden"
              aria-label="Click Pokemon to earn rare candy"
              disabled={!isAuthenticated}
              style={{
                backgroundImage: `url('${import.meta.env.BASE_URL}pokemon-bg.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                imageRendering: 'pixelated',
                opacity: !isAuthenticated ? 0.5 : 1,
              }}
            >
              {/* Floating candies */}
              {candies.map((candy) => (
                <div
                  key={candy.id}
                  className="absolute pointer-events-none flex items-center gap-1"
                  style={{
                    left: `${candy.x}%`,
                    bottom: '40%',
                    animation: 'float-up 1s ease-out forwards',
                  }}
                >
                  <span
                    className="pixel-font text-yellow-400 font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{
                      textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                    }}
                  >
                    +{formatNumber(candy.amount)}
                  </span>
                  <img
                    src={`${import.meta.env.BASE_URL}candy.webp`}
                    alt="candy"
                    className="w-8 h-8"
                    style={{imageRendering: 'pixelated'}}
                  />
                </div>
              ))}

              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemonId || 1}.png`}
                alt="Pokemon"
                className={`w-3/5 h-3/5 object-contain transition-all duration-150 ${
                  isAnimating ? 'scale-110 brightness-110' : 'scale-100'
                }`}
                style={{
                  imageRendering: 'pixelated',
                  filter: isAnimating
                    ? 'drop-shadow(0 0 8px rgba(255, 193, 7, 0.8))'
                    : 'none',
                  animation:
                    'idle-bounce 2s ease-in-out infinite, walk-horizontal 4s ease-in-out infinite',
                }}
              />
            </button>
          </div>
        </div>

        {/* Nintendo GAME BOY text */}
        <div className="mb-6 text-center">
          <p
            className="pixel-font text-[10px] tracking-wider mb-0.5"
            style={{color: isDarkMode ? '#000000ff' : '#2a2a3e'}}
          >
            Pretendo
          </p>
          <p
            className="pixel-font text-[8px] font-bold tracking-widest italic"
            style={{color: isDarkMode ? '#000000ff' : '#2a2a3e'}}
          >
            PLAY BOY<span className="text-[6px]">™</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full px-2 mb-4">
          {/* D-Pad */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-5 rounded-sm shadow-md"
                style={{backgroundColor: isDarkMode ? '#0f0f1a' : '#2a2a3e'}}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-5 h-16 rounded-sm shadow-md"
                style={{backgroundColor: isDarkMode ? '#0f0f1a' : '#2a2a3e'}}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-5 h-5 rounded-sm"
                style={{backgroundColor: isDarkMode ? '#000000' : '#1a1a2e'}}
              ></div>
            </div>
          </div>

          {/* A, B Buttons */}
          <div className="flex gap-3 items-center -rotate-[20deg]">
            <div className="flex flex-col items-center">
              <Button
                size="sm"
                onClick={onClickScreen}
                disabled={!isAuthenticated}
                bgColor="#8B3A62"
                className="w-14 h-14 rounded-full border-2 shadow-lg pixel-font text-sm text-white font-bold p-0"
                aria-label="B button"
                isDarkMode={isDarkMode}
                style={
                  {
                    borderColor: '#2a2a3e',
                    '--custom-inner-border-color': '#2a2a3e',
                    color: 'white',
                  } as React.CSSProperties
                }
              >
                B
              </Button>
            </div>
            <div className="flex flex-col items-center -mt-4">
              <Button
                size="sm"
                onClick={onClickScreen}
                disabled={!isAuthenticated}
                bgColor="#8B3A62"
                className="w-14 h-14 rounded-full border-2 shadow-lg pixel-font text-sm text-white font-bold p-0"
                aria-label="A button"
                isDarkMode={isDarkMode}
                style={
                  {
                    borderColor: '#2a2a3e',
                    '--custom-inner-border-color': '#2a2a3e',
                    color: 'white',
                  } as React.CSSProperties
                }
              >
                A
              </Button>
            </div>
          </div>
        </div>

        {/* Start/Select Buttons (visual only) */}
        <div className="flex gap-4 items-center mb-2">
          <div
            className="w-10 h-3 rounded-full shadow-md border-2"
            style={{
              backgroundColor: '#4a4a5e',
              borderColor: '#2a2a3e',
            }}
          />
          <div
            className="w-10 h-3 rounded-full shadow-md border-2"
            style={{
              backgroundColor: '#4a4a5e',
              borderColor: '#2a2a3e',
            }}
          />
        </div>

        {/* Speaker Holes */}
        <div className="flex gap-1 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: isDarkMode ? '#4a4a4a' : '#6a6a6a',
                  }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
