(function () {
  var key = 'site-theme';

  function setTheme(theme) {
    var dark = theme === 'dark';
    document.body.classList.toggle('theme-dark', dark);
    document.body.classList.toggle('theme-bright', !dark);

    var button = document.getElementById('themeToggle');
    if (button) {
      button.textContent = dark ? 'bright' : 'black';
      button.setAttribute('aria-label', dark ? 'Switch to bright theme' : 'Switch to black theme');
    }

    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#000000' : '#ffffff');
  }

  function injectChrome() {
    if (document.querySelector('.blog-nav')) return;

    var tape = document.createElement('div');
    tape.className = 'blog-tape';
    tape.textContent = 'lecture notes / research notebook';

    var nav = document.createElement('nav');
    nav.className = 'blog-nav';
    nav.innerHTML = '' +
      '<a class="brand" href="/index.html">javid dadashkarimi</a>' +
      '<div class="nav-right">' +
        '<button class="menu-toggle" id="menuToggle" type="button" aria-expanded="false">menu</button>' +
        '<div class="nav-links" id="navLinks">' +
          '<a href="/index.html">research</a>' +
          '<a href="/pubs.html">papers</a>' +
          '<a class="active" href="/blogs.html">blog</a>' +
          '<a href="/talks.html">talks</a>' +
          '<a href="/reads.html">reading</a>' +
          '<a href="mailto:javid.dadashkarimi@pennmedicine.upenn.edu">contact</a>' +
        '</div>' +
        '<button class="theme-toggle" id="themeToggle" type="button">bright</button>' +
      '</div>';

    document.body.insertBefore(nav, document.body.firstChild);
    document.body.insertBefore(tape, nav);

    var footer = document.createElement('footer');
    footer.className = 'blog-footer';
    footer.innerHTML = '<a href="/index.html">home</a> · <a href="/blogs.html">all notes</a> · <a href="/pubs.html">publications</a>';
    document.body.appendChild(footer);

    var menuButton = document.getElementById('menuToggle');
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuButton.textContent = open ? 'close' : 'menu';
      });
    }

    var themeButton = document.getElementById('themeToggle');
    if (themeButton) {
      themeButton.addEventListener('click', function () {
        var nowDark = document.body.classList.contains('theme-dark');
        var next = nowDark ? 'bright' : 'dark';
        setTheme(next);
        localStorage.setItem(key, next);
      });
    }
  }

  function loadDiagramEnhancer() {
    if (document.querySelector('script[src="/js/blog-diagrams.js"]')) return;
    var script = document.createElement('script');
    script.src = '/js/blog-diagrams.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function boot() {
    injectChrome();
    var saved = localStorage.getItem(key);
    setTheme(saved === 'bright' ? 'bright' : 'dark');
    loadDiagramEnhancer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
