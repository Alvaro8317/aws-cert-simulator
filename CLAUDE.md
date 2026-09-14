# CLAUDE.md

Guía para trabajar en este repositorio.

## Sobre el proyecto

Simulador de exámenes de certificación AWS. App HTML/JS estática sin backend ni build step (se abre directo con `index.html` o un server estático). La lógica vive en módulos ES planos bajo `src/`, y las preguntas en `questions.json`.

- `src/` — módulos de la app (`quiz.js`, `state.js`, `timer.js`, `utils.js`, `ui.js`, etc.)
- `tests/` — tests con Vitest, un archivo por módulo (`utils.js` → `tests/utils.test.js`)
- `questions.json` — banco de preguntas por certificación

## Tests obligatorios para código nuevo

**Toda función nueva que se agregue a `src/` debe tener sus unit tests correspondientes en el mismo commit/PR.** No se considera terminada una tarea de código si falta el test.

Reglas concretas:

1. **Ninguna función exportada se agrega sin test.** Si creás o modificás una función en `src/algo.js`, agregá/actualizá `tests/algo.test.js` con casos para su comportamiento nuevo.
2. **Cubrí el caso feliz y al menos un edge case.** Mirá `tests/utils.test.js` como referencia de estilo: casos normales, arrays/valores vacíos, límites (0%, 100%, etc.).
3. **Funciones de lógica pura (cálculos, formateo, transformación de datos) son las que más importan testear** — son las más fáciles de romper sin darse cuenta y las más fáciles de testear sin mockear DOM.
4. **Si una función toca el DOM directamente** (manipulación de `document`, listeners, etc.), extraé la lógica pura a una función testeable aparte cuando sea razonable, en vez de dejar todo mezclado sin cobertura.
5. **Correr los tests antes de dar por terminada la tarea:**
   ```bash
   npm test        # modo watch
   npm run test:run  # una sola corrida (usar este antes de terminar)
   ```
6. **No mergear con tests rotos.** Si un cambio rompe un test existente, hay que arreglar el código o actualizar el test — nunca borrar el test para que pase.

## Estilo de tests

Seguí el patrón ya usado en `tests/*.test.js`:
- `describe` por función, `it` por caso de comportamiento.
- Nombres de test descriptivos en inglés (consistente con el resto de la suite), aunque el resto del proyecto esté en español.
- Import directo del módulo bajo test (`import { fn } from '../src/modulo.js'`), sin mocks innecesarios.

## Otras convenciones

- Las preguntas nuevas se agregan a `questions.json` siguiendo el schema documentado en `README.md` (id, text, options, answer, explanation).
- Mantené el español para textos de UI y contenido de preguntas; el código (nombres de función, variables) y los tests en inglés, consistente con lo existente.
