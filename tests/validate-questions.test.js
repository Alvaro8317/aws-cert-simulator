import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  jaccardSimilarity,
  flattenQuestions,
  validateSchema,
  findDuplicateIds,
  findExactTextDuplicates,
  findNearDuplicates,
} from '../scripts/validate-questions.js';

describe('normalizeText', () => {
  it('lowercases and strips accents and punctuation', () => {
    expect(normalizeText('¿Qué servicio, cuál más rápido?')).toEqual([
      'que', 'servicio', 'cual', 'mas', 'rapido',
    ]);
  });

  it('collapses extra whitespace', () => {
    expect(normalizeText('  hola   mundo  ')).toEqual(['hola', 'mundo']);
  });
});

describe('jaccardSimilarity', () => {
  it('returns 1 for identical text', () => {
    expect(jaccardSimilarity('Amazon S3 almacena objetos', 'Amazon S3 almacena objetos')).toBe(1);
  });

  it('returns 0 for completely different text', () => {
    expect(jaccardSimilarity('gatos perros', 'coches aviones')).toBe(0);
  });

  it('returns a partial score for overlapping text', () => {
    const score = jaccardSimilarity(
      'Una empresa necesita almacenar archivos en AWS',
      'Una empresa necesita almacenar backups en Azure',
    );
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('ignores common stopwords when comparing', () => {
    const score = jaccardSimilarity('el gato de la casa', 'un gato en la casa');
    expect(score).toBe(1);
  });
});

describe('flattenQuestions', () => {
  it('flattens all levels into a single array tagged with levelId', () => {
    const data = {
      levels: [
        { id: 'lvl1', questions: [{ id: 'a1' }, { id: 'a2' }] },
        { id: 'lvl2', questions: [{ id: 'b1' }] },
      ],
    };
    const rows = flattenQuestions(data);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({ id: 'a1', levelId: 'lvl1' });
    expect(rows[2]).toEqual({ id: 'b1', levelId: 'lvl2' });
  });

  it('returns an empty array when there are no levels', () => {
    expect(flattenQuestions({})).toEqual([]);
  });
});

function baseQuestion(overrides = {}) {
  return {
    id: 'cp001',
    text: 'Enunciado de prueba',
    options: [
      { letter: 'A', title: 'Opción A' },
      { letter: 'B', title: 'Opción B' },
    ],
    correct: 'A',
    explanation: 'Explicación de prueba',
    ...overrides,
  };
}

describe('validateSchema', () => {
  it('returns no errors for a well-formed dataset', () => {
    const data = { levels: [{ id: 'cp', name: 'Cloud Practitioner', questions: [baseQuestion()] }] };
    expect(validateSchema(data)).toEqual([]);
  });

  it('flags a missing "text" field', () => {
    const data = { levels: [{ id: 'cp', name: 'CP', questions: [baseQuestion({ text: '' })] }] };
    expect(validateSchema(data)).toEqual(
      expect.arrayContaining([expect.stringContaining('falta "text"')]),
    );
  });

  it('flags a "correct" letter that does not exist in options', () => {
    const data = { levels: [{ id: 'cp', name: 'CP', questions: [baseQuestion({ correct: 'Z' })] }] };
    expect(validateSchema(data)).toEqual(
      expect.arrayContaining([expect.stringContaining('referencia la letra "Z"')]),
    );
  });

  it('accepts a multi-select "correct" array when all letters exist', () => {
    const data = {
      levels: [{
        id: 'cp',
        name: 'CP',
        questions: [baseQuestion({
          options: [
            { letter: 'A', title: 'A' },
            { letter: 'B', title: 'B' },
            { letter: 'C', title: 'C' },
          ],
          correct: ['A', 'C'],
        })],
      }],
    };
    expect(validateSchema(data)).toEqual([]);
  });

  it('flags duplicate option letters', () => {
    const data = {
      levels: [{
        id: 'cp',
        name: 'CP',
        questions: [baseQuestion({
          options: [
            { letter: 'A', title: 'A' },
            { letter: 'A', title: 'A2' },
          ],
        })],
      }],
    };
    expect(validateSchema(data)).toEqual(
      expect.arrayContaining([expect.stringContaining('letra de opción duplicada')]),
    );
  });

  it('flags a "levels" that is not an array', () => {
    expect(validateSchema({})).toEqual(
      expect.arrayContaining([expect.stringContaining('debe tener un array')]),
    );
  });
});

describe('findDuplicateIds', () => {
  it('detects an id reused across levels', () => {
    const rows = [
      { id: 'cp001', levelId: 'cp' },
      { id: 'de001', levelId: 'de' },
      { id: 'cp001', levelId: 'saa' },
    ];
    const dups = findDuplicateIds(rows);
    expect(dups).toEqual([{ id: 'cp001', levels: ['cp', 'saa'] }]);
  });

  it('returns an empty array when all ids are unique', () => {
    const rows = [{ id: 'cp001', levelId: 'cp' }, { id: 'cp002', levelId: 'cp' }];
    expect(findDuplicateIds(rows)).toEqual([]);
  });
});

describe('findExactTextDuplicates', () => {
  it('matches text that only differs in case, accents or punctuation', () => {
    const rows = [
      { id: 'cp001', levelId: 'cp', text: '¿Qué servicio es más rápido?' },
      { id: 'cp002', levelId: 'cp', text: 'que servicio es mas rapido' },
    ];
    const dups = findExactTextDuplicates(rows);
    expect(dups).toHaveLength(1);
    expect(dups[0].a.id).toBe('cp001');
    expect(dups[0].b.id).toBe('cp002');
  });

  it('returns an empty array when no text repeats', () => {
    const rows = [
      { id: 'cp001', levelId: 'cp', text: 'Pregunta uno' },
      { id: 'cp002', levelId: 'cp', text: 'Pregunta dos' },
    ];
    expect(findExactTextDuplicates(rows)).toEqual([]);
  });
});

describe('findNearDuplicates', () => {
  it('flags a pair above the similarity threshold', () => {
    const rows = [
      { id: 'cp001', levelId: 'cp', text: 'Una empresa necesita almacenar archivos grandes en AWS de forma duradera' },
      { id: 'cp002', levelId: 'cp', text: 'Una empresa necesita almacenar archivos grandes en AWS de forma económica' },
    ];
    const pairs = findNearDuplicates(rows, 0.5);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].score).toBeGreaterThanOrEqual(0.5);
  });

  it('does not flag pairs below the threshold', () => {
    const rows = [
      { id: 'cp001', levelId: 'cp', text: 'Amazon S3 almacena objetos' },
      { id: 'cp002', levelId: 'cp', text: 'AWS Lambda ejecuta funciones sin servidor' },
    ];
    expect(findNearDuplicates(rows, 0.5)).toEqual([]);
  });

  it('sorts results by descending similarity', () => {
    const rows = [
      { id: 'a', levelId: 'cp', text: 'uno dos tres cuatro cinco' },
      { id: 'b', levelId: 'cp', text: 'uno dos tres cuatro seis' },
      { id: 'c', levelId: 'cp', text: 'uno dos tres siete ocho' },
    ];
    const pairs = findNearDuplicates(rows, 0.1);
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i - 1].score).toBeGreaterThanOrEqual(pairs[i].score);
    }
  });
});
