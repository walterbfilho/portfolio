(function () {
  'use strict';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  const tabs = document.querySelectorAll('.term-tabs a');
  const sections = Array.from(tabs)
    .map((tab) => document.querySelector(tab.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const map = new Map();
    tabs.forEach((tab) => {
      const id = tab.getAttribute('href').slice(1);
      map.set(id, tab);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tabs.forEach((t) => t.classList.remove('active'));
          const active = map.get(entry.target.id);
          if (active) active.classList.add('active');
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((s) => io.observe(s));
  }
})();
