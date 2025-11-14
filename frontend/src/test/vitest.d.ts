/// <reference types="vitest" />

/**
 * Vitest type augmentation
 * Extends Vitest with Testing Library matchers (toBeInTheDocument, toHaveTextContent, etc.)
 */

import '@testing-library/jest-dom';
import type {TestingLibraryMatchers} from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers {}
}
