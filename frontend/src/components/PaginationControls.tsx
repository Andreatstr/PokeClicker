interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  isMobile?: boolean;
}

const PixelArrowRight = ({ className = '' }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="currentColor"
      d="M23 11v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1H1v-4h15V9h-1V8h-1V7h-1V6h-1V5h-1V4h-1V3h1V2h1V1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1z"
    />
  </svg>
);

const PixelArrowLeft = ({ className = '' }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    style={{ transform: 'scaleX(-1)' }}
  >
    <path
      fill="currentColor"
      d="M23 11v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1H1v-4h15V9h-1V8h-1V7h-1V6h-1V5h-1V4h-1V3h1V2h1V1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1z"
    />
  </svg>
);

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
          className="py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Previous page"
        >
          <PixelArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Next page"
        >
          <PixelArrowRight className="w-6 h-6" />
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
          className="min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <PixelArrowLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>
        <span className="pixel-font text-sm whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Next</span>
          <PixelArrowRight className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}
