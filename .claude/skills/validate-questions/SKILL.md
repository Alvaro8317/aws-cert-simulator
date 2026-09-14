---
name: validate-questions
description: Validate questions.json in this repo for schema errors and duplicate/near-duplicate questions using scripts/validate-questions.js. Use whenever the user asks to check, validate, lint, or find duplicates in questions.json or "the question bank"/"las preguntas", or after bulk edits to questions.json (e.g. adding several questions in a row).
---

# Validate questions

Runs the repo's question-bank validator against `questions.json` and reports findings —
it does not modify the file on its own.

## What it checks

`scripts/validate-questions.js` (pure functions covered by `tests/validate-questions.test.js`):

1. **Schema errors** (hard failures, exit code 1): missing `id`/`text`/`explanation`, fewer than
   2 options, an option missing `letter`/`title`, duplicate option letters within a question, or
   `correct` referencing a letter that doesn't exist in `options`.
2. **Duplicate ids**: the same question `id` used more than once (even across different levels).
3. **Exact text duplicates**: questions whose `text` is identical once lowercased, accent-stripped,
   and stripped of punctuation.
4. **Near-duplicates** (soft warning, does not fail the run): question pairs whose text has a
   Jaccard word-similarity ≥ 0.65 after removing Spanish stopwords — likely re-skins of the same
   scenario that need a human look, not necessarily an error.

## Workflow

1. Run it:
   ```bash
   npm run validate:questions
   ```
   or directly: `node scripts/validate-questions.js`.
2. **Hard errors (❌ schema errors, duplicate ids, exact text duplicates)**: fix `questions.json`
   directly — correct the schema issue, or remove/merge the duplicate — then re-run the validator
   until it's clean.
3. **Soft warnings (⚠️ possible duplicates)**: read both questions named in the pair and decide:
   - If they're genuinely the same question (same services, same underlying answer) re-skinned →
     tell the user and ask whether to remove one or diversify it further (see the `add-exam-question`
     skill's guidance on varying industry/scenario details).
   - If they're legitimately different questions that happen to share vocabulary (e.g. two S3
     questions with different correct answers) → no action needed, just mention it was reviewed.
   Don't delete or merge questions without the user's confirmation — this list is a lead for a
   human/Claude review, not an auto-fix.
4. After any edit to `questions.json`, also run `npm run test:run` — some tests may assert on
   question counts per level.

## Notes

- The validator reads `questions.json` at the repo root by default; pass a path as the first CLI
  arg to point it at a different file if needed (`node scripts/validate-questions.js path/to/file.json`).
- If you change the duplicate-detection logic or thresholds, update
  `tests/validate-questions.test.js` in the same change — per this repo's `CLAUDE.md`, new/changed
  functions need test coverage before the task is done.
- The 0.65 similarity threshold is a starting point tuned by hand, not a hard spec — if it's too
  noisy (flags clearly-different questions) or too loose (misses real duplicates the user points
  out), adjust it in `scripts/validate-questions.js` and mention the change to the user.
