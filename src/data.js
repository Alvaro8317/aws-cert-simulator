import { LEVEL_ICONS } from './constants.js';
import { selectLevel } from './modes.js';

let _levels = [];

export async function loadQuestions() {
  try {
    const r    = await fetch('questions.json');
    const data = await r.json();
    _renderLevelSelect(data.levels);
  } catch (e) {
    document.getElementById('screenLevel').innerHTML =
      '<div class="welcome-card"><h2 style="color:var(--red)">ERROR</h2>' +
      '<p style="color:#ccc">No se pudo cargar questions.json. ' +
      'Usa un servidor local: <code>python3 -m http.server</code></p></div>';
  }
}

function _renderLevelSelect(levels) {
  _levels = levels;
  const list = document.getElementById('levelList');
  list.innerHTML = levels.map((l, i) => `
    <div class="level-card" data-idx="${i}">
      <div class="level-icon">${LEVEL_ICONS[l.id] || '🎯'}</div>
      <div class="level-info">
        <div class="level-name">${l.name}</div>
        <div class="level-meta">${l.code} · ${l.questions.length} preguntas</div>
      </div>
      <div class="level-badge">${l.badge}</div>
    </div>
  `).join('');

  list.addEventListener('click', e => {
    const card = e.target.closest('[data-idx]');
    if (card) selectLevel(_levels[+card.dataset.idx]);
  });
}
