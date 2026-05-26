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

  var editorialHooks = {
    '/blogs/rnn/': {
      hook: 'Sequence models look simple on slides, but the hard part is understanding what state is remembered, what is forgotten, and why attention changed everything.',
      spine: 'This note moves from classic RNN recurrence to transformer attention so you can see exactly what problem each architectural step fixes.',
      bullets: ['Read this as a progression: recurrence -> bottlenecks -> attention.', 'Track information flow, not only equations.', 'Use the examples to decide when each model family is appropriate.']
    },
    '/blogs/rl/': {
      hook: 'Reinforcement learning sounds abstract until you ask a concrete question: how does an agent improve when rewards are sparse and delayed?',
      spine: 'We build from the environment-agent loop to value functions and policy updates, showing the reasoning behind each update rule.',
      bullets: ['Follow one task end to end before generalizing.', 'Separate exploration decisions from value estimation.', 'Interpret plots as behavior changes, not just curves.']
    },
    '/blogs/graphs/': {
      hook: 'Correlation is easy to measure; conditional independence is the real structure we want, and graphs are the cleanest way to represent it.',
      spine: 'This note ties graph intuition to precision-matrix algebra, then shows how sparse estimation methods recover graph structure from data.',
      bullets: ['Read each graph as a statement about what is conditionally independent.', 'Match every missing edge to a zero pattern in the precision matrix.', 'Use the estimation section as a recipe from samples to structure.']
    },
    '/blogs/variational_inference_vae/': {
      hook: 'Exact posteriors are rarely available in modern models, so the practical question is how to get useful approximations without losing the plot.',
      spine: 'We move from variational objectives to VAE intuition, emphasizing why each bound exists and how optimization behaves in practice.',
      bullets: ['Start from the objective meaning before implementation.', 'Treat ELBO terms as competing pressures.', 'Connect approximation choices to downstream model behavior.']
    },
    '/blogs/approx-inf/': {
      hook: 'Approximate inference is not a compromise of taste; it is what makes many probabilistic models computable at all.',
      spine: 'This note compares approximate routes and highlights the tradeoffs you actually feel: bias, variance, speed, and stability.',
      bullets: ['Ask what quantity you are approximating.', 'Distinguish sampling noise from approximation bias.', 'Use diagnostics, not only final loss values.']
    },
    '/blogs/gibbs/': {
      hook: 'Gibbs sampling seems mechanical until you see it as a sequence of conditional questions that are easy even when the full joint is hard.',
      spine: 'We start from conditional updates, then show how mixing quality and model structure determine whether the chain is useful.',
      bullets: ['Keep track of conditional forms first.', 'Use trace behavior to reason about mixing.', 'Treat burn-in and autocorrelation as part of the model story.']
    },
    '/blogs/dirichlet/': {
      hook: 'Nonparametric Bayes can feel mysterious, but the core idea is practical: let model complexity grow only when data demands it.',
      spine: 'This note uses intuitive constructions to connect Dirichlet processes, clustering behavior, and posterior interpretation.',
      bullets: ['Focus on the generative story before formalism.', 'Use examples to interpret concentration effects.', 'Relate cluster growth to uncertainty, not noise.']
    },
    '/blogs/bayes/': {
      hook: 'Bayesian inference is easiest to understand when you view it as an update process: prior beliefs are revised by evidence, not replaced by it.',
      spine: 'We move from posterior basics to predictive reasoning, keeping the link between assumptions and conclusions explicit.',
      bullets: ['Identify prior assumptions and where they enter.', 'Track posterior changes with data size.', 'Interpret uncertainty as a first-class output.']
    },
    '/blogs/ntk/': {
      hook: 'Neural tangent kernels explain a surprising regime where deep networks behave like kernel methods during training.',
      spine: 'This note builds intuition for that regime and clarifies what NTK captures well and where the approximation breaks.',
      bullets: ['Separate finite-width behavior from infinite-width limits.', 'Treat linearization as a local argument.', 'Use NTK as an explanatory tool, not a universal replacement.']
    },
    '/blogs/representer/': {
      hook: 'The representer theorem answers a practical question: why do infinite-dimensional optimization problems collapse to finite solutions?',
      spine: 'We motivate the theorem through regularization and kernel structure, then show how it simplifies actual learning pipelines.',
      bullets: ['Read the theorem as a computational shortcut.', 'Track where regularization assumptions are required.', 'Connect the result to kernel model design.']
    },
    '/blogs/mercer-2022/': {
      hook: 'Mercer\'s theorem gives the bridge from intuitive similarity functions to mathematically valid kernels.',
      spine: 'This note links eigenfunction views of kernels to model behavior, so kernel choices become interpretable rather than arbitrary.',
      bullets: ['Think in terms of geometry induced by the kernel.', 'Use spectrum intuition to reason about smoothness.', 'Tie theorem statements back to modeling consequences.']
    },
    '/blogs/sparsity-2022/': {
      hook: 'When predictors outnumber observations, the central question is not only fit quality but how to recover signal without overfitting noise.',
      spine: 'We trace a path from bias-variance basics to the sparsity-convexity compromise that makes lasso both interpretable and computable.',
      bullets: ['Start with the failure mode of exhaustive model search.', 'Use geometry to understand why zeros appear in lasso.', 'Read lambda selection as a risk-control decision.']
    },
    '/blogs/em-2021/': {
      hook: 'EM is best understood as a strategy for hard latent-variable problems: alternate between estimating hidden structure and improving parameters.',
      spine: 'We unpack each step in plain language first, then connect to the objective so every update has a clear reason.',
      bullets: ['Interpret E-step as uncertainty bookkeeping.', 'Interpret M-step as parameter re-fitting under that bookkeeping.', 'Use monotonic improvement as a diagnostic, not a guarantee of global optimality.']
    },
    '/blogs/bigdata-experiments-2021/': {
      hook: 'Large experiment pipelines fail less often because of modeling mistakes than because of workflow mistakes.',
      spine: 'This note uses neuroimaging experiments to show how reproducible tables and plotting workflows improve reliability and speed.',
      bullets: ['Treat data pipeline decisions as scientific decisions.', 'Keep outputs machine-readable from the start.', 'Use figures to compare methods, not decorate results.']
    },
    '/blogs/mixture-2021/': {
      hook: 'A single Gaussian can hide multi-population structure; mixture models expose that structure and make clustering probabilistic.',
      spine: 'We start from intuition, then move to likelihood and EM updates so each term in the model has an operational meaning.',
      bullets: ['Use component assignments as soft beliefs.', 'Track likelihood changes to diagnose convergence.', 'Compare one-component vs multi-component fits explicitly.']
    },
    '/blogs/inference-2021/': {
      hook: 'Posterior inference is where modeling assumptions meet real decisions: what should we believe after seeing data?',
      spine: 'This note focuses on posterior predictive reasoning so uncertainty and prediction are discussed together, not separately.',
      bullets: ['Read priors as assumptions you can defend.', 'Use posterior predictive checks to test fit quality.', 'Interpret intervals through decision consequences.']
    },
    '/blogs/erm-2021/': {
      hook: 'Empirical risk minimization sounds obvious, but the subtle question is when minimizing training error actually improves test performance.',
      spine: 'We connect empirical objectives to generalization ideas and show where regularization and model class assumptions enter.',
      bullets: ['Distinguish optimization success from generalization success.', 'Track hypothesis class complexity explicitly.', 'Use validation as a model-selection argument, not a ritual.']
    },
    '/blogs/mle-2021/': {
      hook: 'MLE and MAP often look similar algebraically, but they represent different assumptions about parameter uncertainty.',
      spine: 'This note contrasts the two through concrete examples so you can see when priors genuinely change conclusions.',
      bullets: ['Treat MLE as data-only fitting.', 'Treat MAP as data plus prior structure.', 'Use small-sample behavior to see the difference most clearly.']
    },
    '/blogs/vae-2021/': {
      hook: 'Stochastic latent-variable models are useful only when we can train them reliably, and that requires careful objective design.',
      spine: 'We walk from latent sampling intuition to practical training considerations, with attention to what each term controls.',
      bullets: ['Understand reparameterization before tuning.', 'Read KL terms as regularizers of latent usage.', 'Interpret reconstructions alongside latent geometry.']
    },
    '/blogs/kernel-2021/': {
      hook: 'Kernel methods are a way to get nonlinear behavior while keeping optimization in familiar linear territory.',
      spine: 'This note frames kernels as feature-space geometry tools and connects that view to practical model selection choices.',
      bullets: ['Think in similarities, not raw coordinates.', 'Use kernel choice to encode assumptions.', 'Track computation and interpretability tradeoffs.']
    },
    '/blogs/ot-2021/': {
      hook: 'Optimal transport gives a geometry-aware way to compare distributions when pointwise metrics fail.',
      spine: 'This short note centers on intuition and application context so the core idea is useful before the full formalism.',
      bullets: ['Interpret transport as mass movement with cost.', 'Relate distance choice to domain geometry.', 'Use examples to anchor abstract notation.']
    },
    '/blogs/ot-convex/': {
      hook: 'The power of optimal transport comes from convex structure that turns a hard comparison problem into a solvable optimization program.',
      spine: 'We connect OT equations to convexity principles and show why this matters for robustness and scalability.',
      bullets: ['Read primal and dual forms as complementary views.', 'Use convexity to reason about solvability.', 'Map equations back to movement intuition.']
    }
  };

  function refreshBlogStylesheet() {
    var sheet = document.querySelector('link[href^="/css/blog-post.css"]');
    if (sheet && sheet.getAttribute('href') === '/css/blog-post.css') {
      sheet.setAttribute('href', '/css/blog-post.css?v=20260524-mathjax-scifig');
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

  function injectEditorialHook() {
    var post = document.querySelector('#page.post');
    if (!post || post.querySelector('.editorial-hook')) return;

    var current = normalizePath(window.location.pathname);
    var hook = editorialHooks[current];
    if (!hook) return;

    var section = document.createElement('section');
    section.className = 'editorial-hook';

    var eyebrow = document.createElement('div');
    eyebrow.className = 'editorial-hook__eyebrow';
    eyebrow.textContent = 'start here';

    var heading = document.createElement('h2');
    heading.textContent = 'Why This Note Matters';

    var intro = document.createElement('p');
    intro.textContent = hook.hook;

    var spine = document.createElement('p');
    spine.textContent = hook.spine;

    var list = document.createElement('ul');
    list.className = 'editorial-hook__list';
    (hook.bullets || []).forEach(function (itemText) {
      var item = document.createElement('li');
      item.textContent = itemText;
      list.appendChild(item);
    });

    section.appendChild(eyebrow);
    section.appendChild(heading);
    section.appendChild(intro);
    section.appendChild(spine);
    section.appendChild(list);

    var postDate = post.querySelector('.post-date');
    if (postDate && postDate.nextSibling) post.insertBefore(section, postDate.nextSibling);
    else post.insertBefore(section, post.firstChild);
  }

  function loadMathJax() {
    function typesetPostMath() {
      if (!window.MathJax || !window.MathJax.typesetPromise) return;
      var root = document.querySelector('#page.post') || document.body;
      if (window.MathJax.typesetClear) window.MathJax.typesetClear([root]);
      window.MathJax.typesetPromise([root]).catch(function () {});
    }

    window.MathJax = window.MathJax || {};
    window.MathJax.tex = window.MathJax.tex || {};
    window.MathJax.tex.inlineMath = [['$', '$'], ['\\(', '\\)']];
    window.MathJax.tex.displayMath = [['$$', '$$'], ['\\[', '\\]']];
    window.MathJax.tex.processEscapes = true;
    window.MathJax.options = window.MathJax.options || {};
    window.MathJax.options.skipHtmlTags = ['script', 'noscript', 'style', 'textarea', 'pre', 'code'];
    window.MathJax.startup = window.MathJax.startup || {};
    window.MathJax.startup.typeset = false;

    if (window.MathJax.typesetPromise) {
      window.requestAnimationFrame(typesetPostMath);
      return;
    }

    var existingScript = document.getElementById('MathJax-script');
    if (existingScript) {
      existingScript.addEventListener('load', function () {
        window.requestAnimationFrame(typesetPostMath);
      }, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.addEventListener('load', function () {
      window.requestAnimationFrame(typesetPostMath);
    }, { once: true });
    document.head.appendChild(script);
  }

  function loadDiagramEnhancer() {
    if (document.querySelector('script[src^="/js/blog-diagrams.js"]')) return;
    var script = document.createElement('script');
    script.src = '/js/blog-diagrams.js?v=20260524-mathjax-scifig';
    script.defer = true;
    document.head.appendChild(script);
  }

  function boot() {
    refreshBlogStylesheet();
    injectChrome();
    cleanupLegacyArtifacts();
    injectEditorialHook();
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
