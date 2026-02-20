document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => links.classList.toggle('active'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('active')));
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - nav.offsetHeight - 16, behavior: 'smooth' }); }
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

  document.querySelectorAll('[data-count]').forEach(el => {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); cObs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    cObs.observe(el);
  });

  function animate(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const start = performance.now();
    (function update(now) {
      const p = Math.min((now - start) / 1800, 1);
      el.textContent = prefix + Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(update);
    })(start);
  }
});
