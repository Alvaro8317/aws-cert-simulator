import { state } from './state.js';
import { EXAM_MAX_SECONDS, Q_MAX_SECONDS } from './constants.js';
import { pad } from './utils.js';

let _onQTimeout    = null;
let _onExamTimeout = null;

export function setTimerCallbacks({ onQTimeout, onExamTimeout }) {
  _onQTimeout    = onQTimeout;
  _onExamTimeout = onExamTimeout;
}

export function startQTimer() {
  stopQTimer();
  state.qSecsLeft = Q_MAX_SECONDS;
  _updateQTimerUI();

  state.qTimerInterval = setInterval(() => {
    if (state.isPaused) return;
    state.qSecsLeft--;
    _updateQTimerUI();
    if (state.qSecsLeft <= 0) {
      stopQTimer();
      _onQTimeout?.();
    }
  }, 1000);
}

export function stopQTimer() {
  clearInterval(state.qTimerInterval);
  state.qTimerInterval = null;
}

export function resetTotalTimer() {
  clearTotalTimer();
  state.totalSecsLeft = EXAM_MAX_SECONDS;
  _updateTotalTimerUI();

  state.totalTimerInterval = setInterval(() => {
    if (state.isPaused) return;
    state.totalSecsLeft--;
    _updateTotalTimerUI();
    if (state.totalSecsLeft <= 0) {
      clearTotalTimer();
      _onExamTimeout?.();
    }
  }, 1000);
}

export function clearTotalTimer() {
  clearInterval(state.totalTimerInterval);
  state.totalTimerInterval = null;
}

function _updateQTimerUI() {
  const el     = document.getElementById('qTimerSecs');
  const bar    = document.getElementById('qTimerBar');
  const pct    = (state.qSecsLeft / Q_MAX_SECONDS) * 100;
  const urgent = state.qSecsLeft <= 10;
  el.textContent  = state.qSecsLeft;
  el.className    = 'q-timer-secs' + (urgent ? ' urgent' : '');
  bar.style.width = pct + '%';
  bar.className   = 'timer-bar-fill' + (urgent ? ' urgent' : '');
}

function _updateTotalTimerUI() {
  const h    = Math.floor(state.totalSecsLeft / 3600);
  const m    = Math.floor((state.totalSecsLeft % 3600) / 60);
  const s    = state.totalSecsLeft % 60;
  const str  = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  const el   = document.getElementById('totalTimerValue');
  const fill = document.getElementById('totalProgressFill');
  const pct  = (state.totalSecsLeft / EXAM_MAX_SECONDS) * 100;
  const warn = state.totalSecsLeft < 600;
  el.textContent   = str;
  el.className     = 'total-timer-value' + (warn ? ' warning' : '');
  fill.style.width = pct + '%';
  fill.className   = 'total-progress-fill' + (warn ? ' warning' : '');
}
