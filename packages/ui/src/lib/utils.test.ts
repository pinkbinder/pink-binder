import { describe, expect, it } from 'bun:test';
import { cn } from './utils';

describe('cn', () => {
  it('merges single class strings', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('dedupes conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional (falsy) values', () => {
    expect(cn('base', false, null, undefined, 'active')).toBe('base active');
  });

  it('merges object syntax from clsx', () => {
    expect(cn('base', { 'is-on': true, 'is-off': false })).toBe('base is-on');
  });

  it('resolves conflicting merged classes across objects and strings', () => {
    expect(cn('text-red-500', { 'text-red-500': false }, 'text-blue-500')).toBe('text-blue-500');
  });
});
