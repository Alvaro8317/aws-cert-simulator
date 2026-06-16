import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../src/ui.js', () => ({
  showScreen: vi.fn(),
  setHeader: vi.fn(),
  applyQuizFooter: vi.fn(),
  hideQuizFooter: vi.fn(),
  scrollToTop: vi.fn(),
}));

vi.mock('../src/timer.js', () => ({
  startQTimer: vi.fn(),
  stopQTimer: vi.fn(),
  resetTotalTimer: vi.fn(),
  clearTotalTimer: vi.fn(),
}));

vi.mock('../src/quiz.js', () => ({
  renderQuestion: vi.fn(),
  setQuizCallbacks: vi.fn(),
}));

vi.mock('../src/list.js', () => ({
  renderQuestionList: vi.fn(),
}));

import { state } from '../src/state.js';
import { selectLevel, startSimulatorMode, startFreeMode, initLevel } from '../src/modes.js';

const LEVEL = {
  id: 'cloud-practitioner',
  name: 'Cloud Practitioner',
  code: 'CLF-C02',
  badge: '☁️',
  questions: [
    { text: 'Q1', correct: 'A', options: [], explanation: '' },
    { text: 'Q2', correct: 'B', options: [], explanation: '' },
    { text: 'Q3', correct: 'C', options: [], explanation: '' },
  ],
};

function makeEl() {
  return {
    textContent: '',
    innerHTML: '',
    style: {},
    classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn(), contains: vi.fn() },
    querySelectorAll: () => [],
    querySelector: () => ({ textContent: '' }),
    addEventListener: vi.fn(),
  };
}

beforeEach(() => {
  const map = {};
  vi.stubGlobal('document', {
    getElementById: (id) => { if (!map[id]) map[id] = makeEl(); return map[id]; },
    querySelectorAll: () => [],
  });
  state.currentLevel = LEVEL;
  state.freeMode     = false;
  state.isPaused     = false;
  state.qIndex       = 0;
  state.questions    = [];
  state.answered     = [];
  state.revealed     = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('initLevel', () => {
  it('loads questions from currentLevel', () => {
    initLevel(false);
    expect(state.questions).toHaveLength(LEVEL.questions.length);
  });

  it('preserves question order when doShuffle is false', () => {
    initLevel(false);
    expect(state.questions).toEqual(LEVEL.questions);
  });

  it('contains all questions when doShuffle is true', () => {
    initLevel(true);
    expect(state.questions).toHaveLength(LEVEL.questions.length);
    expect(state.questions).toEqual(expect.arrayContaining(LEVEL.questions));
  });

  it('resets qIndex to 0', () => {
    state.qIndex = 2;
    initLevel(false);
    expect(state.qIndex).toBe(0);
  });

  it('initializes answered with nulls', () => {
    initLevel(false);
    expect(state.answered).toEqual(new Array(LEVEL.questions.length).fill(null));
  });

  it('initializes revealed with false', () => {
    initLevel(false);
    expect(state.revealed).toEqual(new Array(LEVEL.questions.length).fill(false));
  });

  it('sets isPaused to false', () => {
    state.isPaused = true;
    initLevel(false);
    expect(state.isPaused).toBe(false);
  });
});

describe('startSimulatorMode', () => {
  it('sets freeMode to false', () => {
    state.freeMode = true;
    startSimulatorMode();
    expect(state.freeMode).toBe(false);
  });
});

describe('startFreeMode', () => {
  it('sets freeMode to true', () => {
    startFreeMode();
    expect(state.freeMode).toBe(true);
  });

  it('loads questions without shuffling', () => {
    startFreeMode();
    expect(state.questions).toEqual(LEVEL.questions);
  });

  it('resets qIndex to 0', () => {
    state.qIndex = 2;
    startFreeMode();
    expect(state.qIndex).toBe(0);
  });

  it('initializes answered with nulls', () => {
    startFreeMode();
    expect(state.answered).toEqual(new Array(LEVEL.questions.length).fill(null));
  });

  it('initializes revealed with false', () => {
    startFreeMode();
    expect(state.revealed).toEqual(new Array(LEVEL.questions.length).fill(false));
  });
});

describe('selectLevel', () => {
  it('stores the chosen level in state', () => {
    state.currentLevel = null;
    selectLevel(LEVEL);
    expect(state.currentLevel).toBe(LEVEL);
  });
});
