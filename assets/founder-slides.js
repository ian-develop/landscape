(() => {
  const root = document.documentElement;
  const panel = document.getElementById('sec-about');
  const masthead = document.querySelector('.masthead');
  const nav = document.querySelector('.founder-slide-nav');
  const mobile = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let slides = [], buttons = [], frame = 0;
  function update() {
    frame = 0;
    const active = panel.classList.contains('active');
    const dialogOpen = !!document.querySelector('.modal-overlay.open, .search-overlay.open');
    root.classList.toggle('founder-slides-active', active && !dialogOpen);
    nav.hidden = !active || dialogOpen;
    if (!active) return;
    const headerBottom = masthead.getBoundingClientRect().bottom;
    const marker = headerBottom + Math.min(140, (window.innerHeight - headerBottom) * .25);
    let current = 0;
    slides.forEach((slide, index) => { if (slide.getBoundingClientRect().top <= marker) current = index; });
    buttons.forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function go(index) {
    const slide = slides[index];
    const top = slide.getBoundingClientRect().top + window.scrollY - masthead.getBoundingClientRect().height;
    window.scrollTo({top: Math.max(0, top), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
  function rebuild() {
    const first = mobile.matches ? ['founder-investments', 'founder-welcome'] : ['founder-introduction'];
    const intro = document.getElementById('founder-introduction');
    const leading = document.getElementById(mobile.matches ? 'founder-investments' : 'founder-welcome');
    if (intro.firstElementChild !== leading) intro.prepend(leading);
    slides = [...first, 'founder-partnership', 'founder-people', 'founder-values', 'founder-latest'].map(id => document.getElementById(id));
    nav.replaceChildren();
    buttons = slides.map((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'founder-slide-dot';
      button.setAttribute('aria-label', `${index + 1}. ${slide.dataset.slideLabel}`);
      button.setAttribute('aria-controls', slide.id);
      const label = document.createElement('span');
      label.className = 'founder-slide-label';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = slide.dataset.slideLabel;
      button.append(label);
      button.addEventListener('click', () => go(index));
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowDown') next = Math.min(index + 1, slides.length - 1);
        else if (event.key === 'ArrowUp') next = Math.max(index - 1, 0);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = slides.length - 1;
        else return;
        event.preventDefault();
        buttons[next].focus({preventScroll:true});
        go(next);
      });
      nav.append(button);
      return button;
    });
    schedule();
  }
  new ResizeObserver(() => {
    root.style.setProperty('--masthead-height', `${Math.ceil(masthead.getBoundingClientRect().height)}px`);
    schedule();
  }).observe(masthead);
  const observer = new MutationObserver(schedule);
  [panel, document.getElementById('modal-overlay'), document.getElementById('search-overlay')].forEach(element => {
    if (element) observer.observe(element, {attributes:true, attributeFilter:['class']});
  });
  const latest = document.querySelector('.lt-list');
  const latestButton = document.querySelector('[data-action="latest-toggle"]');
  if (latest && latestButton) {
    const syncLatest = () => { latestButton.setAttribute('aria-expanded', String(latest.classList.contains('open'))); schedule(); };
    new MutationObserver(syncLatest).observe(latest, {attributes:true, attributeFilter:['class']});
    syncLatest();
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  mobile.addEventListener('change', rebuild);
  rebuild();
})();
