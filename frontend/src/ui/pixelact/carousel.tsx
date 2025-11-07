import * as React from 'react';
import {cn} from '@/lib/utils';
import {ArrowLeftIcon, ArrowRightIcon} from './icons';

interface CarouselContextValue {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  itemsCount: number;
  setItemsCount: (count: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  initialIndex?: number;
}

export function Carousel({
  children,
  className,
  initialIndex = 0,
  ...props
}: CarouselProps) {
  // Use a function initializer to ensure initial state is set correctly
  const [currentIndex, setCurrentIndex] = React.useState(() => initialIndex);
  const [itemsCount, setItemsCount] = React.useState(0);
  const prevInitialIndexRef = React.useRef(initialIndex);

  // Update currentIndex when initialIndex changes (e.g., when modal opens with different Pokemon)
  React.useEffect(() => {
    if (prevInitialIndexRef.current !== initialIndex) {
      setCurrentIndex(initialIndex);
      prevInitialIndexRef.current = initialIndex;
    }
  }, [initialIndex]);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < itemsCount - 1;

  const scrollPrev = React.useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const scrollNext = React.useCallback(() => {
    setCurrentIndex((prev) => Math.min(itemsCount - 1, prev + 1));
  }, [itemsCount]);

  // Keyboard navigation is handled by the carousel buttons themselves
  // We don't want global arrow key listeners that interfere with focus management

  const value = React.useMemo(
    () => ({
      currentIndex,
      setCurrentIndex,
      itemsCount,
      setItemsCount,
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
    }),
    [
      currentIndex,
      itemsCount,
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
    ]
  );

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn('relative', className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CarouselContent({
  children,
  className,
  ...props
}: CarouselContentProps) {
  const {
    currentIndex,
    setItemsCount,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  } = useCarousel();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Count items and update context
  React.useEffect(() => {
    const count = React.Children.count(children);
    setItemsCount(count);
  }, [children, setItemsCount]);

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canScrollNext) {
      scrollNext();
    }
    if (isRightSwipe && canScrollPrev) {
      scrollPrev();
    }
  };

  return (
    <div
      className="overflow-hidden"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn(
          'flex transition-transform duration-300 ease-in-out',
          className
        )}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CarouselItem({
  children,
  className,
  ...props
}: CarouselItemProps) {
  return (
    <div className={cn('min-w-full flex-shrink-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CarouselPrevious({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const {canScrollPrev, scrollPrev} = useCarousel();

  return (
    <button
      className={cn(
        'absolute left-2 top-1/2 -translate-y-1/2 z-10',
        'w-8 h-8 md:w-10 md:h-10',
        'bg-white dark:bg-gray-800',
        'border-2 border-black',
        'shadow-[2px_2px_0px_rgba(0,0,0,1)]',
        'hover:translate-y-[-50%] hover:translate-x-[-2px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]',
        'active:translate-y-[-50%] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-100',
        'font-bold text-lg',
        'flex items-center justify-center',
        className
      )}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous"
      {...props}
    >
      <ArrowLeftIcon size={16} className="block mx-auto" />
    </button>
  );
}

export function CarouselNext({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const {canScrollNext, scrollNext} = useCarousel();

  return (
    <button
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2 z-10',
        'w-8 h-8 md:w-10 md:h-10',
        'bg-white dark:bg-gray-800',
        'border-2 border-black',
        'shadow-[2px_2px_0px_rgba(0,0,0,1)]',
        'hover:translate-y-[-50%] hover:translate-x-[2px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]',
        'active:translate-y-[-50%] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-100',
        'font-bold text-lg',
        'flex items-center justify-center',
        className
      )}
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next"
      {...props}
    >
      <ArrowRightIcon size={16} className="block mx-auto" />
    </button>
  );
}
