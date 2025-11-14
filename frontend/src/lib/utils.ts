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
