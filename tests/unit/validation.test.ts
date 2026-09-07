import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  researchCreateSchema,
  eventCreateSchema,
  newsletterSubscribeSchema,
  quizAttemptSchema,
} from '@/lib/validation';

describe('registerSchema', () => {
  it('accepts a strong password', () => {
    const r = registerSchema.safeParse({
      name: 'Jo',
      email: 'jo@example.org',
      password: 'Str0ngPass',
    });
    expect(r.success).toBe(true);
  });
  it('rejects a weak password (no digit)', () => {
    const r = registerSchema.safeParse({
      name: 'Jo',
      email: 'jo@example.org',
      password: 'weakpassword',
    });
    expect(r.success).toBe(false);
  });
  it('rejects an invalid email', () => {
    const r = registerSchema.safeParse({ name: 'Jo', email: 'nope', password: 'Str0ngPass' });
    expect(r.success).toBe(false);
  });
});

describe('researchCreateSchema', () => {
  it('requires title, abstract, discipline and pole', () => {
    const r = researchCreateSchema.safeParse({ title: 'T', abstract: 'A' });
    expect(r.success).toBe(false);
  });
  it('accepts a minimal valid record and defaults type/license', () => {
    const r = researchCreateSchema.safeParse({
      title: 'Sea ice study',
      abstract: 'An abstract long enough to be meaningful.',
      discipline: 'GLACIOLOGY',
      pole: 'ARCTIC',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe('RESEARCH_PAPER');
      expect(r.data.license).toBe('CC_BY');
    }
  });
  it('rejects a malformed DOI', () => {
    const r = researchCreateSchema.safeParse({
      title: 'X',
      abstract: 'Y',
      discipline: 'CLIMATE',
      pole: 'ANTARCTIC',
      doi: 'not-a-doi',
    });
    expect(r.success).toBe(false);
  });
});

describe('eventCreateSchema', () => {
  it('rejects an end time before the start time', () => {
    const r = eventCreateSchema.safeParse({
      title: 'Workshop',
      description: 'A workshop about polar data.',
      type: 'WORKSHOP',
      startAt: '2026-05-02T10:00:00Z',
      endAt: '2026-05-01T10:00:00Z',
    });
    expect(r.success).toBe(false);
  });
});

describe('newsletterSubscribeSchema', () => {
  it('normalises to an email', () => {
    expect(newsletterSubscribeSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
    expect(newsletterSubscribeSchema.safeParse({ email: 'x' }).success).toBe(false);
  });
});

describe('quizAttemptSchema', () => {
  it('requires at least one answer', () => {
    expect(quizAttemptSchema.safeParse({ answers: [] }).success).toBe(false);
    expect(
      quizAttemptSchema.safeParse({ answers: [{ questionId: 'q1', optionId: 'o1' }] }).success,
    ).toBe(true);
  });
});
