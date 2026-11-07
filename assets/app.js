(() => {
  const jump = document.querySelector('[data-jump]');
  if (jump) jump.addEventListener('change', () => { window.location.href = jump.value; });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
  const practice = document.querySelector('#practice');
  const lessonDay = document.querySelector('[data-day]');
  if (practice && practice.querySelector('.section-label')?.textContent.includes('PRACTICE')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'practice-help-button';
    button.textContent = 'Show a similar example';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'practice-help-dialog');
    practice.querySelector('h2').after(button);

    const dialog = document.createElement('dialog');
    dialog.id = 'practice-help-dialog';
    dialog.className = 'practice-help-dialog';
    dialog.setAttribute('aria-labelledby', 'practice-help-title');
    const header = document.createElement('div');
    header.className = 'practice-help-header';
    const heading = document.createElement('h2');
    heading.id = 'practice-help-title';
    heading.textContent = 'A similar question, step by step';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'practice-help-close';
    close.setAttribute('aria-label', 'Close example');
    close.textContent = '×';
    header.append(heading, close);
    const content = document.createElement('div');
    content.className = 'practice-help-content';
    dialog.append(header, content);
    document.body.append(dialog);
    let exampleData;
    let loading;
    const script = document.currentScript;
    const exampleUrl = new URL('practice-examples.json?v=practice-help-20261106', script.src);
    function paragraph(text, className) {
      const p = document.createElement('p');
      p.textContent = text;
      if (className) p.className = className;
      return p;
    }
    async function showExample() {
      dialog.showModal();
      document.body.classList.add('practice-help-open');
      close.focus();
      content.replaceChildren(paragraph('Loading your worked example…', 'practice-help-status'));
      content.setAttribute('aria-busy', 'true');
      try {
        if (!loading) loading = fetch(exampleUrl).then(response => {
          if (!response.ok) throw new Error('Example unavailable');
          return response.json();
        }).then(data => { exampleData = data; }).catch(error => { loading = null; throw error; });
        await loading;
        const example = exampleData[lessonDay.dataset.day];
        if (!example) throw new Error('Example missing');
        const label = paragraph('SIMILAR QUESTION · DIFFERENT NUMBERS OR CONTEXT', 'eyebrow');
        const question = paragraph(example.question, 'practice-help-question');
        const steps = document.createElement('ol');
        steps.className = 'practice-help-steps';
        for (const step of example.steps) {
          const li = document.createElement('li');
          li.textContent = step;
          steps.append(li);
        }
        const answer = paragraph(`Answer: ${example.answer}`, 'practice-help-answer');
        const tip = paragraph('Now use the same method on your classwork question.', 'practice-help-tip');
        content.replaceChildren(label, question, steps, answer, tip);
      } catch (_) {
        const retry = document.createElement('button');
        retry.type = 'button'; retry.className = 'practice-help-button'; retry.textContent = 'Try again';
        retry.addEventListener('click', () => { dialog.close(); showExample(); });
        content.replaceChildren(paragraph('The example could not load. Check your connection and try again.'), retry);
      } finally { content.removeAttribute('aria-busy'); }
    }
    button.addEventListener('click', showExample);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('practice-help-open');
      button.focus({ preventScroll: true });
    });
  }
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
