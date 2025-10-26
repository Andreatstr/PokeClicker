import {useState, useRef, useCallback, useEffect} from 'react';

interface JoystickProps {
  onDirectionChange: (
    direction: 'up' | 'down' | 'left' | 'right' | null
  ) => void;
  onDirectionStart: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionStop: () => void;
  isMobile?: boolean;
}

export function Joystick({
  onDirectionChange,
  onDirectionStart,
  onDirectionStop,
  isMobile = false,
}: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<
    'up' | 'down' | 'left' | 'right' | null
  >(null);
  const [knobPosition, setKnobPosition] = useState({x: 0, y: 0});
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const lastCallTime = useRef<number>(0);

  const getDirection = useCallback(
    (x: number, y: number, centerX: number, centerY: number) => {
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only register direction if moved far enough from center
      if (distance < 10) return null;

      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Convert angle to direction
      if (angle >= -45 && angle < 45) return 'right';
      if (angle >= 45 && angle < 135) return 'down';
      if (angle >= 135 || angle < -135) return 'left';
      if (angle >= -135 && angle < -45) return 'up';

      return null;
    },
    []
  );

  const getKnobPosition = useCallback(
    (x: number, y: number, centerX: number, centerY: number) => {
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Limit knob movement to joystick radius (about 20px from center)
      const maxDistance = 20;
      const limitedDistance = Math.min(distance, maxDistance);

      if (distance === 0) return {x: 0, y: 0};

      const ratio = limitedDistance / distance;
      return {
        x: deltaX * ratio,
        y: deltaY * ratio,
      };
    },
    []
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickRef.current) return;

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const knobPos = getKnobPosition(clientX, clientY, centerX, centerY);
      setKnobPosition(knobPos);

      const direction = getDirection(clientX, clientY, centerX, centerY);

      setIsDragging(true);
      if (direction) {
        setCurrentDirection(direction);
        onDirectionStart(direction);
      }
    },
    [getDirection, getKnobPosition, onDirectionStart]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !joystickRef.current) return;

      const now = Date.now();
      const throttleDelay = isMobile ? 50 : 16; // Throttle more on mobile

      if (now - lastCallTime.current < throttleDelay) return;
      lastCallTime.current = now;

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const knobPos = getKnobPosition(clientX, clientY, centerX, centerY);
      setKnobPosition(knobPos);

      const direction = getDirection(clientX, clientY, centerX, centerY);

      // Only call onDirectionChange if direction actually changed
      if (direction !== currentDirection) {
        setCurrentDirection(direction);
        onDirectionChange(direction);
      }
    },
    [
      isDragging,
      currentDirection,
      getDirection,
      getKnobPosition,
      onDirectionChange,
      isMobile,
    ]
  );

  const handleEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setCurrentDirection(null);
      setKnobPosition({x: 0, y: 0});
      onDirectionStop();
    }
  }, [isDragging, onDirectionStop]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleEnd();
    },
    [handleEnd]
  );

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-32 h-32">
      {/* Circular Joystick Base */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-[#2a2a3e] rounded-full shadow-md border-2 border-[#1a1a2e]"></div>
      </div>

      {/* Interactive Joystick Area - Much bigger hitbox */}
      <div
        ref={joystickRef}
        className="absolute inset-0 cursor-pointer rounded-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{touchAction: 'none'}}
      >
        {/* Draggable Knob - Bigger and Red for mobile */}
        <div
          ref={knobRef}
          className="absolute w-8 h-8 bg-red-500 rounded-full border-2 border-red-700 shadow-lg transition-all duration-100"
          style={{
            left: `calc(50% + ${knobPosition.x}px - 16px)`,
            top: `calc(50% + ${knobPosition.y}px - 16px)`,
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      </div>
    </div>
  );
}
