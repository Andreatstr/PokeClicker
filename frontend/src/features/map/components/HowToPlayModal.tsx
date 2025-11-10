import {Button} from '@ui/pixelact';
import {useEscapeKey} from '@/hooks';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export function HowToPlayModal({
  isOpen,
  onClose,
  isDarkMode = false,
}: HowToPlayModalProps) {
  // Close modal on ESC key press
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[10000]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 p-6 max-w-[600px] w-[90vw] max-h-[60vh] overflow-y-auto pixel-font z-[10001]"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
          borderColor: isDarkMode ? '#333333' : 'black',
          boxShadow: isDarkMode
            ? '12px 12px 0px rgba(51,51,51,1)'
            : '12px 12px 0px rgba(0,0,0,1)',
        }}
        role="dialog"
        aria-labelledby="how-to-play-title"
        aria-modal="true"
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <h2
            id="how-to-play-title"
            className="pixel-font text-xl font-bold"
            style={{color: isDarkMode ? '#facc15' : '#7819e5ff'}}
          >
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition-opacity leading-none"
            aria-label="Close modal"
            style={{color: isDarkMode ? '#ef4444' : '#de1313ff'}}
          >
            ×
          </button>
        </header>

        {/* Content */}
        <article
          className="space-y-4 text-sm leading-relaxed"
          style={{color: isDarkMode ? '#e5e7eb' : '#18181b'}}
        >
          {/* Movement */}
          <section>
            <h3
              className="pixel-font text-base font-bold mb-2"
              style={{color: isDarkMode ? '#facc15' : '#7819e5ff'}}
            >
              Movement
            </h3>
            <ul className="space-y-1 ml-4">
              <li>
                • Use the <strong>joystick</strong> or <strong>WASD</strong>/
                <strong>Arrow keys</strong> to move your character
              </li>
              <li>• Explore the world to find wild Pokémon</li>
              <li>• Walk up to wild Pokémon and start battling</li>
            </ul>
          </section>

          {/* Controls */}
          <section>
            <h3
              className="pixel-font text-base font-bold mb-2"
              style={{color: isDarkMode ? '#facc15' : '#7819e5ff'}}
            >
              Controls
            </h3>
            <ul className="space-y-1 ml-4">
              <li>
                • <strong>Click the screen, press A/B Button</strong> or{' '}
                <strong>A/B Key</strong>: Attack in battle
              </li>
              <li>
                • <strong>Press Battle Button or B Button/Key</strong>: Start
                battle with nearby Pokémon
              </li>
              <li>
                • <strong>ESC Key</strong>: Close modal and fullscreen
              </li>
            </ul>
          </section>

          {/* Wild Pokémon & Battles */}
          <section>
            <h3
              className="pixel-font text-base font-bold mb-2"
              style={{color: isDarkMode ? '#facc15' : '#7819e5ff'}}
            >
              Wild Pokémon & Battles
            </h3>
            <ul className="space-y-1 ml-4">
              <li>• Wild Pokémon appear on the map</li>
              <li>
                • Walk up to them and press <strong>Battle Button</strong> or{' '}
                <strong>B Button/Key</strong> when nearby to start a battle
              </li>
              <li>
                • During battle, click on the screen or{' '}
                <strong>A and B button/key</strong> to attack
              </li>
              <li>• Defeat Pokémon to add them to your Pokédex</li>
              <li>• Your Battle Pokémon (set in Profile) battles for you</li>
            </ul>
          </section>

          {/* Rare Candy */}
          <section>
            <h3
              className="pixel-font text-base font-bold mb-2"
              style={{color: isDarkMode ? '#facc15' : '#7819e5ff'}}
            >
              Rare Candy
            </h3>
            <ul className="space-y-1 ml-4">
              <li>
                • Win battles to earn <strong>Rare Candy</strong>
              </li>
              <li>
                • Use Rare Candy to upgrade your Pokémon stats in the{' '}
                <strong>Pokédex</strong>
              </li>
              <li>• Stronger Pokémon win battles faster</li>
            </ul>
          </section>

          {/* Tips */}
          <section>
            <h3
              className="pixel-font text-base font-bold mb-2"
              style={{color: isDarkMode ? '#facc15' : '#7819e5ff'}}
            >
              Tips
            </h3>
            <ul className="space-y-1 ml-4">
              <li>• Toggle fullscreen for an immersive experience</li>
              <li>
                • Set a strong Pokémon as your battle Pokémon to win battles
                easier
              </li>
            </ul>
          </section>
        </article>

        {/* Footer */}
        <footer className="mt-6 flex justify-end">
          <Button onClick={onClose} size="lg">
            Got it!
          </Button>
        </footer>
      </div>

      {/* Scrollbar styles for modal */}
      <style>
        {`
          [role="dialog"]::-webkit-scrollbar {
            width: 8px;
          }
          [role="dialog"]::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#2a2a2a' : '#e5e5e5'};
          }
          [role="dialog"]::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? '#555555' : '#888888'};
            border-radius: 4px;
          }
          [role="dialog"]::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? '#666666' : '#777777'};
          }
        `}
      </style>
    </>
  );
}
