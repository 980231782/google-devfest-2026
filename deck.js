(function () {
  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const counter = document.getElementById('counter');
  const notesPanel = document.getElementById('notesPanel');
  const params = new URLSearchParams(location.search);
  const ALL = params.has('all');

  // Slide 7: 10x10 grid. Agent 37 finds the hole; 13 more follow, spreading outward.
  const grid = document.getElementById('grid7');
  const FIRST = 37;
  const FOLLOW = [36, 47, 27, 38, 46, 26, 48, 57, 16, 58, 35, 66, 25];
  for (let i = 0; i < 100; i++) grid.appendChild(document.createElement('b'));
  const cells = grid.children;
  function paintGrid(step) {
    for (const c of cells) { c.classList.remove('hot'); c.style.removeProperty('--d'); }
    if (step >= 1) cells[FIRST].classList.add('hot');
    if (step >= 2) FOLLOW.forEach((n, k) => {
      cells[n].style.setProperty('--d', (0.15 + k * 0.12) + 's');
      cells[n].classList.add('hot');
    });
  }

  function maxStep(s) {
    let m = 0;
    s.querySelectorAll('[data-step]').forEach(e => { m = Math.max(m, +e.dataset.step); });
    return m;
  }

  if (ALL) {
    document.body.classList.add('all');
    slides.forEach(s => {
      s.classList.add('in', 'active');
      for (let g = 1; g <= maxStep(s); g++) s.classList.add('g' + g);
    });
    paintGrid(2);
    for (const c of cells) c.style.removeProperty('--d');
    return;
  }

  function fit() {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    deck.style.transform = `translate(-50%, -50%) scale(${k})`;
  }
  addEventListener('resize', fit);
  fit();

  let cur = -1, step = 0;

  function setStep(s, n) {
    for (let g = 1; g <= 5; g++) s.classList.toggle('g' + g, g <= n);
    if (s.classList.contains('s7')) paintGrid(n);
  }

  function go(i, atEnd) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const prev = slides[cur];
    const next = slides[i];
    if (prev && prev !== next) {
      prev.classList.remove('active', 'in');
      prev.classList.add('leaving');
      setTimeout(() => prev.classList.remove('leaving'), 700);
    }
    cur = i;
    step = atEnd ? maxStep(next) : 0;
    setStep(next, step);
    next.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add('in')));
    counter.textContent = (i + 1) + ' / ' + slides.length;
    const n = next.querySelector('.notes');
    notesPanel.innerHTML = n ? n.innerHTML : '';
    history.replaceState(null, '', '#' + (i + 1));
  }

  function forward() {
    const s = slides[cur];
    if (step < maxStep(s)) { step++; setStep(s, step); }
    else if (cur < slides.length - 1) go(cur + 1);
  }
  function back() {
    const s = slides[cur];
    if (step > 0) { step--; setStep(s, step); }
    else if (cur > 0) go(cur - 1, true);
  }

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': case 'Enter':
        e.preventDefault(); forward(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); back(); break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1, true); break;
      case 'n': case 'N': document.body.classList.toggle('show-notes'); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        break;
    }
  });
  deck.addEventListener('click', e => {
    if (e.target.closest('.notes-panel')) return;
    (e.clientX < innerWidth / 3) ? back() : forward();
  });

  const start = parseInt(location.hash.slice(1), 10);
  go(Number.isFinite(start) ? start - 1 : 0);
})();
