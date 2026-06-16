import { describe, it, expect } from 'vitest';
import { shuffle, pad, calcScore } from '../src/utils.js';

describe('shuffle', () => {
  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('returns a new array', () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr)).not.toBe(arr);
  });
});

describe('pad', () => {
  it('pads single digits with a leading zero', () => {
    expect(pad(0)).toBe('00');
    expect(pad(5)).toBe('05');
    expect(pad(9)).toBe('09');
  });

  it('does not alter double digits', () => {
    expect(pad(10)).toBe('10');
    expect(pad(59)).toBe('59');
  });
});

describe('calcScore', () => {
  it('counts correct, wrong and timed-out answers', () => {
    const answered = [
      { selected: 'A', correct: true,  timeout: false },
      { selected: 'B', correct: false, timeout: false },
      { selected: null, correct: false, timeout: true },
      null,
    ];
    const { correct, wrong, timeouts, pct, total } = calcScore(answered, 4);
    expect(correct).toBe(1);
    expect(wrong).toBe(1);
    expect(timeouts).toBe(1);
    expect(total).toBe(4);
    expect(pct).toBe(25);
  });

  it('returns 0% when total is zero', () => {
    expect(calcScore([], 0).pct).toBe(0);
  });

  it('returns 100% when all answers are correct', () => {
    const answered = [
      { selected: 'A', correct: true, timeout: false },
      { selected: 'B', correct: true, timeout: false },
    ];
    expect(calcScore(answered, 2).pct).toBe(100);
  });
});
