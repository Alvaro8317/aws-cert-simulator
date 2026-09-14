---
name: add-exam-question
description: Add a pasted AWS certification practice-exam question (English, with answer rationale) to questions.json in this repo — translating it naturally to Spanish, formatting it per this repo's schema, adding a light industry-flavor twist, and validating the result. Use whenever the user pastes an AWS exam-style question (enunciado + opciones + "why this is/would be (in)correct") and asks to add it to the quiz/simulator, for any certification level (Cloud Practitioner, AI Practitioner, Developer Associate, Solutions Architect Associate, Data Engineer Associate, or a new one).
---

# Add exam question

Takes one pasted AWS certification practice-exam question at a time and appends it to
`questions.json` in this repo, translated and formatted to match the existing dataset.

## Repo facts

- All questions live in `questions.json`, one `levels[]` entry per certification, each with
  `id`, `name`, `badge`, `code`, and a `questions[]` array.
- Question id prefixes seen so far: `cp` (Cloud Practitioner), `ai` (AI Practitioner), `dev`
  (Developer Associate), `saa` (Solutions Architect Associate), `de` (Data Engineer Associate).
  Confirm the actual prefix in use for the target level by reading a sample question id from that
  level before picking the next one — a new level should pick a short, unused prefix.
- `src/constants.js` has a `LEVEL_ICONS` map keyed by level `id`; `src/data.js` falls back to `🎯`
  for any level missing an entry, so a new level still renders fine without touching this file —
  but add a fitting emoji there anyway for a nicer level-select card.

## Per-question schema

```json
{
  "id": "xx###",
  "text": "...",
  "options": [
    { "letter": "A", "title": "...", "desc": "" },
    { "letter": "B", "title": "...", "desc": "" }
  ],
  "correct": "A",
  "explanation": "..."
}
```

- `options` has 4–6 entries (A–F as needed), `desc` is always `""` (unused in this dataset).
- `correct` is a single letter string for a normal question, or an array of letters
  (`["A", "C"]`) for a "Select TWO/THREE" question — the quiz UI (`src/quiz.js`) detects
  multi-select automatically via `Array.isArray(q.correct)` and shows "Selecciona N opciones".
- `explanation` is **one paragraph**, not a translated copy of the source's separate
  "why this is/would be correct/incorrect" blocks — write it fresh, covering why the correct
  option(s) are right and briefly why the others are not, in your own words.

## Workflow per pasted question

1. **Find the target level and next id.** Ask the user which level if unclear from context.
   Read the last question of that level in `questions.json` (e.g. `grep -n '"id": "de0' questions.json | tail -5`)
   to find the last used id number and increment it (zero-padded to match existing width, usually
   3 digits).
2. **Translate naturally**, not word-for-word. Reformulate sentences instead of mirroring the
   English syntax.
3. **Add a light industry-flavor twist** to the scenario: swap a generic "a company" for a specific,
   varied sector (insurance, healthcare, e-commerce, banking, telecom, logistics, airline,
   pharma, hotel chain, retail, gaming studio, government agency, agriculture, energy, media
   production, restaurant chain, digital marketing agency, etc.). Check the last handful of
   questions already added to that level (`grep -B2 '"text"' questions.json | tail -80` or read
   the tail of the file) and avoid repeating a sector used recently.
4. **If the question closely mirrors one already added** (same services, same shape of scenario),
   tweak a couple of non-essential details (a file format, a retention period, a secondary
   service name, a number) so it doesn't read as a re-skin — without changing the underlying
   correct answer or reasoning.
5. **Write the explanation** from scratch per the rules above.
6. **Insert the question** as the new last element of that level's `questions[]` array (Edit the
   closing `}` + `]` + `}` + `]` + `}` tail of the file, matching exact existing whitespace —
   read the tail first with `tail` or `Read` with an offset, since the `correct` array (when
   present) is pretty-printed across multiple lines, not inline).
7. **If this is a brand-new level** (not yet in `questions.json`): add a new `levels[]` entry
   with a sensible `id` (kebab-case), `name`, `badge` (`FOUNDATIONAL`/`ASSOCIATE`/`PROFESSIONAL`/
   `SPECIALTY` as appropriate), and the real AWS exam `code`; also add an emoji entry for it in
   `LEVEL_ICONS` in `src/constants.js`.
8. **Validate** after every single edit:
   ```bash
   python3 -c "import json; json.load(open('questions.json')); print('JSON válido')"
   npm run test:run
   ```
   Confirm the JSON parses and all tests still pass before moving on.
9. **Don't commit or push** unless the user explicitly asks. When asked, use the `commit` skill
   (and only push if separately requested).

## Notes

- Keep going question-by-question as the user pastes them — don't batch-ask for all of them
  up front.
- If the user interrupts with an unrelated question mid-flow, handle it, then resume numbering
  from wherever the file actually is (re-check the last id, don't assume from memory).
