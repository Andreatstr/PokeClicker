import {describe, it, expect} from 'vitest';
import {cn} from '../utils';

describe('cn utility function', () => {
  it('should merge single class', () => {
    const result = cn('text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should merge multiple classes', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('text-red-500', isActive && 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle false conditional classes', () => {
    const isActive = false;
    const result = cn('text-red-500', isActive && 'bg-blue-500');
    expect(result).toBe('text-red-500');
  });

  it('should handle undefined values', () => {
    const result = cn('text-red-500', undefined);
    expect(result).toBe('text-red-500');
  });

  it('should handle null values', () => {
    const result = cn('text-red-500', null);
    expect(result).toBe('text-red-500');
  });

  it('should handle empty arrays', () => {
    const result = cn('text-red-500', []);
    expect(result).toBe('text-red-500');
  });

  it('should handle arrays with classes', () => {
    const result = cn('text-red-500', ['bg-blue-500', 'p-4']);
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('should handle objects with boolean values', () => {
    const result = cn('text-red-500', {'bg-blue-500': true, 'p-4': false});
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should merge conflicting classes correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle complex combinations', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'text-red-500',
      isActive && 'bg-blue-500',
      isDisabled && 'opacity-50',
      ['p-4', 'rounded'],
      {'shadow-lg': true, border: false}
    );
    expect(result).toBe('text-red-500 bg-blue-500 p-4 rounded shadow-lg');
  });
});
