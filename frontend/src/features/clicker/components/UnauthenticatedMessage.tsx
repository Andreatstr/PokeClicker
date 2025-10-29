/**
 * Message displayed when user is not authenticated in clicker game
 */
export function UnauthenticatedMessage() {
  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-lg shadow-xl z-50 text-center"
      style={{
        backgroundColor: 'var(--card)',
        color: 'var(--foreground)',
        border: '4px solid var(--border)',
      }}
    >
      <h2 className="pixel-font text-2xl mb-4" style={{color: 'var(--foreground)'}}>
        Please Log In
      </h2>
      <p className="pixel-font text-sm mb-4" style={{color: 'var(--foreground)'}}>
        You need to log in to play the clicker game and save your progress.
      </p>
    </div>
  );
}
