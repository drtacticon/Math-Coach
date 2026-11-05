(() => {
  const jump = document.querySelector('[data-jump]');
  if (jump) jump.addEventListener('change', () => { window.location.href = jump.value; });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
  const day = document.querySelector('[data-day]');
  try {
    if (day) localStorage.setItem('math-coach-day', day.dataset.day);
    const saved = Number(localStorage.getItem('math-coach-day'));
    const resume = document.querySelector('[data-resume]');
    if (resume && Number.isInteger(saved) && saved >= 1 && saved <= 140) {
      resume.href = `lessons/day-${String(saved).padStart(3, '0')}.html#lesson-top`;
      resume.textContent = `Continue Day ${String(saved).padStart(3, '0')} →`;
      resume.hidden = false;
    }
  } catch (_) { /* Navigation works without browser storage. */ }
  const search = document.querySelector('#lesson-search');
  const unit = document.querySelector('#unit-filter');
  if (!search || !unit) return;
  const cards = [...document.querySelectorAll('[data-lesson]')];
  const groups = [...document.querySelectorAll('.unit-block')];
  function filter() {
    const query = search.value.trim().toLowerCase(); let visible = 0;
    groups.forEach(group => {
      let matches = 0;
      group.querySelectorAll('[data-lesson]').forEach(card => {
        const show = (unit.value === 'all' || group.dataset.unit === unit.value) && card.dataset.search.includes(query);
        card.hidden = !show; if (show) { visible++; matches++; }
      });
      group.hidden = matches === 0;
    });
    document.querySelector('[data-search-status]').textContent = `Showing ${visible} of 140 days`;
    document.querySelector('[data-empty]').hidden = visible !== 0;
  }
  search.addEventListener('input', filter); unit.addEventListener('change', filter);
})();
