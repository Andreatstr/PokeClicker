/**
 * Formats a date string to a human-readable format (e.g., "Oct 2024")
 * Returns "Unknown" if the date is invalid
 */
export function formatTrainerSince(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}
