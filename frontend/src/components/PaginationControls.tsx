import {ArrowLeftIcon, ArrowRightIcon} from '@ui/pixelact';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  isMobile = false,
  isDarkMode = false,
}: PaginationControlsProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (hasPrevious && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const focusRingColor = isDarkMode ? 'white' : '#0066ff';
  const focusOffsetColor = isDarkMode ? '#1a1a1a' : 'white';

  if (totalPages <= 1) return null;

  if (isMobile) {
    // Mobile view: Arrows only with page info
    return (
      <nav
        className="flex items-center justify-center gap-4 py-4"
        aria-label="Pagination navigation"
      >
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || loading}
          className="py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-12 min-h-12 outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          style={
            {
              '--focus-ring-color': focusRingColor,
              '--focus-offset-color': focusOffsetColor,
            } as React.CSSProperties & {
              '--focus-ring-color': string;
              '--focus-offset-color': string;
            }
          }
          onFocus={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${focusOffsetColor}, 0 0 0 6px ${focusRingColor}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Previous page"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <span
          className="text-sm font-bold"
          aria-current="page"
          aria-label={`Page ${currentPage} of ${totalPages}`}
        >
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-12 min-h-12 outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          style={
            {
              '--focus-ring-color': focusRingColor,
              '--focus-offset-color': focusOffsetColor,
            } as React.CSSProperties & {
              '--focus-ring-color': string;
              '--focus-offset-color': string;
            }
          }
          onFocus={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${focusOffsetColor}, 0 0 0 6px ${focusRingColor}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Next page"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </nav>
    );
  }

  // Desktop view: Previous, Page info, Next
  return (
    <footer className="flex flex-col items-center gap-4 mt-8">
      <nav
        className="flex items-center gap-4"
        aria-label="Pagination navigation"
      >
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || loading}
          className="min-w-[120px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          style={
            {
              '--focus-ring-color': focusRingColor,
              '--focus-offset-color': focusOffsetColor,
            } as React.CSSProperties & {
              '--focus-ring-color': string;
              '--focus-offset-color': string;
            }
          }
          onFocus={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${focusOffsetColor}, 0 0 0 6px ${focusRingColor}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Previous page"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Previous</span>
        </button>
        <span
          className="pixel-font text-sm whitespace-nowrap"
          aria-current="page"
          aria-label={`Page ${currentPage} of ${totalPages}`}
        >
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="min-w-[120px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          style={
            {
              '--focus-ring-color': focusRingColor,
              '--focus-offset-color': focusOffsetColor,
            } as React.CSSProperties & {
              '--focus-ring-color': string;
              '--focus-offset-color': string;
            }
          }
          onFocus={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${focusOffsetColor}, 0 0 0 6px ${focusRingColor}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Next page"
        >
          <span>Next</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </nav>
    </footer>
  );
}
