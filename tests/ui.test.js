import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { state } from '../src/state.js';
import { togglePause, setHeader, showScreen, applyQuizFooter, hideQuizFooter } from '../src/ui.js';

function makeEl() {
  const cls = new Set();
  return {
    textContent: '',
    innerHTML: '',
    className: '',
    style: { display: '' },
    classList: {
      add: (c) => cls.add(c),
      remove: (c) => cls.delete(c),
      toggle: (c, f) => { const v = f === undefined ? !cls.has(c) : f; v ? cls.add(c) : cls.delete(c); },
      contains: (c) => cls.has(c),
    },
    querySelectorAll: () => [],
    scrollTo: () => {},
  };
}

let domMap;

beforeEach(() => {
  domMap = {};
  vi.stubGlobal('document', {
    getElementById:   (id) => { if (!domMap[id]) domMap[id] = makeEl(); return domMap[id]; },
    querySelectorAll: ()   => [makeEl()],
  });
  state.isPaused = false;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('togglePause', () => {
  it('sets isPaused to true when currently false', () => {
    togglePause();
    expect(state.isPaused).toBe(true);
  });

  it('sets isPaused to false when currently true', () => {
    state.isPaused = true;
    togglePause();
    expect(state.isPaused).toBe(false);
  });

  it('updates pause button text to resume label when pausing', () => {
    togglePause();
    expect(domMap['pauseBtn'].textContent).toBe('▶ Continuar');
  });

  it('updates pause button text to pause label when resuming', () => {
    state.isPaused = true;
    togglePause();
    expect(domMap['pauseBtn'].textContent).toBe('⏸ Pausar');
  });
});

describe('setHeader', () => {
  it('sets headerSubtitle text', () => {
    setHeader('My Subtitle', 'BADGE');
    expect(domMap['headerSubtitle'].textContent).toBe('My Subtitle');
  });

  it('sets headerBadge text', () => {
    setHeader('My Subtitle', 'CLF-C02');
    expect(domMap['headerBadge'].textContent).toBe('CLF-C02');
  });
});

describe('showScreen', () => {
  it('adds active class to the target screen element', () => {
    showScreen('screenLevel');
    expect(domMap['screenLevel'].classList.contains('active')).toBe(true);
  });
});

describe('applyQuizFooter', () => {
  it('shows the quiz footer', () => {
    applyQuizFooter(false);
    expect(domMap['quizFooter'].style.display).toBe('block');
  });

  it('hides timer elements in free mode', () => {
    applyQuizFooter(true);
    expect(domMap['totalTimerBar'].style.display).toBe('none');
    expect(domMap['qTimerCard'].style.display).toBe('none');
  });

  it('shows timer elements in simulator mode', () => {
    applyQuizFooter(false);
    expect(domMap['totalTimerBar'].style.display).not.toBe('none');
  });

  it('shows back-to-list button in free mode', () => {
    applyQuizFooter(true);
    expect(domMap['btnBackToList'].style.display).toBe('block');
  });
});

describe('hideQuizFooter', () => {
  it('hides the quiz footer', () => {
    domMap['quizFooter'] = makeEl();
    domMap['quizFooter'].style.display = 'block';
    hideQuizFooter();
    expect(domMap['quizFooter'].style.display).toBe('none');
  });

  it('hides the total timer bar', () => {
    hideQuizFooter();
    expect(domMap['totalTimerBar'].style.display).toBe('none');
  });
});
