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
}: GameBoyProps) {
  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        window.innerWidth < 768 ||
        'ontouchstart' in window;
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
        className={`bg-[#9FA0A0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2 md:p-6 ${isMobile ? 'w-full max-w-sm' : 'w-auto'}`}
      >
        <div className="flex flex-col items-center">
          {/* Screen Bezel */}
          <div className="bg-[#3E3E52] rounded-md p-2 md:p-3 mb-0.5 md:mb-3 w-full shadow-inner border-2 border-[#2a2a3e]">
            {/* Screen Label */}
            <div className="flex items-center justify-between mb-1 px-1">
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
            <div
              className="mx-auto"
              style={{
                width: '100%',
                maxWidth: `${viewport.width}px`,
                aspectRatio: `${viewport.width} / ${viewport.height}`,
              }}
            >
              {/* Game Viewport Container - this is where the game content goes */}
              {children}
            </div>
          </div>

          {/* Nintendo GAME BOY text */}
          <div className="mb-0.5 md:mb-3 text-center">
            <p className="pixel-font text-[10px] text-[#2a2a3e] tracking-wider mb-0.5">
              Nintendo
            </p>
            <p className="pixel-font text-[8px] text-[#2a2a3e] font-bold tracking-widest italic">
              GAME BOY<span className="text-[6px]">™</span>
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center w-full px-1 mb-0.5 md:mb-2">
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
          <div className="flex gap-3 items-center mb-0.5 md:mb-1">
            <div className="w-9 h-2.5 rounded-full bg-[#4a4a5e] border border-[#2a2a3e] shadow-md"></div>
            <div className="w-9 h-2.5 rounded-full bg-[#4a4a5e] border border-[#2a2a3e] shadow-md"></div>
          </div>

          {/* Speaker Holes */}
          <div className="flex gap-1 mt-0.5 md:mt-2">
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
