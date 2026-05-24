(function () {
  var svgNs = 'http://www.w3.org/2000/svg';

  function createSvg(width, height, viewBox) {
    var svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', viewBox || ('0 0 ' + width + ' ' + height));
    svg.setAttribute('role', 'img');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    return svg;
  }

  function el(name, attrs) {
    var node = document.createElementNS(svgNs, name);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function text(x, y, value, className) {
    var node = el('text', { x: x, y: y, class: className || '' });
    node.textContent = value;
    return node;
  }

  function makeCard(type, title, caption) {
    var card = document.createElement('section');
    card.className = 'concept-diagram concept-diagram--' + type;
    card.dataset.diagram = type;

    var head = document.createElement('div');
    head.className = 'concept-diagram__head';

    var label = document.createElement('div');
    label.className = 'concept-diagram__label';
    label.textContent = 'interactive figure';

    var heading = document.createElement('h3');
    heading.textContent = title;

    head.appendChild(label);
    head.appendChild(heading);
    card.appendChild(head);

    var stage = document.createElement('div');
    stage.className = 'concept-diagram__stage';
    card.appendChild(stage);

    if (caption) {
      var copy = document.createElement('p');
      copy.className = 'concept-diagram__caption';
      copy.textContent = caption;
      card.appendChild(copy);
    }

    return { card: card, stage: stage };
  }

  function addButton(card, label, onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'concept-diagram__button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    card.appendChild(button);
    return button;
  }

  function drawBayesGraph(target, options) {
    var state = { step: 0 };
    var card = makeCard('bayes-graph', options.title, options.caption);
    var svg = createSvg(640, 260, '0 0 640 260');
    svg.setAttribute('aria-label', 'Bayesian graphical model showing a parameter theta generating an observation x.');

    var defs = el('defs');
    var marker = el('marker', { id: 'arrowhead-bayes', markerWidth: '10', markerHeight: '7', refX: '9', refY: '3.5', orient: 'auto' });
    marker.appendChild(el('path', { d: 'M0,0 L10,3.5 L0,7 Z', class: 'diagram-arrowhead' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var plate = el('rect', { x: 252, y: 34, width: 255, height: 176, rx: 8, class: 'diagram-plate' });
    var theta = el('circle', { cx: 170, cy: 78, r: 34, class: 'diagram-node diagram-node--latent' });
    var x = el('circle', { cx: 170, cy: 178, r: 34, class: 'diagram-node diagram-node--observed' });
    var arrow = el('path', { d: 'M170 113 L170 139', class: 'diagram-arrow diagram-flow', 'marker-end': 'url(#arrowhead-bayes)' });
    var copies = [];

    for (var index = 0; index < 3; index += 1) {
      var cx = 310 + index * 78;
      var node = el('circle', { cx: cx, cy: 132, r: 22, class: 'diagram-node diagram-node--observed diagram-copy' });
      var path = el('path', { d: 'M199 94 C245 92 ' + (cx - 25) + ' 100 ' + cx + ' 112', class: 'diagram-arrow diagram-copy', 'marker-end': 'url(#arrowhead-bayes)' });
      copies.push(path, node, text(cx - 8, 139, 'x' + (index + 1), 'diagram-node-label diagram-copy'));
    }

    svg.appendChild(plate);
    svg.appendChild(theta);
    svg.appendChild(x);
    svg.appendChild(arrow);
    svg.appendChild(text(154, 86, 'theta', 'diagram-node-label'));
    svg.appendChild(text(164, 187, 'x', 'diagram-node-label'));
    svg.appendChild(text(350, 202, 'n observations', 'diagram-plate-label diagram-copy'));
    copies.forEach(function (node) { svg.appendChild(node); });

    var status = document.createElement('div');
    status.className = 'concept-diagram__status';
    status.textContent = 'Parameter theta generates one observation x.';

    card.stage.appendChild(svg);
    card.card.appendChild(status);

    addButton(card.card, 'show repeated observations', function () {
      state.step = (state.step + 1) % 2;
      card.card.classList.toggle('is-expanded', state.step === 1);
      status.textContent = state.step === 1
        ? 'The same latent parameter can generate a sample x1, x2, ..., xn.'
        : 'Parameter theta generates one observation x.';
      this.textContent = state.step === 1 ? 'show one observation' : 'show repeated observations';
    });

    target.parentNode.insertBefore(card.card, target.nextSibling);
  }

  function normalPdf(x, mean, sd) {
    var scale = 1 / (sd * Math.sqrt(2 * Math.PI));
    var exponent = -0.5 * Math.pow((x - mean) / sd, 2);
    return scale * Math.exp(exponent);
  }

  function drawMixturePlot(target) {
    var params = {
      middleWeight: 0.42,
      separation: 2.1,
      sigma: 0.72
    };
    var weights = [0.29, 0.42, 0.29];
    var means = [-2.1, 0, 2.1];
    var sds = [0.72, 0.72, 0.72];
    var card = makeCard('mixture-plot', 'Gaussian mixture model', 'Adjust the parameters to see how the component means, variances, and mixture weights change the marginal density.');
    var canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 420;
    canvas.setAttribute('aria-label', 'Interactive Gaussian mixture plot with three components and their weighted sum.');
    card.stage.appendChild(canvas);

    var controls = document.createElement('div');
    controls.className = 'concept-diagram__controls';

    function addRange(labelText, min, max, step, value, onInput) {
      var label = document.createElement('label');
      var row = document.createElement('span');
      row.className = 'concept-diagram__control-label';
      row.textContent = labelText;
      var valueNode = document.createElement('span');
      valueNode.className = 'concept-diagram__value';
      valueNode.textContent = Number(value).toFixed(2);
      var slider = document.createElement('input');
      slider.type = 'range';
      slider.min = String(min);
      slider.max = String(max);
      slider.step = String(step);
      slider.value = String(value);
      slider.addEventListener('input', function () {
        valueNode.textContent = Number(slider.value).toFixed(2);
        onInput(Number(slider.value));
        render();
      });
      label.appendChild(row);
      label.appendChild(slider);
      label.appendChild(valueNode);
      controls.appendChild(label);
      return slider;
    }

    addRange('middle weight π₂', 0.12, 0.72, 0.01, params.middleWeight, function (value) {
      params.middleWeight = value;
      syncParameters();
    });
    addRange('mean separation |μ₃ - μ₂|', 0.8, 3.2, 0.05, params.separation, function (value) {
      params.separation = value;
      syncParameters();
    });
    addRange('shared σ', 0.35, 1.25, 0.01, params.sigma, function (value) {
      params.sigma = value;
      syncParameters();
    });

    card.card.appendChild(controls);

    var context = canvas.getContext('2d');

    function syncParameters() {
      var middle = params.middleWeight;
      var side = (1 - middle) / 2;
      weights = [side, middle, side];
      means = [-params.separation, 0, params.separation];
      sds = [params.sigma, params.sigma, params.sigma];
    }

    function point(x, y) {
      var xMin = -4;
      var xMax = 4;
      var yMax = 0.82;
      return {
        x: 76 + ((x - xMin) / (xMax - xMin)) * (canvas.width - 126),
        y: canvas.height - 60 - (y / yMax) * (canvas.height - 112)
      };
    }

    function drawCurve(fn, color, width, dash) {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = width;
      context.setLineDash(dash || []);
      context.beginPath();
      for (var index = 0; index <= 240; index += 1) {
        var x = -4 + (8 * index / 240);
        var y = fn(x);
        var p = point(x, y);
        if (index === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      }
      context.stroke();
      context.restore();
    }

    function drawGrid() {
      var origin = point(-4, 0);
      var xEnd = point(4, 0);
      var yEnd = point(-4, 0.78);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#d9d9d9';
      context.lineWidth = 1;
      context.font = '14px Atkinson Hyperlegible, sans-serif';
      context.fillStyle = '#333333';

      for (var xTick = -4; xTick <= 4; xTick += 1) {
        var xPoint = point(xTick, 0);
        context.beginPath();
        context.moveTo(xPoint.x, yEnd.y);
        context.lineTo(xPoint.x, origin.y);
        context.stroke();
        if (xTick % 2 === 0) context.fillText(String(xTick), xPoint.x - 6, origin.y + 22);
      }

      for (var yTick = 0; yTick <= 0.8; yTick += 0.2) {
        var yPoint = point(-4, yTick);
        context.beginPath();
        context.moveTo(origin.x, yPoint.y);
        context.lineTo(xEnd.x, yPoint.y);
        context.stroke();
        context.fillText(yTick.toFixed(1), origin.x - 38, yPoint.y + 5);
      }

      context.strokeStyle = '#111111';
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(origin.x, origin.y);
      context.lineTo(xEnd.x, xEnd.y);
      context.moveTo(origin.x, origin.y);
      context.lineTo(yEnd.x, yEnd.y);
      context.stroke();

      context.fillStyle = '#111111';
      context.font = '18px Atkinson Hyperlegible, sans-serif';
      context.fillText('x', xEnd.x - 10, xEnd.y + 38);
      context.save();
      context.translate(yEnd.x - 50, yEnd.y + 105);
      context.rotate(-Math.PI / 2);
      context.fillText('density', 0, 0);
      context.restore();
    }

    function drawLegend() {
      var items = [
        ['component 1', '#1f77b4', [8, 6]],
        ['component 2', '#2ca02c', [8, 6]],
        ['component 3', '#d62728', [8, 6]],
        ['mixture p(x)', '#111111', []]
      ];
      context.font = '14px Atkinson Hyperlegible, sans-serif';
      items.forEach(function (item, index) {
        var y = 72 + index * 23;
        context.save();
        context.strokeStyle = item[1];
        context.lineWidth = index === 3 ? 3 : 2;
        context.setLineDash(item[2]);
        context.beginPath();
        context.moveTo(656, y - 5);
        context.lineTo(704, y - 5);
        context.stroke();
        context.restore();
        context.fillStyle = '#111111';
        context.fillText(item[0], 714, y);
      });
    }

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      var componentColors = ['#1f77b4', '#2ca02c', '#d62728'];
      means.forEach(function (mean, index) {
        drawCurve(function (x) {
          return weights[index] * normalPdf(x, mean, sds[index]);
        }, componentColors[index], 2, [7, 8]);
      });

      drawCurve(function (x) {
        return weights.reduce(function (sum, weight, index) {
          return sum + weight * normalPdf(x, means[index], sds[index]);
        }, 0);
      }, '#111111', 3.5);

      context.fillStyle = '#111111';
      context.font = '19px Newsreader, serif';
      context.fillText('p(x) = Σ_k π_k N(x | μ_k, σ²)', 185, 38);
      drawLegend();
    }

    syncParameters();
    render();
    target.parentNode.insertBefore(card.card, target.nextSibling);
  }

  function drawInferenceFlow(target) {
    var card = makeCard('inference-flow', 'Generative model and posterior inference', 'Click the diagram to reverse the direction from sampling to inference.');
    var svg = createSvg(720, 300, '0 0 720 300');
    svg.setAttribute('aria-label', 'Interactive diagram toggling between generative sampling and posterior inference.');
    var defs = el('defs');
    var marker = el('marker', { id: 'arrowhead-flow', markerWidth: '10', markerHeight: '7', refX: '9', refY: '3.5', orient: 'auto' });
    marker.appendChild(el('path', { d: 'M0,0 L10,3.5 L0,7 Z', class: 'diagram-arrowhead' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var z = el('circle', { cx: 190, cy: 145, r: 42, class: 'diagram-node diagram-node--latent' });
    var x = el('circle', { cx: 520, cy: 145, r: 42, class: 'diagram-node diagram-node--observed' });
    var forward = el('path', { d: 'M235 145 L474 145', class: 'diagram-arrow diagram-flow', 'marker-end': 'url(#arrowhead-flow)' });
    var reverse = el('path', { d: 'M475 172 C385 230 300 230 235 172', class: 'diagram-arrow diagram-reverse', 'marker-end': 'url(#arrowhead-flow)' });
    svg.appendChild(forward);
    svg.appendChild(reverse);
    svg.appendChild(z);
    svg.appendChild(x);
    svg.appendChild(text(180, 155, 'Z', 'diagram-node-label'));
    svg.appendChild(text(508, 155, 'X', 'diagram-node-label'));
    svg.appendChild(text(304, 126, 'sample X | Z', 'diagram-edge-label diagram-forward-label'));
    svg.appendChild(text(302, 246, 'infer Z | X', 'diagram-edge-label diagram-reverse-label'));

    var status = document.createElement('div');
    status.className = 'concept-diagram__status';
    status.textContent = 'Forward direction: choose latent Z, then generate observed X.';

    card.stage.appendChild(svg);
    card.card.appendChild(status);
    card.card.addEventListener('click', function () {
      var inverse = card.card.classList.toggle('is-inference');
      status.textContent = inverse
        ? 'Inference direction: after observing X, approximate the posterior over Z.'
        : 'Forward direction: choose latent Z, then generate observed X.';
    });

    target.parentNode.insertBefore(card.card, target.nextSibling);
  }

  function addSeoMetadata() {
    var post = document.querySelector('#page.post');
    if (!post) return;

    var title = (post.querySelector('h1.title') || post.querySelector('h1') || {}).textContent || document.title || 'Research note';
    title = title.replace(/\s+/g, ' ').trim();
    var paragraphs = Array.prototype.slice.call(post.querySelectorAll('p')).map(function (node) {
      return node.textContent.replace(/\s+/g, ' ').trim();
    }).filter(Boolean);
    var description = paragraphs.find(function (value) { return value.length > 80; }) || paragraphs[0] || title;
    description = description.slice(0, 155);
    var keywords = Array.prototype.slice.call(post.querySelectorAll('h2, h3')).map(function (node) {
      return node.textContent.replace(/[#~]/g, '').replace(/\s+/g, ' ').trim();
    }).filter(Boolean).slice(0, 8);

    function upsertMeta(name, content, attr) {
      attr = attr || 'name';
      if (!content) return;
      var selector = 'meta[' + attr + '="' + name + '"]';
      var meta = document.head.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }

    if (!document.title || document.title === 'Redirecting...') document.title = title + ' - Javid Dadashkarimi';
    upsertMeta('description', description);
    upsertMeta('keywords', keywords.concat(['machine learning', 'statistics', 'research notes']).join(', '));
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:type', 'article', 'property');
    upsertMeta('twitter:card', 'summary_large_image', 'name');

    if (!document.querySelector('link[rel="canonical"]')) {
      var canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = location.href.split('#')[0].split('?')[0];
      document.head.appendChild(canonical);
    }

    if (!document.querySelector('script[data-blog-schema]')) {
      var schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.dataset.blogSchema = 'true';
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        headline: title,
        description: description,
        author: { '@type': 'Person', name: 'Javid Dadashkarimi' },
        educationalLevel: 'graduate',
        learningResourceType: 'lecture notes',
        keywords: keywords
      });
      document.head.appendChild(schema);
    }
  }

  function enhanceFigures() {
    var title = ((document.querySelector('#page.post h1.title') || {}).textContent || '').toLowerCase();
    var body = document.querySelector('#page.post > div:last-of-type');
    if (!body || body.dataset.diagramsEnhanced === 'true') return;
    body.dataset.diagramsEnhanced = 'true';

    var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3'));
    var bayesHeading = headings.find(function (node) { return /bayes|graphical model|generative model/i.test(node.textContent); });
    var mixtureImage = body.querySelector('img[src*="mixture-1d"], img[src*="mixture-2021"]');
    var approxParagraph = Array.prototype.slice.call(body.querySelectorAll('p')).find(function (node) {
      return /Choose \$Z\$|generative model/i.test(node.textContent);
    });

    if ((/bayesian inference/.test(title) || (bayesHeading && /bayes/i.test(bayesHeading.textContent))) && bayesHeading) {
      drawBayesGraph(bayesHeading, {
        title: 'Parameter to observation',
        caption: 'A graphical model makes the modeling assumption visible: theta is latent, x is observed, and the arrow encodes p(x | theta).'
      });
    }

    if (/mixture/.test(title) && mixtureImage) {
      drawMixturePlot(mixtureImage);
    }

    if (/approximation inference|gibbs|variational inference/.test(title) && approxParagraph) {
      drawInferenceFlow(approxParagraph);
    }
  }

  function boot() {
    addSeoMetadata();
    enhanceFigures();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
