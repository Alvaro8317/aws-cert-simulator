import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../src/ui.js', () => ({
  showScreen: vi.fn(),
  applyQuizFooter: vi.fn(),
  hideQuizFooter: vi.fn(),
  scrollToTop: vi.fn(),
}));

vi.mock('../src/quiz.js', () => ({
  renderQuestion: vi.fn(),
}));

vi.mock('../src/timer.js', () => ({
  stopQTimer: vi.fn(),
}));

import { state } from '../src/state.js';
import { renderQuestionList } from '../src/list.js';

const QUESTIONS = [
  { text: 'What is EC2?',  correct: 'A', options: [], explanation: '' },
  { text: 'What is S3?',   correct: 'B', options: [], explanation: '' },
  { text: 'What is VPC?',  correct: 'A', options: [], explanation: '' },
];

function makeEl() {
  const cls = new Set();
  return {
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      add: (c) => cls.add(c),
      remove: (c) => cls.delete(c),
      contains: (c) => cls.has(c),
    },
    querySelectorAll: () => [],
    addEventListener: vi.fn(),
  };
}

let domMap;

beforeEach(() => {
  domMap = {};
  vi.stubGlobal('document', {
    getElementById: (id) => { if (!domMap[id]) domMap[id] = makeEl(); return domMap[id]; },
  });
  state.questions = [...QUESTIONS];
  state.answered  = new Array(QUESTIONS.length).fill(null);
  state.qIndex    = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('renderQuestionList', () => {
  it('shows total, answered, and correct counts when none are answered', () => {
    renderQuestionList();
    expect(domMap['qListSubtitle'].textContent).toBe('3 preguntas · 0 respondidas · 0 correctas');
  });

  it('counts answered and correct questions', () => {
    state.answered[0] = { selected: 'A', correct: true,  timeout: false };
    state.answered[1] = { selected: 'A', correct: false, timeout: false };
    renderQuestionList();
    expect(domMap['qListSubtitle'].textContent).toBe('3 preguntas · 2 respondidas · 1 correctas');
  });

  it('generates one list item per question', () => {
    renderQuestionList();
    const matches = domMap['questionListItems'].innerHTML.match(/q-list-item/g) || [];
    expect(matches.length).toBe(QUESTIONS.length);
  });

  it('marks a correct answer with q-correct class', () => {
    state.answered[0] = { selected: 'A', correct: true, timeout: false };
    renderQuestionList();
    expect(domMap['questionListItems'].innerHTML).toContain('q-correct');
  });

  it('marks a wrong answer with q-wrong class', () => {
    state.answered[0] = { selected: 'B', correct: false, timeout: false };
    renderQuestionList();
    expect(domMap['questionListItems'].innerHTML).toContain('q-wrong');
  });

  it('truncates question text longer than 90 characters', () => {
    state.questions[0] = { ...QUESTIONS[0], text: 'A'.repeat(100) };
    renderQuestionList();
    expect(domMap['questionListItems'].innerHTML).toContain('…');
  });

  it('does not truncate text of exactly 90 characters or shorter', () => {
    state.questions[0] = { ...QUESTIONS[0], text: 'A'.repeat(90) };
    renderQuestionList();
    expect(domMap['questionListItems'].innerHTML).not.toContain('…');
  });
});
