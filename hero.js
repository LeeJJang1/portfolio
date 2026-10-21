(() => {
  const button = document.querySelector('.hero-motion-toggle');
  if (!button) return;
  const root = document.documentElement;
  function label() {
    const paused = root.classList.contains('hero-motion-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = window.portfolioI18n.t(paused ? '배경 움직임 재생' : '배경 움직임 멈추기');
  }
  button.addEventListener('click', () => {
    root.classList.toggle('hero-motion-paused');
    label();
  });
  document.addEventListener('portfolio:languagechange', label);
  label();
})();
