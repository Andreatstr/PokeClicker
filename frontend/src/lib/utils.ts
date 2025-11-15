import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes intelligently
 *
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 * Ensures later classes override earlier ones, preventing conflicts.
 *
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'px-4') // 'py-1 bg-blue-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random UUID with fallback for older browsers
 *
 * Uses crypto.randomUUID() if available, otherwise falls back to
 * a random UUID v4 implementation using crypto.getRandomValues()
 *
 * @returns UUID string in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for browsers without crypto.randomUUID
  // This generates a UUID v4 using crypto.getRandomValues
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
