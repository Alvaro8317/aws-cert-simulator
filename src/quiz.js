import { state } from './state.js';
import { startQTimer, stopQTimer } from './timer.js';
import { scrollToTop } from './ui.js';

let _onShowResults = null;
let _onGoToList    = null;

export function setQuizCallbacks({ onShowResults, onGoToList }) {
  _onShowResults = onShowResults;
  _onGoToList    = onGoToList;
}

export function renderQuestion() {
  const q      = state.questions[state.qIndex];
  const total  = state.questions.length;
  const isLast = state.qIndex === total - 1;

  document.getElementById('questionLabel').textContent = `PREGUNTA ${state.qIndex + 1} DE ${total}`;
  document.getElementById('questionId').textContent    = q.id ?? '';
  document.getElementById('questionText').textContent  = q.text;
  document.getElementById('footerInfo').textContent    = `Pregunta ${state.qIndex + 1} de ${total}`;

  document.getElementById('optionsList').innerHTML = q.options.map(opt => `
    <div class="option" id="opt${opt.letter}" data-letter="${opt.letter}">
      <div class="option-header">
        <span class="option-letter" id="ltr${opt.letter}">${opt.letter}</span>
        <span class="option-title">${opt.title}</span>
      </div>
      <div class="option-desc">${opt.desc}</div>
    </div>
  `).join('');

  document.getElementById('timeoutBanner').classList.remove('show');
  document.getElementById('explanationCard').classList.remove('show');

  const btnNext = document.getElementById('btnNext');
  btnNext.style.display = 'none';
  btnNext.textContent   = (state.freeMode && isLast) ? 'Volver al listado →' : 'Siguiente pregunta →';

  if (state.answered[state.qIndex] !== null) {
    applyAnswerState(state.qIndex);
    if (state.revealed[state.qIndex]) {
      document.getElementById('explanationCard').classList.add('show');
      document.getElementById('explanationText').textContent = q.explanation;
    }
    btnNext.style.display = 'block';
  }

  document.getElementById('btnPrev').disabled    = state.qIndex === 0;
  document.getElementById('btnNextNav').disabled = state.answered[state.qIndex] === null;

  scrollToTop();
}

export function selectOption(letter) {
  if (state.answered[state.qIndex] !== null) return;
  if (state.isPaused) return;

  const q         = state.questions[state.qIndex];
  const isCorrect = letter === q.correct;
  state.answered[state.qIndex] = { selected: letter, correct: isCorrect, timeout: false };
  state.revealed[state.qIndex] = true;

  stopQTimer();
  applyAnswerState(state.qIndex);
  showExplanation();

  document.getElementById('btnNext').style.display = 'block';
  document.getElementById('btnNextNav').disabled   = false;
}

export function applyAnswerState(idx) {
  const q   = state.questions[idx];
  const ans = state.answered[idx];
  if (!ans) return;

  q.options.forEach(opt => {
    const el = document.getElementById('opt' + opt.letter);
    if (!el) return;
    el.classList.add('disabled');
    if (opt.letter === q.correct) {
      el.classList.add('correct');
      el.querySelector('.option-letter').textContent = opt.letter + ' ✓';
    } else if (ans.selected === opt.letter && !ans.correct) {
      el.classList.add('wrong');
      el.querySelector('.option-letter').textContent = opt.letter + ' ✗';
    }
  });

  if (ans.timeout) document.getElementById('timeoutBanner').classList.add('show');
  document.getElementById('btnNext').style.display = 'block';
  document.getElementById('btnNextNav').disabled   = false;
}

export function showExplanation() {
  const q = state.questions[state.qIndex];
  document.getElementById('explanationText').textContent = q.explanation;
  document.getElementById('explanationCard').classList.add('show');
}

export function handleTimeout() {
  if (state.answered[state.qIndex] !== null) return;
  state.answered[state.qIndex] = { selected: null, correct: false, timeout: true };
  state.revealed[state.qIndex] = true;
  applyAnswerState(state.qIndex);
  showExplanation();
  document.getElementById('btnNextNav').disabled = false;
}

export function nextQuestion() {
  if (state.qIndex < state.questions.length - 1) {
    state.qIndex++;
    renderQuestion();
    if (!state.freeMode && state.answered[state.qIndex] === null) startQTimer();
  } else {
    if (state.freeMode) _onGoToList?.();
    else _onShowResults?.();
  }
}

export function prevQuestion() {
  if (state.qIndex > 0) {
    stopQTimer();
    state.qIndex--;
    renderQuestion();
    if (!state.freeMode && state.answered[state.qIndex] === null) startQTimer();
  }
}
