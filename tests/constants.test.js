import { describe, it, expect } from 'vitest';
import { EXAM_MAX_SECONDS, Q_MAX_SECONDS, PASS_THRESHOLD, LEVEL_ICONS } from '../src/constants.js';

describe('constants', () => {
  it('EXAM_MAX_SECONDS equals 90 minutes', () => {
    expect(EXAM_MAX_SECONDS).toBe(90 * 60);
  });

  it('Q_MAX_SECONDS is 60', () => {
    expect(Q_MAX_SECONDS).toBe(60);
  });

  it('PASS_THRESHOLD is 0.72', () => {
    expect(PASS_THRESHOLD).toBe(0.72);
  });

  it('LEVEL_ICONS has all four certification levels', () => {
    expect(LEVEL_ICONS).toHaveProperty('cloud-practitioner');
    expect(LEVEL_ICONS).toHaveProperty('ai-practitioner');
    expect(LEVEL_ICONS).toHaveProperty('developer-associate');
    expect(LEVEL_ICONS).toHaveProperty('solutions-architect-associate');
  });
});
