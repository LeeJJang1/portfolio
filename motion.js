(() => {
  'use strict';

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const targets = document.querySelectorAll(
    '.section-heading, .project-card, .delivery-summary, .subproject-card, ' +
    '.case-row, .about-intro, .capabilities article, .background-grid > *, .contact-heading'
  );
  const played = new WeakSet();
  const running = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      played.add(element);
      // Keep focused content and direct anchor destinations immediately readable.
      if (preference.matches || element.contains(document.activeElement)) return;
      const animation = element.animate(
        [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 620, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
      running.set(element, animation);
      const cleanup = () => running.delete(element);
      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    });
  }, { threshold: .06 });

  function syncPreference() {
    observer.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
    if (preference.matches) return;
    targets.forEach(element => {
      // Content is always visible in CSS, including without JavaScript.
      if (element.getBoundingClientRect().top < window.innerHeight) played.add(element);
      if (!played.has(element)) observer.observe(element);
    });
  }
  document.addEventListener('focusin', event => {
    running.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
  });
  window.addEventListener('beforeprint', () => {
    running.forEach(animation => animation.cancel());
  });
  preference.addEventListener('change', syncPreference);
  syncPreference();
})();
