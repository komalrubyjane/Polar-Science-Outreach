import { describe, it, expect } from 'vitest';
import { slugify, truncate, humanizeEnum, parsePagination, formatNumber } from '@/lib/utils';

describe('slugify', () => {
  it('lowercases, strips punctuation and collapses separators', () => {
    expect(slugify('Antarctic Sea-Ice Study (2026)!')).toBe('antarctic-sea-ice-study-2026');
  });
  it('trims leading/trailing separators', () => {
    expect(slugify('  --Hello World--  ')).toBe('hello-world');
  });
  it('caps length at 80 chars', () => {
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('short', 20)).toBe('short');
  });
  it('adds an ellipsis when cutting', () => {
    const out = truncate('a'.repeat(50), 10);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(10);
  });
});

describe('humanizeEnum', () => {
  it('turns ENUM_VALUE into "Enum value"', () => {
    expect(humanizeEnum('MARINE_SCIENCE')).toBe('Marine science');
    expect(humanizeEnum('CLIMATE')).toBe('Climate');
  });
});

describe('parsePagination', () => {
  it('applies defaults and clamps page size', () => {
    const p = parsePagination(new URLSearchParams(''));
    expect(p.page).toBe(1);
    expect(p.pageSize).toBe(12);
    expect(p.skip).toBe(0);
  });
  it('computes skip from page', () => {
    const p = parsePagination(new URLSearchParams('page=3&pageSize=20'));
    expect(p.skip).toBe(40);
  });
  it('never returns page < 1', () => {
    const p = parsePagination(new URLSearchParams('page=-5'));
    expect(p.page).toBe(1);
  });
  it('caps pageSize at the maximum', () => {
    const p = parsePagination(new URLSearchParams('pageSize=9999'));
    expect(p.pageSize).toBe(100);
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1284)).toBe('1,284');
    expect(formatNumber(null)).toBe('0');
  });
});
