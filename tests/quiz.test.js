import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../src/timer.js', () => ({
  startQTimer: vi.fn(),
  stopQTimer: vi.fn(),
}));

vi.mock('../src/ui.js', () => ({
  scrollToTop: vi.fn(),
  showScreen: vi.fn(),
  setHeader: vi.fn(),
  applyQuizFooter: vi.fn(),
  hideQuizFooter: vi.fn(),
}));

import { state } from '../src/state.js';
import { selectOption, confirmMultiAnswer, handleTimeout, nextQuestion, prevQuestion, setQuizCallbacks } from '../src/quiz.js';

const QUESTIONS = [
  {
    text: 'What is EC2?',
    correct: 'A',
    explanation: 'Elastic Compute Cloud.',
    options: [
      { letter: 'A', title: 'Compute', desc: 'Virtual machines' },
      { letter: 'B', title: 'Storage', desc: 'Object storage' },
    ],
  },
  {
    text: 'What is S3?',
    correct: 'B',
    explanation: 'Simple Storage Service.',
    options: [
      { letter: 'A', title: 'Compute', desc: 'Virtual machines' },
      { letter: 'B', title: 'Storage', desc: 'Object storage' },
    ],
  },
];

const MULTI_QUESTION = {
  text: 'Select two AWS compute services.',
  correct: ['A', 'C'],
  explanation: 'EC2 and Lambda are compute services.',
  options: [
    { letter: 'A', title: 'EC2', desc: '' },
    { letter: 'B', title: 'S3', desc: '' },
    { letter: 'C', title: 'Lambda', desc: '' },
    { letter: 'D', title: 'Route 53', desc: '' },
  ],
};

function makeEl() {
  const cls = new Set();
  return {
    textContent: '',
    innerHTML: '',
    style: { display: '' },
    disabled: false,
    classList: {
      add: (c) => cls.add(c),
      remove: (c) => cls.delete(c),
      toggle: (c, f) => { const v = f === undefined ? !cls.has(c) : f; v ? cls.add(c) : cls.delete(c); },
      contains: (c) => cls.has(c),
    },
    querySelector: () => ({ textContent: '' }),
    querySelectorAll: () => [],
    addEventListener: vi.fn(),
  };
}

beforeEach(() => {
  const map = {};
  vi.stubGlobal('document', {
    getElementById: (id) => { if (!map[id]) map[id] = makeEl(); return map[id]; },
    querySelectorAll: () => [],
  });
  state.questions = QUESTIONS.map(q => ({ ...q, options: [...q.options] }));
  state.qIndex    = 0;
  state.answered  = new Array(QUESTIONS.length).fill(null);
  state.revealed  = new Array(QUESTIONS.length).fill(false);
  state.pendingSelection = [];
  state.freeMode  = false;
  state.isPaused  = false;
  setQuizCallbacks({ onShowResults: null, onGoToList: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('selectOption', () => {
  it('does nothing when the question is already answered', () => {
    state.answered[0] = { selected: 'A', correct: true, timeout: false };
    selectOption('B');
    expect(state.answered[0].selected).toBe('A');
  });

  it('does nothing when the game is paused', () => {
    state.isPaused = true;
    selectOption('A');
    expect(state.answered[0]).toBeNull();
  });

  it('records a correct answer in state', () => {
    selectOption('A');
    expect(state.answered[0]).toEqual({ selected: 'A', correct: true, timeout: false });
  });

  it('records a wrong answer in state', () => {
    selectOption('B');
    expect(state.answered[0]).toEqual({ selected: 'B', correct: false, timeout: false });
  });

  it('marks the question as revealed', () => {
    selectOption('A');
    expect(state.revealed[0]).toBe(true);
  });
});

describe('multi-select questions', () => {
  beforeEach(() => {
    state.questions = [{ ...MULTI_QUESTION, options: [...MULTI_QUESTION.options] }];
    state.qIndex    = 0;
    state.answered  = [null];
    state.revealed  = [false];
    state.pendingSelection = [];
  });

  it('toggles a letter into pendingSelection without answering the question', () => {
    selectOption('A');
    expect(state.pendingSelection).toEqual(['A']);
    expect(state.answered[0]).toBeNull();
  });

  it('toggles a letter back out of pendingSelection when clicked again', () => {
    selectOption('A');
    selectOption('A');
    expect(state.pendingSelection).toEqual([]);
  });

  it('does nothing when the game is paused', () => {
    state.isPaused = true;
    selectOption('A');
    expect(state.pendingSelection).toEqual([]);
  });

  it('confirmMultiAnswer does nothing until the required number of options is selected', () => {
    selectOption('A');
    confirmMultiAnswer();
    expect(state.answered[0]).toBeNull();
  });

  it('confirmMultiAnswer records a correct answer when the exact correct set is selected', () => {
    selectOption('C');
    selectOption('A');
    confirmMultiAnswer();
    expect(state.answered[0]).toEqual({ selected: ['A', 'C'], correct: true, timeout: false });
  });

  it('confirmMultiAnswer records a wrong answer when the selection does not match exactly', () => {
    selectOption('A');
    selectOption('B');
    confirmMultiAnswer();
    expect(state.answered[0]).toEqual({ selected: ['A', 'B'], correct: false, timeout: false });
  });

  it('marks the question as revealed after confirming', () => {
    selectOption('A');
    selectOption('C');
    confirmMultiAnswer();
    expect(state.revealed[0]).toBe(true);
  });

  it('does nothing when the question is already answered', () => {
    state.answered[0] = { selected: ['A', 'C'], correct: true, timeout: false };
    selectOption('B');
    expect(state.answered[0].selected).toEqual(['A', 'C']);
  });
});

describe('handleTimeout', () => {
  it('does nothing when the question is already answered', () => {
    state.answered[0] = { selected: 'A', correct: true, timeout: false };
    handleTimeout();
    expect(state.answered[0].timeout).toBe(false);
  });

  it('records a timeout entry in state', () => {
    handleTimeout();
    expect(state.answered[0]).toEqual({ selected: null, correct: false, timeout: true });
  });

  it('marks the question as revealed', () => {
    handleTimeout();
    expect(state.revealed[0]).toBe(true);
  });
});

describe('nextQuestion', () => {
  it('advances qIndex when not on the last question', () => {
    state.qIndex = 0;
    nextQuestion();
    expect(state.qIndex).toBe(1);
  });

  it('calls onShowResults on the last question in simulator mode', () => {
    const onShowResults = vi.fn();
    setQuizCallbacks({ onShowResults, onGoToList: vi.fn() });
    state.freeMode = false;
    state.qIndex   = QUESTIONS.length - 1;
    nextQuestion();
    expect(onShowResults).toHaveBeenCalledOnce();
  });

  it('calls onGoToList on the last question in free mode', () => {
    const onGoToList = vi.fn();
    setQuizCallbacks({ onShowResults: vi.fn(), onGoToList });
    state.freeMode = true;
    state.qIndex   = QUESTIONS.length - 1;
    nextQuestion();
    expect(onGoToList).toHaveBeenCalledOnce();
  });
});

describe('prevQuestion', () => {
  it('decrements qIndex when not on the first question', () => {
    state.qIndex = 1;
    prevQuestion();
    expect(state.qIndex).toBe(0);
  });

  it('does nothing when already on the first question', () => {
    state.qIndex = 0;
    prevQuestion();
    expect(state.qIndex).toBe(0);
  });
});
