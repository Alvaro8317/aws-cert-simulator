import { loadQuestions } from './data.js';
import { togglePause } from './ui.js';
import { setTimerCallbacks } from './timer.js';
import { nextQuestion, prevQuestion, selectOption, confirmMultiAnswer, handleTimeout, setQuizCallbacks } from './quiz.js';
import { goToQuestionList, openFreeQuestion } from './list.js';
import { startSimulatorMode, startFreeMode, goToModeSelect } from './modes.js';
import { showResults, restartSameLevel, goToLevelSelect, finishEarly } from './results.js';

// ─── WIRE CALLBACKS ────────────────────────────────────────
setTimerCallbacks({ onQTimeout: handleTimeout, onExamTimeout: showResults });
setQuizCallbacks({ onShowResults: showResults, onGoToList: goToQuestionList });

// ─── STATIC BUTTON LISTENERS ──────────────────────────────
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('btnResume').addEventListener('click', togglePause);
document.getElementById('btnNext').addEventListener('click', nextQuestion);
document.getElementById('btnPrev').addEventListener('click', prevQuestion);
document.getElementById('btnNextNav').addEventListener('click', nextQuestion);
document.getElementById('btnFinishEarly').addEventListener('click', finishEarly);
document.getElementById('btnBackToList').addEventListener('click', goToQuestionList);
document.getElementById('btnModeSimulator').addEventListener('click', startSimulatorMode);
document.getElementById('btnModeFree').addEventListener('click', startFreeMode);
document.getElementById('btnModeBack').addEventListener('click', goToLevelSelect);
document.getElementById('btnListBack').addEventListener('click', goToModeSelect);
document.getElementById('btnRestart').addEventListener('click', restartSameLevel);
document.getElementById('btnChangeLevel').addEventListener('click', goToLevelSelect);
document.getElementById('btnConfirmMulti').addEventListener('click', confirmMultiAnswer);

// ─── DELEGATED LISTENERS ──────────────────────────────────
document.getElementById('optionsList').addEventListener('click', e => {
  const opt = e.target.closest('[data-letter]');
  if (opt) selectOption(opt.dataset.letter);
});

document.getElementById('questionListItems').addEventListener('click', e => {
  const item = e.target.closest('[data-idx]');
  if (item) openFreeQuestion(+item.dataset.idx);
});

// ─── INIT ─────────────────────────────────────────────────
loadQuestions();
