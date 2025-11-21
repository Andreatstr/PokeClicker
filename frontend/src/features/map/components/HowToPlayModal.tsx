import {useEffect, useRef} from 'react';
import {Button, Dialog, DialogBody} from '@/ui/pixelact';

const DEMO_BUTTON_STYLE = {pointerEvents: 'none' as const};

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isMobile: boolean;
}

export function HowToPlayModal({
  isOpen,
  onClose,
  isDarkMode,
  isMobile,
}: HowToPlayModalProps) {
  const accentColor = isDarkMode ? '#60a5fa' : '#1e40af';
  const bodyTextColor = isDarkMode ? '#e5e7eb' : '#111827';
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus to dialog when opened
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Small delay to ensure the dialog is fully rendered
      const timeoutId = setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody aria-labelledby="world-guide-title">
        {/* Mobile drawer handle */}
        <header className="md:hidden flex justify-center mb-2">
          <div
            className="w-12 h-1 bg-gray-400 rounded-full"
            aria-hidden="true"
          ></div>
        </header>

        <div
          id="world-guide-modal"
          ref={dialogRef}
          tabIndex={-1}
          className={`pixel-font border-4 p-3 md:p-4 relative backdrop-blur-md w-full ${
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
            outline: 'none', // Remove default focus outline
          }}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 z-10 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center cursor-pointer justify-center text-sm bg-red-600 text-white font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
            onClick={onClose}
            aria-label="Exit"
          >
            X
          </button>

          {/* Header */}
          <header className="mb-2 md:mb-3">
            <h2
              id="world-guide-title"
              className="pixel-font text-base font-bold"
              style={{color: accentColor}}
            >
              How to play
            </h2>
          </header>
          <div className="px-4 py-2 md:px-6 md:py-3">
            {/* Battle flow (inline sprite, Battle! button, candy) */}
            <div className="mx-auto mt-2 md:mt-3" style={{maxWidth: '100%'}}>
              <div className="flex flex-col md:flex-row md:items-stretch md:justify-center gap-3 md:gap-4">
                {/* Step 1: Find Pokemon */}
                <div
                  className={`flex flex-col items-start gap-2 p-2 md:p-3 md:min-w-[200px] border-2 rounded-sm shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-white border-black'
                  }`}
                >
                  <span
                    className="pixel-font text-xs md:text-[10px] text-left"
                    style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                  >
                    <span className="font-bold">1.</span> Find a pokemon
                  </span>
                  <div
                    className="relative flex items-center justify-center self-center"
                    style={{
                      width: 96,
                      height: 96,
                    }}
                  >
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
                      alt="Wild Pokémon"
                      className="image-pixelated relative z-10"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                        filter:
                          'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)) drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))',
                      }}
                    />
                  </div>
                </div>

                {/* Step 2: Press Battle */}
                <div
                  className={`flex flex-col items-start gap-6 p-2 md:p-3 md:min-w-[200px] border-2 rounded-sm shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-white border-black'
                  }`}
                >
                  <span
                    className="pixel-font text-xs md:text-[10px] text-left"
                    style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                  >
                    <span className="font-bold">2.</span> Press Battle!
                  </span>
                  {/* Demo button with hover effects for illustration */}
                  <button
                    type="button"
                    className={`text-white px-4 py-2 md:px-6 md:py-3 pixel-font text-sm md:text-base border-2 rounded focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 self-center ${
                      isDarkMode ? 'border-gray-600' : 'border-black'
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? '#b91c1c' : '#dc2626',
                      boxShadow: isDarkMode
                        ? '4px 4px 0px rgba(51,51,51,1)'
                        : '4px 4px 0px rgba(0,0,0,1)',
                      transform: 'translate(0, 0)',
                      transition: 'all 0.15s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      if (isMobile) return;
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? '6px 6px 0px rgba(51,51,51,1)'
                        : '6px 6px 0px rgba(0,0,0,1)';
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? '#991b1b'
                        : '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      if (isMobile) return;
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? '4px 4px 0px rgba(51,51,51,1)'
                        : '4px 4px 0px rgba(0,0,0,1)';
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? '#b91c1c'
                        : '#dc2626';
                    }}
                    onClick={(e) => e.preventDefault()}
                    aria-label="Battle button - demo only"
                    tabIndex={-1}
                  >
                    Battle!
                  </button>
                </div>

                {/* Step 3: Win to Earn Candy */}
                <div
                  className={`flex flex-col items-start gap-2 p-2 md:p-3 md:min-w-[200px] border-2 rounded-sm shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-white border-black'
                  }`}
                >
                  <span
                    className="pixel-font text-xs md:text-[10px] text-left"
                    style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                  >
                    <span className="font-bold">3.</span> Win to gain candy and
                    new pokemon
                  </span>
                  <div className="flex items-center gap-2 self-center">
                    <div className="relative flex items-center justify-center">
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                        alt="Candy"
                        className="relative z-10"
                        style={{
                          width: 58,
                          height: 58,
                          imageRendering: 'pixelated',
                          filter:
                            'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.4))',
                        }}
                      />
                    </div>
                    <span
                      className="pixel-font text-lg font-bold"
                      style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                    >
                      +
                    </span>
                    <div className="relative flex items-center justify-center">
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
                        alt="New Pokemon"
                        className="relative z-10"
                        style={{
                          width: 96,
                          height: 96,
                          imageRendering: 'pixelated',
                          filter:
                            'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)) drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional guidance */}
            <div className="mt-4 md:mt-5 space-y-3">
              <section>
                <h3
                  className="pixel-font text-sm font-bold mb-1.5"
                  style={{color: accentColor}}
                >
                  Movement
                </h3>
                <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                  {/* Arrow keys layout - hidden on mobile */}
                  {!isMobile && (
                    <>
                      <div
                        className="flex flex-col items-center gap-1"
                        aria-label="Arrow keys"
                      >
                        <div className="flex justify-center">
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            ▲
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            ◀
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            ▼
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            ▶
                          </span>
                        </div>
                        <span
                          className="pixel-font text-[10px] mt-1 h-4 flex items-center justify-center"
                          style={{
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                          }}
                        >
                          Arrow Keys
                        </span>
                      </div>

                      <span
                        className="pixel-font text-xs opacity-60"
                        style={{
                          color: isDarkMode ? '#e5e7eb' : '#111827',
                        }}
                      >
                        or
                      </span>

                      {/* WASD layout - hidden on mobile */}
                      <div
                        className="flex flex-col items-center gap-1"
                        aria-label="WASD keys"
                      >
                        <div className="flex justify-center">
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            W
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            A
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            S
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            D
                          </span>
                        </div>
                        <span
                          className="pixel-font text-[10px] mt-1 h-4 flex items-center justify-center"
                          style={{
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                          }}
                        >
                          WASD
                        </span>
                      </div>
                      <span
                        className="pixel-font text-xs opacity-60"
                        style={{
                          color: isDarkMode ? '#e5e7eb' : '#111827',
                        }}
                      >
                        or
                      </span>
                    </>
                  )}
                  {/* Joystick preview (non-interactive) */}
                  <div
                    className="flex flex-col items-center gap-1"
                    style={{pointerEvents: 'none'}}
                    aria-label="Joystick preview"
                  >
                    <div
                      style={{transform: 'scale(0.7)', height: '70px'}}
                      className="relative w-[100px] h-[100px]"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#2a2a3e] rounded-full shadow-md border-2 border-[#1a1a2e]"></div>
                      </div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-700 shadow-lg" />
                    </div>
                    <span
                      className="pixel-font text-[10px] h-4 flex items-center justify-center w-full"
                      style={{
                        color: isDarkMode ? '#e5e7eb' : '#111827',
                      }}
                    >
                      Joystick
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3
                  className="pixel-font text-sm font-bold mb-1.5"
                  style={{color: accentColor}}
                >
                  Controls
                </h3>
                <div className="flex items-start justify-center gap-4 md:gap-12 flex-wrap">
                  <div className="flex flex-col gap-2 items-center">
                    <span
                      className="pixel-font text-[11px] font-bold text-center"
                      style={{color: accentColor}}
                    >
                      Start battle
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        bgColor="#8B3A62"
                        className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
                        aria-label="B button - demo only"
                        tabIndex={-1}
                        style={DEMO_BUTTON_STYLE}
                      >
                        B
                      </Button>
                      {!isMobile && (
                        <span
                          className="pixel-font text-xs border-2 px-2 py-1"
                          style={{
                            background: isDarkMode ? '#f9fafb' : '#ffffff',
                            color: '#111827',
                            borderColor: 'black',
                            boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                          }}
                        >
                          B
                        </span>
                      )}
                      {/* Non-interactive demo button */}
                      <div
                        role="presentation"
                        aria-hidden="true"
                        className={`text-white px-3 py-1.5 pixel-font text-xs border-2 rounded ${
                          isDarkMode ? 'border-gray-600' : 'border-black'
                        }`}
                        style={{
                          backgroundColor: isDarkMode ? '#b91c1c' : '#dc2626',
                          boxShadow: isDarkMode
                            ? '2px 2px 0px rgba(51,51,51,1)'
                            : '2px 2px 0px rgba(0,0,0,1)',
                        }}
                      >
                        Battle!
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <span
                      className="pixel-font text-[11px] font-bold text-center"
                      style={{color: accentColor}}
                    >
                      Attack
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        bgColor="#8B3A62"
                        className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
                        aria-label="A button - demo only"
                        tabIndex={-1}
                        style={DEMO_BUTTON_STYLE}
                      >
                        A
                      </Button>
                      <Button
                        size="sm"
                        bgColor="#8B3A62"
                        className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
                        aria-label="B button - demo only"
                        tabIndex={-1}
                        style={DEMO_BUTTON_STYLE}
                      >
                        B
                      </Button>
                      {!isMobile && (
                        <>
                          <span
                            className="pixel-font text-xs border-2 px-2 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            A
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-2 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            B
                          </span>
                        </>
                      )}
                      <img
                        src={`${import.meta.env.BASE_URL}pixilated-hand.webp`}
                        alt="Touch or tap to attack"
                        className="w-8 h-8"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <span
                      className="pixel-font text-[11px] font-bold text-center"
                      style={{color: accentColor}}
                    >
                      Abilities
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      {!isMobile && (
                        <>
                          <span
                            className="pixel-font text-xs border-2 px-2 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            S
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-2 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            D
                          </span>
                        </>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        {/* Sp.Atk demo button */}
                        <button
                          type="button"
                          className={`relative px-1 py-0.5 md:px-3 md:py-2 pixel-font text-[9px] md:text-xs border-2 rounded shadow-[2px_2px_0_rgba(0,0,0,1)] overflow-hidden ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
                            isDarkMode
                              ? 'bg-gray-800 text-white border-gray-600'
                              : 'bg-gray-200 text-black border-black'
                          }`}
                          style={{pointerEvents: 'none'}}
                          aria-label="Special attack demo button"
                          tabIndex={-1}
                        >
                          <div
                            className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
                              isDarkMode
                                ? 'bg-gradient-to-t from-purple-900 via-purple-600 to-purple-400'
                                : 'bg-gradient-to-t from-purple-800 via-purple-500 to-purple-300'
                            } shadow-lg shadow-purple-500/50`}
                            style={{height: '100%'}}
                            aria-hidden="true"
                          />
                          <span
                            className={`relative z-10 font-bold transition-colors duration-300 ${
                              isDarkMode
                                ? 'text-white drop-shadow-lg'
                                : 'text-black drop-shadow-lg'
                            }`}
                          >
                            <span className="md:hidden">Sp.Atk</span>
                            <span className="hidden md:inline">
                              Special Attack
                            </span>
                          </span>
                        </button>
                        {/* Sp.Def demo button */}
                        <button
                          type="button"
                          className={`relative px-1 py-0.5 md:px-3 md:py-2 pixel-font text-[9px] md:text-xs border-2 rounded shadow-[2px_2px_0_rgba(0,0,0,1)] overflow-hidden ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
                            isDarkMode
                              ? 'bg-gray-800 text-white border-gray-600'
                              : 'bg-gray-200 text-black border-black'
                          }`}
                          style={{pointerEvents: 'none'}}
                          aria-label="Special defense demo button"
                          tabIndex={-1}
                        >
                          <div
                            className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
                              isDarkMode
                                ? 'bg-gradient-to-t from-blue-900 via-blue-600 to-blue-400'
                                : 'bg-gradient-to-t from-blue-800 via-blue-500 to-blue-300'
                            } shadow-lg shadow-blue-500/50`}
                            style={{height: '100%'}}
                            aria-hidden="true"
                          />
                          <span
                            className={`relative z-10 font-bold transition-colors duration-300 ${
                              isDarkMode
                                ? 'text-white drop-shadow-lg'
                                : 'text-black drop-shadow-lg'
                            }`}
                          >
                            <span className="md:hidden">Sp.Def</span>
                            <span className="hidden md:inline">
                              Special Defense
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <span
                      className="pixel-font text-[11px] font-bold text-center"
                      style={{color: accentColor}}
                    >
                      Battle results
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      {!isMobile && (
                        <>
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            ◀
                          </span>
                          <span
                            className="pixel-font text-xs border-2 px-3 py-1"
                            style={{
                              background: isDarkMode ? '#f9fafb' : '#ffffff',
                              color: '#111827',
                              borderColor: 'black',
                              boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                            }}
                          >
                            ▶
                          </span>
                        </>
                      )}
                      <span
                        className="pixel-font text-[10px]"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        {isMobile ? 'Tap buttons to select' : 'to switch'}
                      </span>
                    </div>
                    {!isMobile && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span
                          className="pixel-font text-xs border-2 px-2 py-1"
                          style={{
                            background: isDarkMode ? '#f9fafb' : '#ffffff',
                            color: '#111827',
                            borderColor: 'black',
                            boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                          }}
                        >
                          Space
                        </span>
                        <span
                          className="pixel-font text-[10px]"
                          style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                        >
                          to confirm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3
                  className="pixel-font text-sm font-bold mt-4 md:mt-5 mb-1.5"
                  style={{color: accentColor}}
                >
                  Quick Tips
                </h3>
                <ul
                  className="pixel-font text-[11px] leading-relaxed space-y-1 ml-4 list-none"
                  style={{color: bodyTextColor}}
                >
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Toggle fullscreen for an immersive experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Pick your Pokémon in wisely to beat hard Pokémon
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Use the abilities to survive battles and beat hard Pokémon
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            {/* Got it! Button */}
            <div className="mt-4 md:mt-5 flex justify-end">
              <button
                className="pixel-font text-xs font-bold cursor-pointer border-2 px-4 min-h-[44px] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                onClick={onClose}
                style={{
                  backgroundColor: '#11873cff',
                  color: 'white',
                  borderColor: 'black',
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
