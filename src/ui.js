import { state } from './state.js';

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  scrollToTop();
}

export function scrollToTop() {
  document.getElementById('mainContent').scrollTo({ top: 0, behavior: 'smooth' });
}

export function togglePause() {
  state.isPaused = !state.isPaused;
  const btn     = document.getElementById('pauseBtn');
  const overlay = document.getElementById('pausedOverlay');
  btn.textContent = state.isPaused ? '▶ Continuar' : '⏸ Pausar';
  btn.classList.toggle('paused', state.isPaused);
  overlay.classList.toggle('show', state.isPaused);
}

export function setHeader(subtitle, badge) {
  document.getElementById('headerSubtitle').textContent = subtitle;
  document.getElementById('headerBadge').textContent    = badge;
}

export function applyQuizFooter(freeMode) {
  document.getElementById('quizFooter').style.display     = 'block';
  document.getElementById('totalTimerBar').style.display  = freeMode ? 'none' : 'flex';
  document.getElementById('qTimerCard').style.display     = freeMode ? 'none' : '';
  document.getElementById('pauseBtn').style.display       = freeMode ? 'none' : '';
  document.getElementById('btnFinishEarly').style.display = freeMode ? 'none' : '';
  document.getElementById('btnBackToList').style.display  = freeMode ? 'block' : 'none';
}

export function hideQuizFooter() {
  document.getElementById('quizFooter').style.display    = 'none';
  document.getElementById('totalTimerBar').style.display = 'none';
}
