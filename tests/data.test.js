import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../src/modes.js', () => ({
  selectLevel: vi.fn(),
}));

import { loadQuestions } from '../src/data.js';

function makeEl() {
  const cls = new Set();
  return {
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      add: (c) => cls.add(c),
      remove: (c) => cls.delete(c),
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('loadQuestions', () => {
  it('renders an error message when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    await loadQuestions();
    expect(domMap['screenLevel'].innerHTML).toContain('ERROR');
  });

  it('suggests running a local server in the error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    await loadQuestions();
    expect(domMap['screenLevel'].innerHTML).toContain('http.server');
  });

  it('renders a card for each level on success', async () => {
    const mockLevels = [
      { id: 'cloud-practitioner', name: 'Cloud Practitioner', code: 'CLF-C02', badge: '☁️', questions: [] },
      { id: 'developer-associate', name: 'Developer Associate', code: 'DVA-C02', badge: '💻', questions: [] },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ levels: mockLevels }),
    }));
    await loadQuestions();
    const html = domMap['levelList'].innerHTML;
    expect(html).toContain('Cloud Practitioner');
    expect(html).toContain('Developer Associate');
  });

  it('shows the question count for each level', async () => {
    const mockLevels = [
      {
        id: 'cloud-practitioner',
        name: 'Cloud Practitioner',
        code: 'CLF-C02',
        badge: '☁️',
        questions: new Array(65).fill({}),
      },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ levels: mockLevels }),
    }));
    await loadQuestions();
    expect(domMap['levelList'].innerHTML).toContain('65 preguntas');
  });

  it('uses the LEVEL_ICONS fallback emoji for unknown level ids', async () => {
    const mockLevels = [
      { id: 'unknown-cert', name: 'Unknown', code: 'UNK-01', badge: '?', questions: [] },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ levels: mockLevels }),
    }));
    await loadQuestions();
    expect(domMap['levelList'].innerHTML).toContain('🎯');
  });
});
