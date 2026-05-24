(function () {
  var key = 'site-theme';
  var lessons = [
    { href: '/blogs/rnn/index.html', title: 'Sequence Models & RNNs', meta: 'Apr 10, 2022', read: '10 min' },
    { href: '/blogs/rl/index.html', title: 'Reinforcement Learning', meta: 'Apr 1, 2022', read: '15 min' },
    { href: '/blogs/graphs/index.html', title: 'Sparsity and Graphs', meta: 'Mar 28, 2022', read: '9 min' },
    { href: '/blogs/variational_inference_vae/index.html', title: 'Variational Inference', meta: 'Mar 11, 2022', read: '6 min' },
    { href: '/blogs/approx-inf/index.html', title: 'Approximate Inference', meta: 'Mar 7, 2022', read: '5 min' },
    { href: '/blogs/gibbs/index.html', title: 'Gibbs Sampling', meta: 'Mar 2, 2022', read: '4 min' },
    { href: '/blogs/dirichlet/index.html', title: 'Dirichlet Processes', meta: 'Feb 25, 2022', read: '6 min' },
    { href: '/blogs/bayes/index.html', title: 'Bayesian Inference', meta: 'Feb 19, 2022', read: '5 min' },
    { href: '/blogs/ntk/index.html', title: 'Neural Tangent Kernels', meta: 'Feb 19, 2022', read: '5 min' },
    { href: '/blogs/representer/index.html', title: 'Representer Theorem', meta: 'Feb 10, 2022', read: '5 min' },
    { href: '/blogs/mercer-2022/index.html', title: 'Mercer\'s Theorem', meta: 'Jan 16, 2022', read: '7 min' },
    { href: '/blogs/sparsity-2022/index.html', title: 'Sparsity Meets Convexity', meta: 'Jan 16, 2022', read: '7 min' },
    { href: '/blogs/em-2021/index.html', title: 'Expectation Maximization', meta: 'Dec 6, 2021', read: '5 min' },
    { href: '/blogs/bigdata-experiments-2021/index.html', title: 'Brain Imaging Experiments', meta: 'Dec 5, 2021', read: '8 min' },
    { href: '/blogs/mixture-2021/index.html', title: 'Mixture Models and EM', meta: 'Dec 3, 2021', read: '4 min' },
    { href: '/blogs/inference-2021/index.html', title: 'Posterior Inference', meta: 'Nov 26, 2021', read: '3 min' },
    { href: '/blogs/erm-2021/index.html', title: 'Empirical Risk Minimization', meta: 'Nov 16, 2021', read: '3 min' },
    { href: '/blogs/mle-2021/index.html', title: 'MLE and MAP Estimation', meta: 'Nov 9, 2021', read: '7 min' },
    { href: '/blogs/vae-2021/index.html', title: 'Stochastic Functions', meta: 'Nov 1, 2021', read: '5 min' },
    { href: '/blogs/kernel-2021/index.html', title: 'Kernel Methods', meta: 'Oct 20, 2021', read: '12 min' },
    { href: '/blogs/ot-2021/index.html', title: 'Optimal Transport', meta: 'Oct 17, 2021', read: '2 min' },
    { href: '/blogs/ot-convex/index.html', title: 'Optimal Transport & Convexity', meta: 'Oct 28, 2021', read: '4 min' }
  ];

  function refreshBlogStylesheet() {
    var sheet = document.querySelector('link[href^="/css/blog-post.css"]');
    if (sheet && sheet.getAttribute('href') === '/css/blog-post.css') {
      sheet.setAttribute('href', '/css/blog-post.css?v=20260524-plate-math');
    }
  }

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
    link.className = 'post-nav-card ' + direction;
    link.href = item.href;
    link.innerHTML = '' +
      '<span class="post-nav-card-eyebrow">' + (direction === 'prev' ? 'previous lesson' : 'next lesson') + '</span>' +
      '<span class="post-nav-card-title">' + item.title + '</span>';
    return link;
  }

  function sectionTitle(index) {
    if (index < 7) return 'Part I - Modern ML Systems';
    if (index < 13) return 'Part II - Bayesian Inference';
    if (index < 19) return 'Part III - Estimation & Latent Variables';
    return 'Part IV - Kernels & Transport';
  }

  function ensureLessonLayout(post, sidebar) {
    var layout = document.querySelector('.blog-lesson-layout');
    if (!layout) {
      layout = document.createElement('div');
      layout.className = 'blog-lesson-layout';
      post.parentNode.insertBefore(layout, post);
      layout.appendChild(post);
    }
    if (sidebar && sidebar.parentNode !== layout) layout.appendChild(sidebar);
  }

  function injectPostNav(post, index) {
    if (post.querySelector('.post-nav')) return;
    var nav = document.createElement('nav');
    nav.className = 'post-nav';
    nav.setAttribute('aria-label', 'Previous and next lessons');
    if (index > 0) nav.appendChild(lessonLink(lessons[index - 1], 'prev'));
    if (index < lessons.length - 1) nav.appendChild(lessonLink(lessons[index + 1], 'next'));
    if (nav.children.length) post.appendChild(nav);
  }

  function injectLessonPlaylist() {
    if (document.querySelector('.playlist-wrap')) return;
    var post = document.querySelector('#page.post');
    if (!post) return;
    var current = normalizePath(window.location.pathname);
    var index = lessons.findIndex(function (lesson) {
      return normalizePath(lesson.href) === current;
    });
    if (index === -1) return;

    var sidebar = document.createElement('aside');
    sidebar.className = 'playlist-wrap';
    sidebar.setAttribute('aria-label', 'Lecture series playlist');

    var nextLesson = lessons[index + 1];
    sidebar.innerHTML = '' +
      '<div class="playlist-header">' +
        '<div class="playlist-title"><span class="playlist-icon" aria-hidden="true">&#9636;</span><span>Statistical ML - Lecture Series</span></div>' +
        '<div class="playlist-progress"><span class="current-num">' + (index + 1) + '</span> / ' + lessons.length + '</div>' +
      '</div>' +
      '<div class="playlist-subhead">' + lessons.length + ' lessons · <a href="/blogs.html">view all notes</a></div>' +
      '<div class="playlist-body"></div>';

    var body = sidebar.querySelector('.playlist-body');
    var lastSection = '';
    lessons.forEach(function (lesson, lessonIndex) {
      var section = sectionTitle(lessonIndex);
      if (section !== lastSection) {
        var sectionHead = document.createElement('div');
        sectionHead.className = 'pl-section-head';
        sectionHead.textContent = section;
        body.appendChild(sectionHead);
        lastSection = section;
      }

      var item = document.createElement('a');
      item.href = lesson.href;
      item.className = 'pl-item';
      if (lessonIndex < index) item.className += ' watched';
      if (lessonIndex === index) {
        item.className += ' current';
        item.setAttribute('aria-current', 'page');
      }
      item.innerHTML = '' +
        '<span class="pl-num">' + (lessonIndex >= index ? lessonIndex + 1 : '') + '</span>' +
        '<span class="pl-content">' +
          '<span class="pl-title">' + lesson.title + '</span>' +
          (lessonIndex === index ? '<span class="pl-now-playing">now reading</span>' : '<span class="pl-meta">' + lesson.meta + '</span>') +
        '</span>' +
        '<span class="pl-duration">' + lesson.read + '</span>';
      body.appendChild(item);
    });

    if (nextLesson) {
      var upNext = document.createElement('a');
      upNext.className = 'up-next-strip';
      upNext.href = nextLesson.href;
      upNext.innerHTML = '' +
        '<span class="up-next-eyebrow">up next</span>' +
        '<span class="up-next-title">' + nextLesson.title + '</span>' +
        '<span class="up-next-meta">' + nextLesson.read + ' · ' + nextLesson.meta + '</span>';
      sidebar.appendChild(upNext);
    }

    injectPostNav(post, index);
    ensureLessonLayout(post, sidebar);

    window.setTimeout(function () {
      var currentItem = sidebar.querySelector('.pl-item.current');
      if (!currentItem || !body) return;
      body.scrollTop = Math.max(0, currentItem.offsetTop - ((body.clientHeight - currentItem.clientHeight) / 2));
    }, 0);
  }

  function getPostBody(post) {
    var candidates = Array.prototype.slice.call(post.children).filter(function (node) {
      return node.tagName === 'DIV' && !node.classList.contains('post-date') && !node.classList.contains('share-buttons');
    });
    if (!candidates.length) return post;
    return candidates.sort(function (left, right) {
      var leftScore = left.querySelectorAll('p, h2, h3, img, ol, ul').length;
      var rightScore = right.querySelectorAll('p, h2, h3, img, ol, ul').length;
      return rightScore - leftScore;
    })[0];
  }

  function cleanupLegacyArtifacts() {
    Array.prototype.slice.call(document.querySelectorAll('.share-buttons')).forEach(function (node) {
      node.remove();
    });

    Array.prototype.slice.call(document.querySelectorAll('script[src*="font-awesome"], link[href*="font-awesome"]')).forEach(function (node) {
      node.remove();
    });
  }

  function injectLessonMap() {
    var post = document.querySelector('#page.post');
    if (!post || document.querySelector('.lesson-map')) return;
    var body = getPostBody(post);
    var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3')).filter(function (heading) {
      var label = heading.textContent.replace(/\s+/g, ' ').trim();
      return label.length > 2 && label.length <= 120 && !heading.closest('.concept-diagram');
    }).slice(0, 10);
    if (headings.length < 2) return;

    var map = document.createElement('section');
    map.className = 'lesson-map';
    var title = document.createElement('div');
    title.className = 'lesson-map__eyebrow';
    title.textContent = 'lesson flow';
    var heading = document.createElement('h2');
    heading.textContent = 'What you will learn';
    var intro = document.createElement('p');
    intro.textContent = 'This note is organized like a lecture: start with the motivation, follow the key definitions and derivations, then use the later sections as examples or extensions.';
    var list = document.createElement('ol');
    list.className = 'lesson-map__list';

    function cleanHeadingText(value) {
      var label = value.replace(/[#~]/g, '').replace(/\s+/g, ' ').trim();
      if (label.length <= 72) return label;
      return label.slice(0, 69).replace(/[\s,;:.]+$/, '') + '...';
    }

    headings.forEach(function (section, index) {
      if (!section.id) section.id = 'lesson-section-' + (index + 1);
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + section.id;
      link.textContent = cleanHeadingText(section.textContent);
      link.title = section.textContent.replace(/\s+/g, ' ').trim();
      item.appendChild(link);
      list.appendChild(item);
    });

    map.appendChild(title);
    map.appendChild(heading);
    map.appendChild(intro);
    map.appendChild(list);

    var postDate = post.querySelector('.post-date');
    if (postDate && postDate.nextSibling) post.insertBefore(map, postDate.nextSibling);
    else post.insertBefore(map, body);
  }

  function loadMathJax() {
    window.MathJax = window.MathJax || {};
    window.MathJax.tex = window.MathJax.tex || {};
    window.MathJax.tex.inlineMath = [['$', '$'], ['\\(', '\\)']];
    window.MathJax.tex.displayMath = [['$$', '$$'], ['\\[', '\\]']];
    window.MathJax.tex.processEscapes = true;
    window.MathJax.options = window.MathJax.options || {};
    window.MathJax.options.skipHtmlTags = ['script', 'noscript', 'style', 'textarea', 'pre', 'code'];

    if (window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([document.querySelector('#page.post') || document.body]).catch(function () {});
      return;
    }
    if (document.getElementById('MathJax-script')) return;

    var script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    document.head.appendChild(script);
  }

  function loadDiagramEnhancer() {
    if (document.querySelector('script[src^="/js/blog-diagrams.js"]')) return;
    var script = document.createElement('script');
    script.src = '/js/blog-diagrams.js?v=20260524-plate-math';
    script.defer = true;
    document.head.appendChild(script);
  }

  function boot() {
    refreshBlogStylesheet();
    injectChrome();
    cleanupLegacyArtifacts();
    injectLessonMap();
    injectLessonPlaylist();
    loadMathJax();
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
