import {describe, it, expect} from 'vitest';
import {cn, generateUUID} from '../utils';

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

describe('generateUUID', () => {
  it('should generate a valid UUID format', () => {
    const uuid = generateUUID();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  it('should generate valid guest usernames under 20 chars', () => {
    const guestUsername = `g_${generateUUID().slice(0, 8)}`;
    expect(guestUsername.length).toBe(10); // "g_" + 8 chars
    expect(guestUsername.length).toBeLessThanOrEqual(20);
  });
});
