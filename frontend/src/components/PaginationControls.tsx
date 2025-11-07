import {ArrowLeftIcon, ArrowRightIcon} from '@ui/pixelact';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  isMobile?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  isMobile = false,
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

  if (totalPages <= 1) return null;

  if (isMobile) {
    // Mobile view: Arrows only with page info
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || loading}
          className="py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-12 min-h-12 outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-3 focus-visible:ring-offset-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          aria-label="Previous page"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-12 min-h-12 outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-3 focus-visible:ring-offset-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          aria-label="Next page"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // Desktop view: Previous, Page info, Next
  return (
    <footer className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || loading}
          className="min-w-[120px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-3 focus-visible:ring-offset-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Previous</span>
        </button>
        <span className="pixel-font text-sm whitespace-nowrap">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="min-w-[120px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-3 focus-visible:ring-offset-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
        >
          <span>Next</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}
