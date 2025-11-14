import {ArrowLeftIcon, ArrowRightIcon} from '@ui/pixelact';
import {ChevronsLeft, ChevronsRight} from 'lucide-react';
import {useMemo} from 'react';

type PageItem = number | 'ellipsis';

function generatePageNumbers(
  currentPage: number,
  totalPages: number
): PageItem[] {
  // If 9 or fewer pages, show all
  if (totalPages <= 9) {
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  const pages: PageItem[] = [];

  // Near the start (pages 1-4)
  if (currentPage <= 4) {
    for (let i = 1; i <= 7; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
  }
  // Near the end (last 4 pages)
  else if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = totalPages - 6; i <= totalPages; i++) {
      pages.push(i);
    }
  }
  // In the middle - show current ± 2 pages
  else {
    pages.push(1);
    pages.push('ellipsis');
    pages.push(currentPage - 2);
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push(currentPage + 2);
    pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
}

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
  const hasFirst = currentPage !== 1;
  const hasLast = currentPage !== totalPages;

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasPrevious && !loading) {
      onPageChange(currentPage - 1);
      e.currentTarget.blur();
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasNext && !loading) {
      onPageChange(currentPage + 1);
      e.currentTarget.blur();
    }
  };

  const handleFirst = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasFirst && !loading) {
      onPageChange(1);
      e.currentTarget.blur();
    }
  };

  const handleLast = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasLast && !loading) {
      onPageChange(totalPages);
      e.currentTarget.blur();
    }
  };

  const handlePageClick = (
    page: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
      e.currentTarget.blur();
    }
  };

  const focusRingColor = isDarkMode ? 'white' : '#0066ff';
  const focusOffsetColor = isDarkMode ? '#1a1a1a' : 'white';

  // Memoize common focus handlers to avoid recreating on every render
  const getFocusHandlers = useMemo(
    () => ({
      style: {
        '--focus-ring-color': focusRingColor,
        '--focus-offset-color': focusOffsetColor,
      } as React.CSSProperties & {
        '--focus-ring-color': string;
        '--focus-offset-color': string;
      },
      onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${focusOffsetColor}, 0 0 0 6px ${focusRingColor}`;
        }
      },
      onBlur: (e: React.FocusEvent<HTMLButtonElement>) => {
        e.currentTarget.style.boxShadow = 'none';
      },
    }),
    [focusRingColor, focusOffsetColor]
  );

  if (totalPages <= 1) return null;

  if (isMobile) {
    // Mobile view: Simple with First/Last buttons

    return (
      <nav
        className="flex items-center justify-center gap-2 py-4"
        aria-label="Pagination navigation"
      >
        {/* First Button */}
        <button
          onClick={handleFirst}
          disabled={!hasFirst || loading}
          className="py-2 px-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] min-h-[44px] outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          {...getFocusHandlers}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || loading}
          className="py-2 px-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] min-h-[44px] outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          {...getFocusHandlers}
          aria-label="Go to previous page"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        {/* Page Info */}
        <span
          className="text-sm font-bold min-w-[60px] text-center"
          aria-current="page"
          aria-label={`Page ${currentPage} of ${totalPages}`}
        >
          {currentPage} / {totalPages}
        </span>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="py-2 px-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] min-h-[44px] outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          {...getFocusHandlers}
          aria-label="Go to next page"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>

        {/* Last Button */}
        <button
          onClick={handleLast}
          disabled={!hasLast || loading}
          className="py-2 px-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] min-h-[44px] outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          {...getFocusHandlers}
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </nav>
    );
  }

  // Desktop view: Smart pagination with page numbers
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  // Show First/Last buttons only when page 1/last is not in the visible page numbers
  const showFirstButton = hasFirst && !pageNumbers.includes(1);
  const showLastButton = hasLast && !pageNumbers.includes(totalPages);

  return (
    <footer className="flex flex-col items-center gap-4 mt-8">
      <nav
        className="flex items-center gap-2"
        aria-label="Pagination navigation"
      >
        {/* First Button - only show if page 1 is not visible */}
        {showFirstButton && (
          <button
            onClick={handleFirst}
            disabled={loading}
            className="min-w-[100px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
            {...getFocusHandlers}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="w-5 h-5" />
            <span>First</span>
          </button>
        )}

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || loading}
          className="min-w-[44px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          {...getFocusHandlers}
          aria-label="Go to previous page"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--muted-foreground)] cursor-default pixel-font"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = item === currentPage;
            return (
              <button
                key={item}
                onClick={(e) => handlePageClick(item, e)}
                disabled={loading}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center outline-none transition-colors rounded pixel-font ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                    : 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                }`}
                {...getFocusHandlers}
                aria-label={
                  isActive ? `Page ${item}, current page` : `Go to page ${item}`
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!hasNext || loading}
          className="min-w-[44px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
          {...getFocusHandlers}
          aria-label="Go to next page"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>

        {/* Last Button - only show if last page is not visible */}
        {showLastButton && (
          <button
            onClick={handleLast}
            disabled={loading}
            className="min-w-[100px] min-h-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors rounded"
            {...getFocusHandlers}
            aria-label="Go to last page"
          >
            <span>Last</span>
            <ChevronsRight className="w-5 h-5" />
          </button>
        )}
      </nav>
    </footer>
  );
}
