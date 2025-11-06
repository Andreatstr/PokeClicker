import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {logger} from '@/lib/logger';

interface BackgroundMusicProps {
  isDarkMode?: boolean;
  isButton?: boolean;
}

export function BackgroundMusic({isDarkMode = false}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasStartedRef = useRef(false);
  const shouldAutoplayRef = useRef(false);

  // List of available tracks in public/music
  // Note: Filenames are URL-encoded at runtime to handle spaces/special chars.
  const tracks = useMemo(() => {
    const base = import.meta.env.BASE_URL || '/';
    const files = [
      // mp3
      'background-music.mp3',
      // ogg tracks
      'Bicycle Theme.ogg',
      'Caverns of Mt. Moon.ogg',
      'Celadon City.ogg',
      'Cerulean City.ogg',
      'Cinnabar Island.ogg',
      'Fuchsia City.ogg',
      'Game Corner.ogg',
      'Gym Leader Battle!.ogg',
      'Lavender Town.ogg',
      'Legendary Pokemon Encounter!.ogg',
      'Littleroot Town.ogg',
      'Oldale Town.ogg',
      'Pallet Town.ogg',
      'Petalburg City.ogg',
      'Pokeflute.ogg',
      'Pokemon Center.ogg',
      'Pokemon Gym.ogg',
      'Pokemon Mansion.ogg',
      'Pokemon Research Lab.ogg',
      'Pokemon Tower.ogg',
      'Professor Oak.ogg',
      'Rival Appears.ogg',
      'Route 1.ogg',
      'Route 101.ogg',
      'Route 11.ogg',
      'Route 3.ogg',
      'S.S. Anne.ogg',
      'Silph Co..ogg',
      'Surf Theme.ogg',
      'Team Rocket Challenge!.ogg',
      'Team Rocket Hideout.ogg',
      'Trainer Battle!.ogg',
      'Vermillion City.ogg',
      'Viridian City.ogg',
      'Viridian Forest.ogg',
      'Welcome to the world of Pokemon.ogg',
      'Wild Pokemon Encounter.ogg',
    ];
    return files.map((name) => `${base}music/${encodeURIComponent(name)}`);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const nextTrack = useCallback(() => {
    setCurrentIndex((idx) => (idx + 1) % tracks.length);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    setCurrentIndex((idx) => (idx - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  // Attach event listeners once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack]);

  // Update audio source when currentIndex changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = tracks[currentIndex];
    if (!src) return;
    const wasPlaying = !audio.paused;
    audio.src = src;
    audio.load();
    const shouldPlay = shouldAutoplayRef.current || wasPlaying;
    if (shouldPlay) {
      // reset flag for one-shot autoplay
      shouldAutoplayRef.current = false;
      audio
        .play()
        .then(() => logger.info(`Playing: ${src}`))
        .catch((err) => logger.logError(err, 'PlayingAudio'));
    }
  }, [currentIndex, tracks]);

  // No-op on minimize/expand; keep a single audio element mounted

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          logger.info('Audio paused');
        } else {
          // First play: pick a random starting track and autoplay
          if (!hasStartedRef.current) {
            const randomIndex = Math.floor(Math.random() * tracks.length);
            hasStartedRef.current = true;
            shouldAutoplayRef.current = true;
            setCurrentIndex(randomIndex);
            logger.info(`Starting random track index: ${randomIndex}`);
            return;
          }

          logger.info('Attempting to play audio...');
          logger.info(`Audio source: ${audioRef.current.src}`);
          logger.info(`Audio ready state: ${audioRef.current.readyState}`);
          await audioRef.current.play();
          logger.info('Audio playing');
        }
      } catch (error) {
        logger.logError(error, 'PlayingAudio');
      }
    }
  };

  const increaseVolume = () => {
    setVolume((prev) => Math.min(prev + 0.1, 1));
  };

  const decreaseVolume = () => {
    setVolume((prev) => Math.max(prev - 0.1, 0));
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  return (
    <>
      {/* Persisted audio element to prevent resets on toggle */}
      <audio ref={audioRef} preload="metadata" />
      {isMinimized ? (
        <div
          data-onboarding="music-player"
          className="fixed bottom-4 left-4 w-12 h-12 lg:w-auto lg:h-auto flex items-center justify-center p-2 lg:p-3 border-4 border-gray-300 dark:border-gray-600 rounded lg:rounded z-50"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            boxShadow: isDarkMode
              ? '8px 8px 0px 0px rgba(55,65,81,1)'
              : '8px 8px 0px 0px rgba(187,183,178,1)',
          }}
        >
          <button
            onClick={toggleMinimize}
            className="relative w-8 h-8 hover:opacity-70 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-4"
            aria-label="Expand music controls"
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                d="M19 4H5v2H3v14h7v-8H5V6h14v6h-5v8h7V6h-2V4zm-3 10h3v4h-3v-4zm-8 0v4H5v-4h3z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div
          data-onboarding="music-player"
          className="fixed bottom-4 left-4 lg:bottom-4 lg:left-4 flex items-center gap-2 p-3 border-4 border-gray-300 dark:border-gray-600 rounded z-50"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            boxShadow: isDarkMode
              ? '8px 8px 0px 0px rgba(55,65,81,1)'
              : '8px 8px 0px 0px rgba(187,183,178,1)',
          }}
        >
          <button
            onClick={prevTrack}
            className="w-8 h-8 hover:opacity-70 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2"
            aria-label="Previous song"
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                d="M6 4h2v16H6V4zm12 0h-2v2h-2v3h-2v2h-2v2h2v3h2v2h2v2h2V4z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 hover:opacity-70 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              {isPlaying ? (
                <path d="M10 4H5v16h5V4zm9 0h-5v16h5V4z" fill="currentColor" />
              ) : (
                <path
                  d="M10 20H8V4h2v2h2v3h2v2h2v2h-2v2h-2v3h-2v2z"
                  fill="currentColor"
                />
              )}
            </svg>
          </button>

          <button
            onClick={nextTrack}
            className="w-8 h-8 hover:opacity-70 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2"
            aria-label="Next song"
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                d="M6 4h2v2h2v2h2v2h2v4h-2v2h-2v2H8v2H6V4zm12 0h-2v16h2V4z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            onClick={decreaseVolume}
            disabled={volume === 0}
            className="w-7 h-7 hover:opacity-70 disabled:opacity-30 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2"
            aria-label="Decrease volume"
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                d="M12 2h-2v2H8v2H6v2H2v8h4v2h2v2h2v2h2V2zM8 18v-2H6v-2H4v-4h2V8h2V6h2v12H8zm14-7h-8v2h8v-2z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            onClick={increaseVolume}
            disabled={volume === 1}
            className="w-7 h-7 hover:opacity-70 disabled:opacity-30 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2"
            aria-label="Increase volume"
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                d="M10 2h2v20h-2v-2H8v-2h2V6H8V4h2V2zM6 8V6h2v2H6zm0 8H2V8h4v2H4v4h2v2zm0 0v2h2v-2H6zm13-5h3v2h-3v3h-2v-3h-3v-2h3V8h2v3z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="w-12 h-2 bg-foreground/20 relative rounded">
            <div
              className="absolute top-0 left-0 h-full bg-foreground transition-all"
              style={{width: `${volume * 100}%`}}
            />
          </div>

          <button
            onClick={toggleMinimize}
            className="w-7 h-7 hover:opacity-70 transition-opacity border-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2"
            aria-label="Minimize music controls"
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path fill="currentColor" d="M4 11h16v2H4z" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
