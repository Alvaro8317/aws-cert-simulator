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
  clearTotalTimer: vi.fn(),
  resetTotalTimer: vi.fn(),
}));

vi.mock('../src/modes.js', () => ({
  initLevel: vi.fn(),
  selectLevel: vi.fn(),
  goToModeSelect: vi.fn(),
  startSimulatorMode: vi.fn(),
  startFreeMode: vi.fn(),
}));

import { state } from '../src/state.js';
import { EXAM_MAX_SECONDS } from '../src/constants.js';
import { showResults, goToLevelSelect, restartSameLevel, finishEarly } from '../src/results.js';

function makeEl() {
  const cls = new Set();
  return {
    textContent: '',
    innerHTML: '',
    style: { display: '' },
    classList: {
      add: (c) => cls.add(c),
      remove: (c) => cls.delete(c),
      toggle: (c, f) => { const v = f === undefined ? !cls.has(c) : f; v ? cls.add(c) : cls.delete(c); },
      contains: (c) => cls.has(c),
    },
  };
}

let domMap;

beforeEach(() => {
  domMap = {};
  vi.stubGlobal('document', {
    getElementById:   (id) => { if (!domMap[id]) domMap[id] = makeEl(); return domMap[id]; },
    querySelectorAll: ()   => [],
  });
  state.freeMode      = false;
  state.isPaused      = false;
  state.totalSecsLeft = EXAM_MAX_SECONDS;
  state.questions     = [{ text: 'Q1' }, { text: 'Q2' }];
  state.answered      = [
    { selected: 'A', correct: true,  timeout: false },
    { selected: 'B', correct: false, timeout: false },
  ];
  state.qIndex = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('showResults', () => {
  it('sets isPaused to false', () => {
    state.isPaused = true;
    showResults();
    expect(state.isPaused).toBe(false);
  });

  it('renders the score percentage in the DOM', () => {
    showResults(); // 1 correct / 2 total = 50 %
    expect(domMap['scorePercent'].textContent).toBe('50%');
  });

  it('renders "X de Y correctas" label', () => {
    showResults();
    expect(domMap['scoreCorrectOf'].textContent).toBe('1 de 2 correctas');
  });

  it('shows APROBADO when score is at or above the pass threshold', () => {
    state.questions = new Array(10).fill({ text: 'Q' });
    state.answered  = new Array(10).fill({ selected: 'A', correct: true, timeout: false });
    showResults(); // 100 % >= 72 %
    expect(domMap['scoreVerdict'].innerHTML).toContain('APROBADO');
  });

  it('shows REPROBADO when score is below the pass threshold', () => {
    showResults(); // 50 % < 72 %
    expect(domMap['scoreVerdict'].innerHTML).toContain('REPROBADO');
  });

  it('renders individual stat counters', () => {
    showResults();
    expect(domMap['statsCorrect'].textContent).toBe(1);
    expect(domMap['statsWrong'].textContent).toBe(1);
    expect(domMap['statsTimeout'].textContent).toBe(0);
  });
});

describe('goToLevelSelect', () => {
  it('resets freeMode to false', () => {
    state.freeMode = true;
    goToLevelSelect();
    expect(state.freeMode).toBe(false);
  });

  it('resets isPaused to false', () => {
    state.isPaused = true;
    goToLevelSelect();
    expect(state.isPaused).toBe(false);
  });
});

describe('restartSameLevel', () => {
  it('sets freeMode to false', () => {
    state.freeMode = true;
    restartSameLevel();
    expect(state.freeMode).toBe(false);
  });

  it('delegates to initLevel with shuffle enabled', async () => {
    const { initLevel } = await import('../src/modes.js');
    restartSameLevel();
    expect(initLevel).toHaveBeenCalledWith(true);
  });
});

describe('finishEarly', () => {
  it('calls showResults when the user confirms', () => {
    vi.stubGlobal('confirm', () => true);
    finishEarly();
    expect(domMap['scorePercent'].textContent).toBe('50%');
    vi.unstubAllGlobals();
    // Re-stub document so afterEach can run cleanly
    domMap = {};
    vi.stubGlobal('document', {
      getElementById:   (id) => { if (!domMap[id]) domMap[id] = makeEl(); return domMap[id]; },
      querySelectorAll: ()   => [],
    });
  });

  it('does nothing when the user cancels', () => {
    vi.stubGlobal('confirm', () => false);
    finishEarly();
    expect(domMap['scorePercent']).toBeUndefined();
    vi.unstubAllGlobals();
    domMap = {};
    vi.stubGlobal('document', {
      getElementById:   (id) => { if (!domMap[id]) domMap[id] = makeEl(); return domMap[id]; },
      querySelectorAll: ()   => [],
    });
  });
});
