import { describe, it, expect } from 'vitest';
import { state } from '../src/state.js';

describe('initial state', () => {
  it('has an empty questions array', () => {
    expect(state.questions).toEqual([]);
  });

  it('starts at question index 0', () => {
    expect(state.qIndex).toBe(0);
  });

  it('starts with an empty answered array', () => {
    expect(state.answered).toEqual([]);
  });

  it('starts with an empty revealed array', () => {
    expect(state.revealed).toEqual([]);
  });

  it('starts not in free mode', () => {
    expect(state.freeMode).toBe(false);
  });

  it('starts not paused', () => {
    expect(state.isPaused).toBe(false);
  });

  it('qSecsLeft starts at 60', () => {
    expect(state.qSecsLeft).toBe(60);
  });

  it('totalSecsLeft starts at 90 minutes', () => {
    expect(state.totalSecsLeft).toBe(90 * 60);
  });

  it('timer intervals start as null', () => {
    expect(state.qTimerInterval).toBeNull();
    expect(state.totalTimerInterval).toBeNull();
  });
});
