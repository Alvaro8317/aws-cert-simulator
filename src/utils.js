export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

export function calcScore(answered, total) {
  const correct  = answered.filter(a => a?.correct).length;
  const wrong    = answered.filter(a => a && !a.correct && !a.timeout).length;
  const timeouts = answered.filter(a => a?.timeout).length;
  const pct      = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { total, correct, wrong, timeouts, pct };
}
