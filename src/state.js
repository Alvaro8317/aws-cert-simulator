export const state = {
  questions:    [],
  currentLevel: null,
  qIndex:       0,
  answered:     [],
  revealed:     [],
  freeMode:     false,
  isPaused:     false,
  qSecsLeft:    60,
  totalSecsLeft: 90 * 60,
  qTimerInterval:     null,
  totalTimerInterval: null,
};
