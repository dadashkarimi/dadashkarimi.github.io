(function () {
  var key = 'site-theme';
  var btn = document.getElementById('themeToggle');
  var menuBtn = document.getElementById('menuToggle');
  if (!btn) return;

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'close' : 'menu';
    });
  }

  function setTheme(theme) {
    var dark = theme === 'dark';
    document.body.classList.toggle('theme-dark', dark);
    btn.textContent = dark ? 'bright' : 'black';
    btn.setAttribute('aria-label', dark ? 'Switch to bright theme' : 'Switch to black theme');

    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#000000' : '#ffffff');
  }

  var saved = null;
  try { saved = localStorage.getItem(key); } catch (error) { /* Storage is optional. */ }
  if (saved === 'dark' || saved === 'bright') {
    setTheme(saved === 'dark' ? 'dark' : 'bright');
  } else {
    setTheme('dark');
  }

  btn.addEventListener('click', function () {
    var nowDark = document.body.classList.contains('theme-dark');
    var next = nowDark ? 'bright' : 'dark';
    setTheme(next);
    try { localStorage.setItem(key, next); } catch (error) { /* Keep the in-page theme. */ }
  });
})();
