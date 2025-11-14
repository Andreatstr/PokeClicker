import {useError} from '@/hooks/useError';
import {ErrorSeverity} from '@/lib/errorHandler';

/**
 * Global error display component with toast-style notifications.
 *
 * Features:
 * - Displays multiple errors stacked vertically
 * - Color-coded by severity (info, warning, error, critical)
 * - Dismissible with close button
 * - Auto-animates slide-in from right
 * - Retro pixel-art styling with shadow borders
 *
 * Accessibility:
 * - role="alert" with aria-live="assertive" for screen readers
 * - Distinct icons for each severity level
 * - Error codes displayed for debugging
 */
export function ErrorDisplay() {
  const {errors, removeError} = useError();

  if (errors.length === 0) {
    return null;
  }

  const getSeverityStyles = (severity: ErrorSeverity) => {
    const baseStyles =
      'border-4 p-4 mb-4 relative animate-slide-in pixel-font shadow-[4px_4px_0px_rgba(0,0,0,1)]';

    switch (severity) {
      case ErrorSeverity.SUCCESS:
        return `${baseStyles} bg-green-100 border-green-600 text-green-900`;
      case ErrorSeverity.INFO:
        return `${baseStyles} bg-blue-100 border-blue-600 text-blue-900`;
      case ErrorSeverity.WARNING:
        return `${baseStyles} bg-yellow-100 border-yellow-600 text-yellow-900`;
      case ErrorSeverity.ERROR:
        return `${baseStyles} bg-red-100 border-red-600 text-red-900`;
      case ErrorSeverity.CRITICAL:
        return `${baseStyles} bg-red-200 border-red-800 text-red-950`;
      default:
        return `${baseStyles} bg-gray-100 border-gray-600 text-gray-900`;
    }
  };

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.SUCCESS:
        return (
          <svg
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6"
            aria-hidden="true"
          >
            <path
              d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z"
              fill="currentColor"
            />
          </svg>
        );
      case ErrorSeverity.INFO:
        return <span className="font-bold">i</span>;
      case ErrorSeverity.WARNING:
        return <span className="font-bold">!</span>;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return <span className="font-bold">X</span>;
      default:
        return <span className="font-bold">?</span>;
    }
  };

  return (
    <aside
      className="fixed top-20 right-4 z-50 max-w-md space-y-2"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {errors.map((error) => (
        <article key={error.id} className={getSeverityStyles(error.severity)}>
          <button
            onClick={() => removeError(error.id)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black text-white hover:bg-gray-800 transition-colors font-bold text-sm"
            aria-label="Dismiss error"
          >
            X
          </button>

          <div className="flex items-start gap-3 pr-8">
            <span
              className={`shrink-0 flex items-center justify-center ${
                error.severity === ErrorSeverity.SUCCESS ? '' : 'text-2xl'
              }`}
              aria-hidden="true"
            >
              {getSeverityIcon(error.severity)}
            </span>
            <div className="flex-1">
              <header>
                <p className="font-bold text-sm mb-1">
                  {error.severity.toUpperCase()}
                </p>
              </header>
              <p className="text-xs leading-relaxed">{error.userMessage}</p>
              {error.code && (
                <footer>
                  <p className="text-[10px] mt-2 opacity-60">
                    Error Code: {error.code}
                  </p>
                </footer>
              )}
            </div>
          </div>
        </article>
      ))}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </aside>
  );
}
