import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { state } from '../src/state.js';
import { Q_MAX_SECONDS, EXAM_MAX_SECONDS } from '../src/constants.js';
import { setTimerCallbacks, startQTimer, stopQTimer, resetTotalTimer, clearTotalTimer } from '../src/timer.js';

function makeEl() {
  return {
    textContent: '',
    className: '',
    style: { width: '' },
    classList: { add: () => {}, remove: () => {} },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  const map = {};
  vi.stubGlobal('document', {
    getElementById: (id) => { if (!map[id]) map[id] = makeEl(); return map[id]; },
  });
  state.isPaused = false;
  state.qSecsLeft = Q_MAX_SECONDS;
  state.totalSecsLeft = EXAM_MAX_SECONDS;
  state.qTimerInterval = null;
  state.totalTimerInterval = null;
  setTimerCallbacks({ onQTimeout: null, onExamTimeout: null });
});

afterEach(() => {
  stopQTimer();
  clearTotalTimer();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('startQTimer', () => {
  it('resets qSecsLeft to Q_MAX_SECONDS', () => {
    state.qSecsLeft = 10;
    startQTimer();
    expect(state.qSecsLeft).toBe(Q_MAX_SECONDS);
  });

  it('decrements qSecsLeft by 1 each second', () => {
    startQTimer();
    vi.advanceTimersByTime(3000);
    expect(state.qSecsLeft).toBe(Q_MAX_SECONDS - 3);
  });

  it('calls onQTimeout when time runs out', () => {
    const onQTimeout = vi.fn();
    setTimerCallbacks({ onQTimeout, onExamTimeout: null });
    startQTimer();
    vi.advanceTimersByTime(Q_MAX_SECONDS * 1000);
    expect(onQTimeout).toHaveBeenCalledOnce();
  });

  it('does not decrement while paused', () => {
    startQTimer();
    vi.advanceTimersByTime(2000);
    state.isPaused = true;
    vi.advanceTimersByTime(5000);
    expect(state.qSecsLeft).toBe(Q_MAX_SECONDS - 2);
  });
});

describe('stopQTimer', () => {
  it('clears qTimerInterval', () => {
    startQTimer();
    expect(state.qTimerInterval).not.toBeNull();
    stopQTimer();
    expect(state.qTimerInterval).toBeNull();
  });

  it('stops further decrements', () => {
    startQTimer();
    vi.advanceTimersByTime(2000);
    stopQTimer();
    vi.advanceTimersByTime(5000);
    expect(state.qSecsLeft).toBe(Q_MAX_SECONDS - 2);
  });
});

describe('resetTotalTimer', () => {
  it('resets totalSecsLeft to EXAM_MAX_SECONDS', () => {
    state.totalSecsLeft = 100;
    resetTotalTimer();
    expect(state.totalSecsLeft).toBe(EXAM_MAX_SECONDS);
  });

  it('decrements totalSecsLeft by 1 each second', () => {
    resetTotalTimer();
    vi.advanceTimersByTime(3000);
    expect(state.totalSecsLeft).toBe(EXAM_MAX_SECONDS - 3);
  });

  it('calls onExamTimeout when time runs out', () => {
    const onExamTimeout = vi.fn();
    setTimerCallbacks({ onQTimeout: null, onExamTimeout });
    resetTotalTimer();
    vi.advanceTimersByTime(EXAM_MAX_SECONDS * 1000);
    expect(onExamTimeout).toHaveBeenCalledOnce();
  });

  it('does not decrement while paused', () => {
    resetTotalTimer();
    vi.advanceTimersByTime(2000);
    state.isPaused = true;
    vi.advanceTimersByTime(5000);
    expect(state.totalSecsLeft).toBe(EXAM_MAX_SECONDS - 2);
  });
});

describe('clearTotalTimer', () => {
  it('clears totalTimerInterval', () => {
    resetTotalTimer();
    expect(state.totalTimerInterval).not.toBeNull();
    clearTotalTimer();
    expect(state.totalTimerInterval).toBeNull();
  });
});
