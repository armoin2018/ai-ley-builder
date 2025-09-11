import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe(
      'base conditional'
    );
  });

  it('handles object syntax', () => {
    expect(
      cn('base', {
        active: true,
        disabled: false,
      })
    ).toBe('base active');
  });

  it('handles arrays', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('merges Tailwind classes correctly', () => {
    // Test Tailwind merge functionality
    expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('', null, undefined, false)).toBe('');
  });

  it('handles complex combinations', () => {
    const result = cn(
      'base-class',
      {
        'state-active': true,
        'state-disabled': false,
      },
      'another-class',
      true && 'conditional-class',
      false && 'hidden-class'
    );

    expect(result).toBe(
      'base-class state-active another-class conditional-class'
    );
  });

  it('handles duplicate classes (twMerge handles this)', () => {
    // twMerge doesn't deduplicate arbitrary classes, only conflicting ones
    expect(cn('duplicate', 'other', 'duplicate')).toBe(
      'duplicate other duplicate'
    );
  });

  it('handles whitespace correctly', () => {
    expect(cn('  spaced  ', '  classes  ')).toBe('spaced classes');
  });
});
