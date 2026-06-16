import { state } from './state.js';
import { shuffle } from './utils.js';
import { showScreen, setHeader, applyQuizFooter, hideQuizFooter } from './ui.js';
import { startQTimer, stopQTimer, resetTotalTimer } from './timer.js';
import { renderQuestion } from './quiz.js';
import { renderQuestionList } from './list.js';

export function selectLevel(level) {
  state.currentLevel = level;
  document.getElementById('modeSelectName').textContent = level.name.toUpperCase();
  showScreen('screenModeSelect');
}

export function goToModeSelect() {
  stopQTimer();
  hideQuizFooter();
  showScreen('screenModeSelect');
}

export function startSimulatorMode() {
  state.freeMode = false;
  initLevel(true);
}

export function startFreeMode() {
  state.freeMode  = true;
  state.questions = [...state.currentLevel.questions];
  state.qIndex    = 0;
  state.answered  = new Array(state.questions.length).fill(null);
  state.revealed  = new Array(state.questions.length).fill(false);

  setHeader(state.currentLevel.name, `${state.currentLevel.badge} · ${state.currentLevel.code}`);
  document.getElementById('qListTitle').textContent = state.currentLevel.name.toUpperCase();

  showScreen('screenQuestionList');
  renderQuestionList();
}

export function initLevel(doShuffle) {
  const level = state.currentLevel;
  state.questions = doShuffle ? shuffle([...level.questions]) : [...level.questions];
  state.qIndex    = 0;
  state.answered  = new Array(state.questions.length).fill(null);
  state.revealed  = new Array(state.questions.length).fill(false);
  state.isPaused  = false;

  setHeader(level.name, `${level.badge} · ${level.code}`);
  applyQuizFooter(false);
  resetTotalTimer();
  showScreen('screenQuiz');
  renderQuestion();
  startQTimer();
}
