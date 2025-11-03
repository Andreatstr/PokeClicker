import {useEffect, useRef, useState} from 'react';
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          logger.info('Audio paused');
        } else {
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

  if (isMinimized) {
    return (
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
        <audio ref={audioRef} loop>
          <source
            src={`${import.meta.env.BASE_URL}music/background-music.mp3`}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>

        <button
          onClick={toggleMinimize}
          className="w-8 h-8 hover:opacity-70 transition-opacity border-0 outline-none focus:outline-none"
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
    );
  }

  return (
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
      <audio ref={audioRef} loop>
        <source
          src={`${import.meta.env.BASE_URL}music/background-music.mp3`}
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>

      <button
        onClick={togglePlay}
        className="w-8 h-8 hover:opacity-70 transition-opacity border-0 outline-none focus:outline-none"
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
        onClick={decreaseVolume}
        disabled={volume === 0}
        className="w-7 h-7 hover:opacity-70 disabled:opacity-30 transition-opacity border-0 outline-none focus:outline-none"
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
        className="w-7 h-7 hover:opacity-70 disabled:opacity-30 transition-opacity border-0 outline-none focus:outline-none"
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
        className="w-7 h-7 hover:opacity-70 transition-opacity border-0 outline-none focus:outline-none"
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
  );
}
