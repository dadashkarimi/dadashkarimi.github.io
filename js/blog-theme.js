(function () {
  var key = 'site-theme';
  var lessons = [
    { href: '/blogs/rnn/index.html', title: 'Sequence Models & RNNs' },
    { href: '/blogs/rl/index.html', title: 'Reinforcement Learning' },
    { href: '/blogs/graphs/index.html', title: 'Sparsity and Graphs' },
    { href: '/blogs/variational_inference_vae/index.html', title: 'Variational Inference' },
    { href: '/blogs/approx-inf/index.html', title: 'Approximation Inference' },
    { href: '/blogs/gibbs/index.html', title: 'Gibbs Sampling' },
    { href: '/blogs/dirichlet/index.html', title: 'Dirichlet Processes' },
    { href: '/blogs/bayes/index.html', title: 'Bayesian Inference' },
    { href: '/blogs/ntk/index.html', title: 'Neural Tangent Kernels' },
    { href: '/blogs/representer/index.html', title: 'Representer Theorem' },
    { href: '/blogs/mercer-2022/index.html', title: 'Mercer\'s Theorem' },
    { href: '/blogs/sparsity-2022/index.html', title: 'Sparsity Meets Convexity' },
    { href: '/blogs/em-2021/index.html', title: 'Expectation Maximization' },
    { href: '/blogs/bigdata-experiments-2021/index.html', title: 'Brain Imaging Experiments' },
    { href: '/blogs/mixture-2021/index.html', title: 'Mixture Models and EM' },
    { href: '/blogs/inference-2021/index.html', title: 'Posterior Inference' },
    { href: '/blogs/erm-2021/index.html', title: 'Empirical Risk Minimization' },
    { href: '/blogs/mle-2021/index.html', title: 'MLE and MAP Estimation' },
    { href: '/blogs/vae-2021/index.html', title: 'Stochastic Functions' },
    { href: '/blogs/kernel-2021/index.html', title: 'Kernel Methods' },
    { href: '/blogs/ot-2021/index.html', title: 'Optimal Transport' },
    { href: '/blogs/ot-convex/index.html', title: 'Optimal Transport & Convexity' }
  ];

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

  function normalizePath(path) {
    return path.replace(/\/index\.html$/, '/').replace(/\/$/, '/');
  }

  function lessonLink(item, direction) {
    var link = document.createElement('a');
    link.className = 'lesson-rail__link lesson-rail__link--' + direction;
    link.href = item.href;
    link.innerHTML = '' +
      '<span class="lesson-rail__eyebrow">' + (direction === 'prev' ? 'previous lesson' : 'next lesson') + '</span>' +
      '<span class="lesson-rail__title">' + item.title + '</span>';
    return link;
  }

  function injectLessonRail() {
    if (document.querySelector('.lesson-rail')) return;
    var current = normalizePath(window.location.pathname);
    var index = lessons.findIndex(function (lesson) {
      return normalizePath(lesson.href) === current;
    });
    if (index === -1) return;

    var rail = document.createElement('aside');
    rail.className = 'lesson-rail';
    rail.setAttribute('aria-label', 'Lesson navigation');
    if (index > 0) rail.appendChild(lessonLink(lessons[index - 1], 'prev'));
    if (index < lessons.length - 1) rail.appendChild(lessonLink(lessons[index + 1], 'next'));
    document.body.appendChild(rail);
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
    injectLessonRail();
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
