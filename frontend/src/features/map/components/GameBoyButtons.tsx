import {Button} from '@ui/pixelact';

interface GameBoyButtonsProps {
  onAButtonClick: () => void;
  onBButtonClick: () => void;
  isAuthenticated: boolean;
  nearbyPokemon: {pokemon: {name: string}} | null;
}

export function GameBoyButtons({
  onAButtonClick,
  onBButtonClick,
  isAuthenticated,
}: GameBoyButtonsProps) {
  return (
    <div className="flex gap-2 items-center -rotate-[20deg] mb-2">
      <div className="flex flex-col items-center">
        <Button
          size="sm"
          onClick={onBButtonClick}
          disabled={!isAuthenticated}
          bgColor="#8B3A62"
          className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
          style={
            {
              borderColor: '#2a2a3e',
              '--custom-inner-border-color': '#2a2a3e',
            } as React.CSSProperties
          }
        >
          B
        </Button>
      </div>
      <div className="flex flex-col items-center -mt-3">
        <Button
          size="sm"
          onClick={onAButtonClick}
          disabled={!isAuthenticated}
          bgColor="#8B3A62"
          className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
          style={
            {
              borderColor: '#2a2a3e',
              '--custom-inner-border-color': '#2a2a3e',
            } as React.CSSProperties
          }
        >
          A
        </Button>
      </div>
    </div>
  );
}
