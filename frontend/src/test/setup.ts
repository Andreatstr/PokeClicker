import {global} from '@apollo/client/utilities/globals';
import '@testing-library/jest-dom';
import {vi} from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  volume: 1,
  currentTime: 0,
}));

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn().mockImplementation(() => {
    const request = {
      result: {},
      error: null,
      onsuccess: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onupgradeneeded: null as ((event: Event) => void) | null,
    };
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);
    return request;
  }),
};

global.indexedDB = indexedDBMock as unknown as IDBFactory;
