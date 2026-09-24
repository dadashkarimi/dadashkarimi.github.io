/* Complements existing menu/theme handlers; does not bind a second toggle. */
(function () {
  'use strict';
  function init() {
    var nav = document.querySelector('nav.has-photography');
    if (!nav) return false;
    if (nav.dataset.photographyMenuReady) return true;
    var button = nav.querySelector('#menuToggle');
    var links = nav.querySelector('#siteNav, #navLinks');
    if (!button || !links) return false;
    nav.dataset.photographyMenuReady = 'true';
    function close(returnFocus) {
      if (!document.body.classList.contains('nav-open')) return;
      document.body.classList.remove('nav-open');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'menu';
      if (returnFocus) button.focus();
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close(true);
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) close(false);
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) close(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) close(false);
    });
    return true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // Article navigation is created by the existing blog-theme script.
  if (!init() && 'MutationObserver' in window) {
    var observer = new MutationObserver(function () {
      if (init()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('load', function () {
      init();
      observer.disconnect();
    }, { once: true });
  }
})();
