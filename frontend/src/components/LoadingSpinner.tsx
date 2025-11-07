interface LoadingSpinnerProps {
  message?: string;
  isDarkMode?: boolean;
}

export function LoadingSpinner({
  message = 'Loading...',
  isDarkMode = false,
}: LoadingSpinnerProps) {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-[200px] gap-4"
      style={{color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)'}}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className="w-8 h-8 border-4 border-solid rounded-full animate-spin"
        style={{
          borderColor: isDarkMode
            ? 'var(--muted-foreground) transparent var(--muted-foreground) transparent'
            : 'var(--muted-foreground) transparent var(--muted-foreground) transparent',
        }}
        aria-hidden="true"
      />
      <p className="pixel-font text-sm">{message}</p>
    </section>
  );
}
