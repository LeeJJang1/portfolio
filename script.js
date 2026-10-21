(() => {
  'use strict';

  const root = document.documentElement;
  const t = text => window.portfolioI18n.t(text);
  const themeButton = document.querySelector('.theme-button');
  let savedTheme;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch { /* Storage may be unavailable. */ }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    themeButton.firstElementChild.textContent = isDark ? '☀' : '☾';
    themeButton.setAttribute('aria-label', t(isDark ? '라이트 모드로 변경' : '다크 모드로 변경'));
    document.querySelector('meta[name="theme-color"]').content = isDark ? '#111310' : '#f6f6ef';
  }
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* Theme still works without persistence. */ }
  });

  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('#mobile-nav');
  function closeMenu() {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.lastElementChild.textContent = '＋';
  }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    mobileNav.hidden = !expanded;
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.lastElementChild.textContent = expanded ? '−' : '＋';
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  const desktopMedia = window.matchMedia('(min-width: 761px)');
  desktopMedia.addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
  });

  const dialog = document.querySelector('#project-dialog');
  const imageDialog = document.querySelector('#image-dialog');
  const openButton = document.querySelector('[data-open-project]');
  let returnFocus;
  let precedingHash = '';
  function openProject(updateUrl = true) {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    precedingHash = location.hash === '#live-buddy' ? '#work' : location.hash;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
    if (updateUrl) history.pushState(null, '', '#live-buddy');
  }
  function finishClose() {
    if (!imageDialog.open) document.body.classList.remove('modal-open');
    if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
  }
  function closeProject() {
    if (!dialog.open) return;
    if (imageDialog.open) imageDialog.close();
    dialog.close();
    if (location.hash === '#live-buddy') history.replaceState(null, '', location.pathname + location.search + precedingHash);
  }
  openButton.addEventListener('click', () => openProject());
  dialog.querySelector('.dialog-close').addEventListener('click', closeProject);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
  dialog.addEventListener('close', finishClose);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeProject();
  });
  window.addEventListener('popstate', () => {
    if (location.hash === '#live-buddy') openProject(false);
    else if (dialog.open) {
      if (imageDialog.open) imageDialog.close();
      dialog.close();
    }
  });
  if (location.hash === '#live-buddy') openProject(false);

  // A separate native dialog keeps image viewing accessible inside the project dialog.
  const expandedImage = imageDialog.querySelector('#expanded-image');
  const imageViewport = imageDialog.querySelector('.image-viewport');
  const zoomButton = imageDialog.querySelector('.image-zoom-toggle');
  let imageReturnFocus;

  function resetImageZoom() {
    imageViewport.classList.remove('is-zoomed');
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.textContent = t('원본 크기');
    imageViewport.scrollTop = 0;
    imageViewport.scrollLeft = 0;
  }

  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => {
      const sourceImage = button.querySelector('img');
      imageReturnFocus = button;
      expandedImage.src = sourceImage.currentSrc || sourceImage.src;
      expandedImage.alt = sourceImage.alt;
      imageDialog.querySelector('#image-title').textContent = button.dataset.caption || sourceImage.alt;
      resetImageZoom();
      imageDialog.showModal();
      document.body.classList.add('modal-open');
      imageDialog.querySelector('.image-dialog-close').focus();
    });
  });

  zoomButton.addEventListener('click', () => {
    const zoomed = imageViewport.classList.toggle('is-zoomed');
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.textContent = t(zoomed ? '화면에 맞추기' : '원본 크기');
    imageViewport.scrollTop = 0;
    imageViewport.scrollLeft = 0;
  });
  imageDialog.querySelector('.image-dialog-close').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('close', () => {
    if (!dialog.open) document.body.classList.remove('modal-open');
    resetImageZoom();
    if (imageReturnFocus instanceof HTMLElement) {
      const parentDialog = imageReturnFocus.closest('dialog');
      if (!parentDialog || parentDialog.open) imageReturnFocus.focus({ preventScroll: true });
    }
  });
  imageDialog.addEventListener('click', event => {
    if (event.target !== imageDialog) return;
    const box = imageDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) imageDialog.close();
  });

  document.addEventListener('portfolio:languagechange', () => {
    applyTheme(root.dataset.theme);
    zoomButton.textContent = t(imageViewport.classList.contains('is-zoomed') ? '화면에 맞추기' : '원본 크기');
    if (imageDialog.open && imageReturnFocus) {
      const source = imageReturnFocus.querySelector('img');
      expandedImage.alt = source.alt;
      imageDialog.querySelector('#image-title').textContent = imageReturnFocus.dataset.caption || source.alt;
    }
  });

  const toast = document.querySelector('#toast');
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }
  document.querySelector('#copy-profile').addEventListener('click', async () => {
    const profile = 'https://github.com/LeeJJang1';
    try {
      await navigator.clipboard.writeText(profile);
      showToast(t('GitHub 프로필 링크를 복사했습니다.'));
    } catch {
      const field = document.createElement('textarea');
      field.value = profile;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Show a helpful failure message below. */ }
      field.remove();
      document.querySelector('#copy-profile').focus();
      showToast(t(copied ? 'GitHub 프로필 링크를 복사했습니다.' : '복사하지 못했습니다. 옆의 GitHub 링크를 이용해주세요.'));
    }
  });

  if ('IntersectionObserver' in window) {
    const navLinks = document.querySelectorAll('.desktop-nav a');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
