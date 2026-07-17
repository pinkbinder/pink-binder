import { describe, expect, it } from 'bun:test';
import { CLICKABLE_BADGE_CLASS, MYTHICAL_PLATINUM_TONE_CLASS } from './badge-styles';

describe('badge-styles', () => {
  it('exposes a clickable badge class string', () => {
    expect(CLICKABLE_BADGE_CLASS).toContain('rounded-full');
    expect(CLICKABLE_BADGE_CLASS).toContain('px-3');
    expect(CLICKABLE_BADGE_CLASS).toContain('text-xs');
  });

  it('exposes a mythical platinum tone class string', () => {
    expect(MYTHICAL_PLATINUM_TONE_CLASS).toContain('border-[#7DA8FF]');
    expect(MYTHICAL_PLATINUM_TONE_CLASS).toContain('text-[#2457B8]');
  });
});
