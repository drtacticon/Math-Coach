(() => {
  const base = new URL('../', document.currentScript.src);
  const body = document.body;
  const day = body.dataset.courseDay;
  const grade = body.dataset.courseGrade || '6';
  const home = new URL('grades/grade-6/', base);
  const active = sessionStorage.getItem('mc-teacher') === '1';
  const view = body.dataset.courseView;
  const assessments = new Set(['015','030','045','060','075','090','105','120','135','140']);
  const practice = n => new URL('practice/day-' + n + '.html', base).href;
  if (!active && view === 'assessment') {
    location.replace(practice(day));
    return;
  }
  document.documentElement.dataset.mode = active ? 'teacher' : 'student';
  const last = 'mc-teacher-last';
  const cookie = 'mc_resume';
  const record = () => {
    if (active && day && view !== 'landing') sessionStorage.setItem(last, JSON.stringify({grade,subject:'math',day,view}));
  };
  record();
  addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
  if (!active) {
    const route = (el, attr) => {
      const match = el.getAttribute(attr)?.match(/(?:^|\/)lessons\/day-(\d{3})\.html(?:#.*)?$|^day-(\d{3})\.html(?:#.*)?$/);
      if (match && !match[1]) match[1] = match[2];
      if (!match || !assessments.has(match[1])) return;
      el.setAttribute(attr, practice(match[1]));
      if (el.tagName === 'OPTION') el.textContent = 'Day ' + match[1] + ' · Practice Test';
      const title = el.querySelector('h4');
      if (title) {
        title.textContent = 'Practice Test';
        el.querySelector('.card-day span').textContent = 'Practice';
        el.dataset.search = match[1] + ' practice test';
      }
      if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Practice Test, Day ' + match[1]);
    };
    document.querySelectorAll('a[href], option[value]').forEach(el => route(el, el.tagName === 'OPTION' ? 'value' : 'href'));
    const resume = document.querySelector('[data-resume]');
    if (resume) new MutationObserver(() => route(resume,'href')).observe(resume,{attributes:true,attributeFilter:['href']});
  }
  document.querySelectorAll('[data-teacher-toggle]').forEach(button => {
    button.textContent = active ? 'Logout' : 'Teacher login';
    button.addEventListener('click', () => {
      if (active) {
        record();
        const saved = sessionStorage.getItem(last);
        if (saved) document.cookie = cookie + '=' + encodeURIComponent(saved) + '; Path=' + base.pathname + '; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
        sessionStorage.removeItem('mc-teacher');
        location.reload();
        return;
      }
      const dialog = document.querySelector('#teacher-login');
      dialog.showModal();
      dialog.querySelector('input').focus();
    });
  });
  const dialog = document.querySelector('#teacher-login');
  dialog?.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const input = dialog.querySelector('input');
    if (input.value !== '235711') {
      dialog.querySelector('[role=status]').textContent = 'That PIN did not match.';
      input.select();
      return;
    }
    sessionStorage.setItem('mc-teacher','1');
    try {
      const entry = document.cookie.split('; ').find(x => x.startsWith(cookie+'='));
      const saved = JSON.parse(decodeURIComponent(entry?.slice(cookie.length+1) || 'null'));
      if (saved?.subject === 'math' && /^[3-8]$/.test(saved.grade) && /^(000|0[0-9]{2}|1[0-3][0-9]|140)$/.test(saved.day)) {
        const path = saved.day === '000' ? 'grades/grade-' + saved.grade + '/#day-000' :
          saved.grade === '6' ? (saved.view === 'practice' ? 'practice/' : 'lessons/') + 'day-' + saved.day + '.html' : null;
        if (path) { location.assign(new URL(path,base)); return; }
      }
    } catch {}
    location.reload();
  });
  dialog?.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());
})();
