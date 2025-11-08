interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  isDarkMode?: boolean;
}

/**
 * Reusable error banner component that appears in top-right corner
 */
export function ErrorBanner({
  message,
  onDismiss,
  isDarkMode = false,
}: ErrorBannerProps) {
  return (
    <aside
      className="fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50"
      style={{
        backgroundColor: isDarkMode ? 'var(--destructive)' : '#ef4444',
        color: isDarkMode ? 'var(--destructive-foreground)' : 'white',
      }}
      role="alert"
      aria-live="assertive"
    >
      {message}
      <button
        onClick={onDismiss}
        className="ml-4 font-bold hover:opacity-70"
        style={{
          color: isDarkMode ? 'var(--destructive-foreground)' : 'white',
        }}
        aria-label="Dismiss error"
      >
        X
      </button>
    </aside>
  );
}
