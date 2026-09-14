import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
  'a', 'en', 'y', 'o', 'que', 'se', 'su', 'sus', 'es', 'son', 'con', 'para',
  'por', 'como', 'más', 'no', 'esta', 'este', 'esa', 'ese', 'lo', 'le',
]);

export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function wordSet(text) {
  return new Set(normalizeText(text).filter(w => !STOPWORDS.has(w)));
}

export function jaccardSimilarity(textA, textB) {
  const a = wordSet(textA);
  const b = wordSet(textB);
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function flattenQuestions(data) {
  const rows = [];
  for (const level of data.levels ?? []) {
    for (const q of level.questions ?? []) {
      rows.push({ ...q, levelId: level.id });
    }
  }
  return rows;
}

export function validateSchema(data) {
  const errors = [];

  if (!Array.isArray(data.levels)) {
    return ['El archivo debe tener un array `levels`.'];
  }

  const levelIds = new Set();
  for (const level of data.levels) {
    const loc = `level "${level.id ?? '?'}"`;
    if (!level.id) errors.push(`${loc}: falta "id".`);
    if (levelIds.has(level.id)) errors.push(`${loc}: id de nivel duplicado.`);
    levelIds.add(level.id);
    if (!level.name) errors.push(`${loc}: falta "name".`);
    if (!Array.isArray(level.questions)) {
      errors.push(`${loc}: falta el array "questions".`);
      continue;
    }

    for (const q of level.questions) {
      const qloc = `${loc} / pregunta "${q.id ?? '?'}"`;
      if (!q.id) errors.push(`${qloc}: falta "id".`);
      if (!q.text || typeof q.text !== 'string') errors.push(`${qloc}: falta "text".`);
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push(`${qloc}: falta "explanation".`);
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${qloc}: "options" debe tener al menos 2 elementos.`);
        continue;
      }

      const letters = new Set();
      for (const opt of q.options) {
        if (!opt.letter) errors.push(`${qloc}: opción sin "letter".`);
        if (letters.has(opt.letter)) errors.push(`${qloc}: letra de opción duplicada "${opt.letter}".`);
        letters.add(opt.letter);
        if (!opt.title) errors.push(`${qloc}: opción "${opt.letter}" sin "title".`);
      }

      const correctLetters = Array.isArray(q.correct) ? q.correct : [q.correct];
      if (correctLetters.length === 0 || correctLetters.some(c => !c)) {
        errors.push(`${qloc}: falta "correct".`);
      } else {
        for (const c of correctLetters) {
          if (!letters.has(c)) {
            errors.push(`${qloc}: "correct" referencia la letra "${c}" que no existe en "options".`);
          }
        }
      }
    }
  }

  return errors;
}

export function findDuplicateIds(rows) {
  const seen = new Map();
  const duplicates = [];
  for (const q of rows) {
    if (seen.has(q.id)) {
      duplicates.push({ id: q.id, levels: [seen.get(q.id), q.levelId] });
    } else {
      seen.set(q.id, q.levelId);
    }
  }
  return duplicates;
}

export function findExactTextDuplicates(rows) {
  const seen = new Map();
  const duplicates = [];
  for (const q of rows) {
    const key = normalizeText(q.text).join(' ');
    if (seen.has(key)) {
      duplicates.push({ a: seen.get(key), b: q });
    } else {
      seen.set(key, q);
    }
  }
  return duplicates;
}

export function findNearDuplicates(rows, threshold = 0.65) {
  const pairs = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const score = jaccardSimilarity(rows[i].text, rows[j].text);
      if (score >= threshold) {
        pairs.push({ a: rows[i], b: rows[j], score });
      }
    }
  }
  return pairs.sort((a, b) => b.score - a.score);
}

function main() {
  const path = process.argv[2] ?? 'questions.json';
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  const rows = flattenQuestions(data);

  let hasErrors = false;

  const schemaErrors = validateSchema(data);
  if (schemaErrors.length > 0) {
    hasErrors = true;
    console.log(`\n❌ Errores de esquema (${schemaErrors.length}):`);
    for (const e of schemaErrors) console.log(`  - ${e}`);
  }

  const dupIds = findDuplicateIds(rows);
  if (dupIds.length > 0) {
    hasErrors = true;
    console.log(`\n❌ IDs duplicados (${dupIds.length}):`);
    for (const d of dupIds) console.log(`  - "${d.id}" (niveles: ${d.levels.join(', ')})`);
  }

  const exactDups = findExactTextDuplicates(rows);
  if (exactDups.length > 0) {
    hasErrors = true;
    console.log(`\n❌ Preguntas con texto idéntico (${exactDups.length}):`);
    for (const d of exactDups) {
      console.log(`  - "${d.a.id}" (${d.a.levelId}) === "${d.b.id}" (${d.b.levelId})`);
    }
  }

  const nearDups = findNearDuplicates(rows);
  if (nearDups.length > 0) {
    console.log(`\n⚠️  Posibles duplicados a revisar manualmente (${nearDups.length}):`);
    for (const d of nearDups) {
      console.log(`  - "${d.a.id}" (${d.a.levelId}) ~ "${d.b.id}" (${d.b.levelId}) — similitud ${(d.score * 100).toFixed(0)}%`);
    }
  }

  if (!hasErrors && nearDups.length === 0) {
    console.log('\n✅ Sin errores ni duplicados detectados.');
  }

  console.log(`\nTotal de preguntas analizadas: ${rows.length}`);

  process.exitCode = hasErrors ? 1 : 0;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
