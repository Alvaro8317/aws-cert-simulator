import { state } from './state.js';
import { showScreen, applyQuizFooter, hideQuizFooter } from './ui.js';
import { renderQuestion } from './quiz.js';
import { stopQTimer } from './timer.js';

export function renderQuestionList() {
  const correct   = state.answered.filter(a => a?.correct).length;
  const answeredN = state.answered.filter(a => a !== null).length;
  document.getElementById('qListSubtitle').textContent =
    `${state.questions.length} preguntas · ${answeredN} respondidas · ${correct} correctas`;

  document.getElementById('questionListItems').innerHTML = state.questions.map((q, i) => {
    const ans = state.answered[i];
    let cls = '', icon = '○', iconColor = 'var(--text-muted)';
    if (ans !== null) {
      if (ans.correct) { cls = 'q-correct'; icon = '✓'; iconColor = 'var(--green)'; }
      else             { cls = 'q-wrong';   icon = '✗'; iconColor = 'var(--red)'; }
    }
    const preview = q.text.length > 90 ? q.text.slice(0, 90) + '…' : q.text;
    return `
      <div class="q-list-item ${cls}" data-idx="${i}">
        <span class="q-list-num">#${i + 1}</span>
        <span class="q-list-text">${preview}</span>
        <span class="q-list-status" style="color:${iconColor}">${icon}</span>
      </div>`;
  }).join('');
}

export function openFreeQuestion(idx) {
  state.qIndex = idx;
  applyQuizFooter(true);
  showScreen('screenQuiz');
  renderQuestion();
}

export function goToQuestionList() {
  stopQTimer();
  hideQuizFooter();
  showScreen('screenQuestionList');
  renderQuestionList();
}
