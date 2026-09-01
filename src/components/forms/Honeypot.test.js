import { describe, it, expect } from 'vitest';
import { isBot, HONEYPOT_FIELD, HONEYPOT_DEFAULT } from './Honeypot.jsx';

describe('honeypot isBot', () => {
  it('is false for a human (field blank / default)', () => {
    expect(isBot(HONEYPOT_DEFAULT)).toBe(false);
    expect(isBot({ [HONEYPOT_FIELD]: '' })).toBe(false);
    expect(isBot({})).toBe(false);
    expect(isBot(undefined)).toBe(false);
  });

  it('is true when the hidden field was filled', () => {
    expect(isBot({ [HONEYPOT_FIELD]: 'http://spam.example' })).toBe(true);
  });
});
