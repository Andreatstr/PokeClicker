import React, {useState, useEffect, useRef} from 'react';
import {Card} from '@ui/pixelact';
import {Joystick} from './Joystick';
import {GameBoyButtons} from './GameBoyButtons';
import {useMobileDetection} from '@/hooks';

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
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  isMapLoading?: boolean;
  isDarkMode?: boolean;
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
  onToggleFullscreen,
  isFullscreen: isFullscreenProp,
  isMapLoading = false,
  isDarkMode = false,
}: GameBoyProps) {
  // Unified mobile detection
  const isMobile = useMobileDetection(768);
  const [isFullscreenInternal, setIsFullscreenInternal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use prop if provided, otherwise use internal state
  const isFullscreen = isFullscreenProp ?? isFullscreenInternal;

  useEffect(() => {
    // useMobileDetection handles resize – no work needed here
  }, []);

  // Handle fullscreen changes (only if not using prop)
  useEffect(() => {
    if (onToggleFullscreen) return; // Skip if parent is handling fullscreen

    const handleFullscreenChange = () => {
      setIsFullscreenInternal(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onToggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center ${
        isFullscreen
          ? 'fixed inset-0 w-full h-full items-center justify-center bg-[#9FA0A0] z-[9999] p-0 m-0'
          : ''
      }`}
      style={
        isFullscreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }
          : undefined
      }
    >
      {/* GameBoy Console Shell */}
      <Card
        className={`${
          isFullscreen
            ? 'w-full h-full flex flex-col border-0 shadow-none'
            : 'p-4 md:p-3 border-4 mx-auto'
        }`}
        style={
          isFullscreen
            ? {
                backgroundColor: isDarkMode ? '#757474ff' : '#9FA0A0',
                width: '100%',
                height: '100%',
                maxWidth: 'none',
                margin: 0,
                padding: '12px',
              }
            : {
                backgroundColor: isDarkMode ? '#757474ff' : '#9FA0A0',
                borderColor: isDarkMode ? '#333333' : 'black',
                boxShadow: isDarkMode
                  ? '8px 8px 0px 0px rgba(51,51,51,1)'
                  : '8px 8px 0px 0px rgba(0,0,0,1)',
                width: isMobile
                  ? '100%'
                  : `${Math.min(viewport.width + 120, window.innerWidth * 0.9)}px`,
                maxWidth: isMobile ? '384px' : 'none',
              }
        }
      >
        <div
          className={`flex flex-col items-center ${isFullscreen ? 'flex-1 justify-center' : ''}`}
        >
          {/* Screen Bezel */}
          <div
            className={`rounded-md shadow-inner border-2 ${
              isFullscreen
                ? isMobile
                  ? 'flex flex-col p-2 mb-2 w-full'
                  : 'flex flex-col p-2 mb-2 w-[calc(100%-1rem)] mx-2'
                : 'w-full p-3 mb-3 md:p-2 md:mb-1.5'
            }`}
            style={
              isFullscreen
                ? {
                    backgroundColor: isDarkMode ? '#1a1a2e' : '#3E3E52',
                    borderColor: isDarkMode ? '#0f0f1a' : '#2a2a3e',
                    height: isMobile ? 'min(60vh, calc(100vh - 280px))' : '75%',
                  }
                : {
                    backgroundColor: isDarkMode ? '#1a1a2e' : '#3E3E52',
                    borderColor: isDarkMode ? '#0f0f1a' : '#2a2a3e',
                  }
            }
          >
            {/* Screen Label - hide in fullscreen on mobile */}
            <div
              className={`flex items-center justify-between px-1 ${
                isFullscreen ? 'hidden' : 'mb-1 md:mb-0.5'
              }`}
            >
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
              className={`mx-auto relative overflow-hidden ${isFullscreen ? 'flex-1 w-full' : 'w-full'}`}
              style={
                isFullscreen
                  ? {width: '100%', height: '100%'}
                  : {
                      width: '100%',
                      maxWidth: `${viewport.width}px`,
                      aspectRatio: `${viewport.width} / ${viewport.height}`,
                      height: `${viewport.height}px`,
                    }
              }
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

          {/* Pretendo PLAY BOY text */}
          <div
            className={
              isFullscreen ? 'mb-2 text-center' : 'mb-3 md:mb-1 text-center'
            }
          >
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

          {/* Interactive Controls */}
          <div
            data-onboarding="movement-controls"
            className={`flex items-center w-full ${
              isFullscreen
                ? 'mb-4 justify-center gap-8 px-8'
                : 'mb-2 md:mb-1 px-1'
            }`}
            style={isFullscreen ? {transform: 'scale(1.5)'} : {}}
          >
            {/* Joystick */}
            <div
              className={
                isFullscreen
                  ? 'flex-shrink-0'
                  : 'flex-[0.8] flex justify-center'
              }
            >
              <Joystick
                onDirectionChange={onDirectionChange}
                onDirectionStart={onDirectionStart}
                onDirectionStop={onDirectionStop}
                isMobile={isMobile}
              />
            </div>

            {/* Center spacer - only in normal mode */}
            {!isFullscreen && <div className="flex-[0.4]"></div>}

            {/* A, B Buttons */}
            <div
              className={
                isFullscreen
                  ? 'flex-shrink-0'
                  : 'flex-[0.8] flex justify-center'
              }
            >
              <GameBoyButtons
                onAButtonClick={onAButtonClick}
                onBButtonClick={onBButtonClick}
                isAuthenticated={isAuthenticated}
                nearbyPokemon={nearbyPokemon}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Speaker Holes */}
          <div
            className={
              isFullscreen
                ? isMobile
                  ? 'flex gap-1 mt-4 mb-8'
                  : 'flex gap-1 mt-2'
                : 'flex gap-1 mt-2 md:mt-1'
            }
          >
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
