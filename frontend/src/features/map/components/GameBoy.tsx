import React, {useState, useEffect} from 'react';
import {Card} from '@ui/pixelact';
import {Joystick} from './Joystick';
import {GameBoyButtons} from './GameBoyButtons';

interface GameBoyProps {
  children: React.ReactNode;
  onDirectionChange: (
    direction: 'up' | 'down' | 'left' | 'right' | null
  ) => void;
  onDirectionStart: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionStop: () => void;
  onAButtonClick: () => void;
  onBButtonClick: () => void;
  isAuthenticated: boolean;
  nearbyPokemon: {pokemon: {name: string}} | null;
  viewport: {width: number; height: number};
  isMapLoading?: boolean;
}

export function GameBoy({
  children,
  onDirectionChange,
  onDirectionStart,
  onDirectionStop,
  onAButtonClick,
  onBButtonClick,
  isAuthenticated,
  nearbyPokemon,
  viewport,
  isMapLoading = false,
}: GameBoyProps) {
  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Prioritize screen width for responsive testing
      // Only check user agent if width suggests mobile
      const isMobileDevice =
        window.innerWidth < 768 &&
        (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
          'ontouchstart' in window);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* GameBoy Console Shell */}
      <Card
        className="bg-[#9FA0A0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-3 mx-auto"
        style={{
          width: isMobile
            ? '100%'
            : `${Math.min(viewport.width + 120, window.innerWidth * 0.9)}px`,
          maxWidth: isMobile ? '384px' : 'none',
        }}
      >
        <div className="flex flex-col items-center">
          {/* Screen Bezel */}
          <div className="bg-[#3E3E52] rounded-md p-3 mb-3 md:p-2 md:mb-1.5 w-full shadow-inner border-2 border-[#2a2a3e]">
            {/* Screen Label */}
            <div className="flex items-center justify-between mb-1 md:mb-0.5 px-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-600 border border-black"></div>
                <span className="text-[6px] pixel-font text-gray-300 tracking-wider">
                  BATTERY
                </span>
              </div>
              <span className="text-[7px] pixel-font text-gray-300 tracking-wider">
                DOT MATRIX WITH STEREO SOUND
              </span>
            </div>

            {/* Screen - contains the game viewport */}
            <section
              data-onboarding="map-canvas"
              className="mx-auto relative w-full overflow-hidden"
              style={{
                maxWidth: `${viewport.width}px`,
                aspectRatio: `${viewport.width} / ${viewport.height}`,
                height: `${viewport.height}px`,
              }}
            >
              {/* Game Viewport Container - this is where the game content goes */}
              {children}

              {/* Loading Overlay */}
              {isMapLoading && (
                <aside
                  className="absolute inset-0 bg-[#0f380f] flex items-center justify-center"
                  style={{zIndex: 9999}}
                  aria-live="polite"
                  aria-busy="true"
                >
                  <article className="text-center pixel-font">
                    <h2 className="text-[#9bbc0f] text-base mb-2 animate-pulse">
                      LOADING MAP...
                    </h2>
                    <p className="text-[#8bac0f] text-xs">
                      Please wait while the world loads
                    </p>
                  </article>
                </aside>
              )}
            </section>
          </div>

          {/* Nintendo GAME BOY text */}
          <div className="mb-3 md:mb-1 text-center">
            <p className="pixel-font text-[10px] text-[#2a2a3e] tracking-wider mb-0.5">
              Nintendo
            </p>
            <p className="pixel-font text-[8px] text-[#2a2a3e] font-bold tracking-widest italic">
              GAME BOY<span className="text-[6px]">™</span>
            </p>
          </div>

          {/* Interactive Controls */}
          <div
            data-onboarding="movement-controls"
            className="flex items-center w-full px-1 mb-2 md:mb-1"
          >
            {/* Joystick - more to the left */}
            <div className="flex-[0.8] flex justify-center">
              <Joystick
                onDirectionChange={onDirectionChange}
                onDirectionStart={onDirectionStart}
                onDirectionStop={onDirectionStop}
                isMobile={isMobile}
              />
            </div>

            {/* Center spacer */}
            <div className="flex-[0.4]"></div>

            {/* A, B Buttons - right side */}
            <div className="flex-[0.8] flex justify-center">
              <GameBoyButtons
                onAButtonClick={onAButtonClick}
                onBButtonClick={onBButtonClick}
                isAuthenticated={isAuthenticated}
                nearbyPokemon={nearbyPokemon}
              />
            </div>
          </div>

          {/* Start/Select Buttons */}
          <div className="flex gap-3 items-center mb-1 md:mb-0.5">
            <div className="w-9 h-2.5 rounded-full bg-[#4a4a5e] border border-[#2a2a3e] shadow-md"></div>
            <div className="w-9 h-2.5 rounded-full bg-[#4a4a5e] border border-[#2a2a3e] shadow-md"></div>
          </div>

          {/* Speaker Holes */}
          <div className="flex gap-1 mt-2 md:mt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="w-1 h-1 rounded-full bg-[#6a6a6a]"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
