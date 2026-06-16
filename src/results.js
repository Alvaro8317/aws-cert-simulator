import { state } from './state.js';
import { PASS_THRESHOLD, EXAM_MAX_SECONDS } from './constants.js';
import { showScreen, setHeader, hideQuizFooter } from './ui.js';
import { stopQTimer, clearTotalTimer } from './timer.js';
import { calcScore, pad } from './utils.js';
import { initLevel } from './modes.js';

export function showResults() {
  stopQTimer();
  clearTotalTimer();
  state.isPaused = false;
  document.getElementById('pausedOverlay').classList.remove('show');

  const { correct, wrong, timeouts, pct } = calcScore(state.answered, state.questions.length);
  const total    = state.questions.length;
  const pass     = pct / 100 >= PASS_THRESHOLD;
  const usedSecs = EXAM_MAX_SECONDS - state.totalSecsLeft;

  document.getElementById('scorePercent').textContent   = pct + '%';
  document.getElementById('scoreCorrectOf').textContent = `${correct} de ${total} correctas`;
  document.getElementById('scoreVerdict').innerHTML     = pass
    ? '<div class="score-pass">APROBADO ✓</div>'
    : '<div class="score-fail">REPROBADO ✗</div>';
  document.getElementById('statsCorrect').textContent  = correct;
  document.getElementById('statsWrong').textContent    = wrong;
  document.getElementById('statsTimeout').textContent  = timeouts;

  const hh = Math.floor(usedSecs / 3600);
  const mm = Math.floor((usedSecs % 3600) / 60);
  const ss = usedSecs % 60;
  document.getElementById('statsTime').textContent = hh > 0
    ? `${hh}:${pad(mm)}:${pad(ss)}`
    : `${pad(mm)}:${pad(ss)}`;

  hideQuizFooter();
  showScreen('screenResults');
}

export function restartSameLevel() {
  state.freeMode = false;
  initLevel(true);
}

export function goToLevelSelect() {
  stopQTimer();
  clearTotalTimer();
  state.freeMode = false;
  state.isPaused = false;
  document.getElementById('pausedOverlay').classList.remove('show');
  hideQuizFooter();
  setHeader('Simulador de Certificaciones', 'SIMULATOR');
  showScreen('screenLevel');
}

export function finishEarly() {
  if (confirm('¿Finalizar el examen ahora?')) showResults();
}
