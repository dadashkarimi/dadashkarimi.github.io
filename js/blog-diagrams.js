(function () {
  var svgNs = 'http://www.w3.org/2000/svg';
  var diagramUid = 0;

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

  function mathText(x, y, symbol, index, className) {
    var node = el('text', { x: x, y: y, class: className || 'diagram-paper-math' });
    var main = el('tspan', { class: 'diagram-paper-math-symbol' });
    main.textContent = symbol;
    var sub = el('tspan', { class: 'diagram-paper-math-sub', dx: '1', dy: '7' });
    sub.textContent = String(index);
    node.appendChild(main);
    node.appendChild(sub);
    return node;
  }

  function addArrowhead(svg, id, className) {
    var markerId = id + '-' + (++diagramUid);
    var defs = el('defs');
    var marker = el('marker', { id: markerId, markerWidth: '10', markerHeight: '7', refX: '9', refY: '3.5', orient: 'auto' });
    marker.appendChild(el('path', { d: 'M0,0 L10,3.5 L0,7 Z', class: className || 'diagram-arrowhead' }));
    defs.appendChild(marker);
    svg.appendChild(defs);
    return 'url(#' + markerId + ')';
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

  function makeStaticCard(type, title, caption) {
    var card = makeCard(type, title, caption);
    card.card.classList.add('is-static');
    card.card.querySelector('.concept-diagram__label').textContent = 'scientific figure';
    return card;
  }

  function mountDiagram(target, card) {
    var holder = target && target.closest && target.closest('p');
    var node = holder || target;
    if (!node || !node.parentNode) return;
    node.parentNode.replaceChild(card, node);
  }

  function canvasPoint(canvas, x, y, bounds) {
    return {
      x: bounds.left + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * bounds.width,
      y: bounds.top + bounds.height - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * bounds.height
    };
  }

  function drawScientificAxes(context, canvas, bounds, options) {
    options = options || {};
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#e1e1e1';
    context.lineWidth = 1;
    context.font = '14px Newsreader, serif';
    context.fillStyle = '#333333';

    for (var xTick = Math.ceil(bounds.xMin); xTick <= bounds.xMax; xTick += options.xStep || 1) {
      var xp = canvasPoint(canvas, xTick, bounds.yMin, bounds);
      context.beginPath();
      context.moveTo(xp.x, bounds.top);
      context.lineTo(xp.x, bounds.top + bounds.height);
      context.stroke();
      context.fillText(String(xTick), xp.x - 5, bounds.top + bounds.height + 22);
    }

    for (var yTick = Math.ceil(bounds.yMin); yTick <= bounds.yMax; yTick += options.yStep || 1) {
      var yp = canvasPoint(canvas, bounds.xMin, yTick, bounds);
      context.beginPath();
      context.moveTo(bounds.left, yp.y);
      context.lineTo(bounds.left + bounds.width, yp.y);
      context.stroke();
      context.fillText(String(yTick), bounds.left - 34, yp.y + 5);
    }

    var origin = canvasPoint(canvas, bounds.xMin, bounds.yMin, bounds);
    var xEnd = canvasPoint(canvas, bounds.xMax, bounds.yMin, bounds);
    var yEnd = canvasPoint(canvas, bounds.xMin, bounds.yMax, bounds);
    context.strokeStyle = '#111111';
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(xEnd.x, xEnd.y);
    context.moveTo(origin.x, origin.y);
    context.lineTo(yEnd.x, yEnd.y);
    context.stroke();
    context.fillStyle = '#111111';
    context.font = 'italic 19px Newsreader, serif';
    context.fillText(options.xLabel || 'x₁', xEnd.x - 16, xEnd.y + 40);
    context.save();
    context.translate(yEnd.x - 48, yEnd.y + 36);
    context.rotate(-Math.PI / 2);
    context.fillText(options.yLabel || 'x₂', 0, 0);
    context.restore();
  }

  function drawEllipse(context, canvas, bounds, cx, cy, rx, ry, angle, color, dash) {
    var center = canvasPoint(canvas, cx, cy, bounds);
    var xScale = bounds.width / (bounds.xMax - bounds.xMin);
    var yScale = bounds.height / (bounds.yMax - bounds.yMin);
    context.save();
    context.translate(center.x, center.y);
    context.rotate(-angle);
    context.strokeStyle = color;
    context.lineWidth = 2.5;
    context.setLineDash(dash || []);
    context.beginPath();
    context.ellipse(0, 0, rx * xScale, ry * yScale, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawGaussianDataFigure(target) {
    var card = makeStaticCard('cluster-figure', 'Why one Gaussian is not enough', 'Two separated clouds are better explained by component-specific means and covariances than by one global Gaussian.');
    var canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 460;
    card.stage.appendChild(canvas);
    var context = canvas.getContext('2d');
    var bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 3, left: 70, top: 34, width: 760, height: 350 };
    drawScientificAxes(context, canvas, bounds, { xStep: 1, yStep: 1, xLabel: 'x₁', yLabel: 'x₂' });

    var clusters = [
      { color: '#1f77b4', cx: -1.25, cy: -0.9, angle: -0.55 },
      { color: '#d62728', cx: 1.15, cy: 1.0, angle: -0.48 }
    ];
    clusters.forEach(function (cluster, clusterIndex) {
      for (var index = 0; index < 42; index += 1) {
        var u = (index * 37 % 41) / 41 - 0.5;
        var v = (index * 19 % 43) / 43 - 0.5;
        var x = cluster.cx + 1.05 * u + 0.48 * v;
        var y = cluster.cy + 0.55 * u + 1.0 * v;
        var p = canvasPoint(canvas, x, y, bounds);
        context.fillStyle = cluster.color;
        context.globalAlpha = 0.85;
        context.beginPath();
        context.arc(p.x, p.y, 4, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      drawEllipse(context, canvas, bounds, cluster.cx, cluster.cy, 1.25, 0.72, cluster.angle, cluster.color, [6, 5]);
      context.fillStyle = cluster.color;
      context.font = '18px Newsreader, serif';
      context.fillText('component ' + (clusterIndex + 1), canvasPoint(canvas, cluster.cx - 0.55, cluster.cy + 1.15, bounds).x, canvasPoint(canvas, cluster.cx, cluster.cy + 1.15, bounds).y);
    });
    mountDiagram(target, card.card);
  }

  function drawLatentPlateFigure(target) {
    var card = makeStaticCard('latent-plate', 'Latent assignment model for a mixture', 'For each observation xₙ, a hidden one-hot variable zₙ chooses which Gaussian component generated it.');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Plate diagram for a Gaussian mixture model with parameters π, μ, Σ, latent z_n, and observed x_n.');
    var defs = el('defs');
    var marker = el('marker', { id: 'arrowhead-plate', markerWidth: '10', markerHeight: '7', refX: '9', refY: '3.5', orient: 'auto' });
    marker.appendChild(el('path', { d: 'M0,0 L10,3.5 L0,7 Z', class: 'diagram-arrowhead diagram-paper-arrowhead' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    svg.appendChild(el('rect', { x: 330, y: 42, width: 270, height: 260, rx: 8, class: 'diagram-paper-plate' }));
    svg.appendChild(el('circle', { cx: 460, cy: 105, r: 34, class: 'diagram-paper-node diagram-paper-node--latent' }));
    svg.appendChild(el('circle', { cx: 460, cy: 225, r: 34, class: 'diagram-paper-node diagram-paper-node--observed' }));
    svg.appendChild(el('path', { d: 'M460 140 L460 188', class: 'diagram-paper-arrow', 'marker-end': 'url(#arrowhead-plate)' }));

    [['π', 120, 95], ['μ', 120, 175], ['Σ', 120, 255]].forEach(function (row) {
      svg.appendChild(el('circle', { cx: 215, cy: row[2] - 5, r: 7, class: 'diagram-paper-dot' }));
      svg.appendChild(text(62, row[2] + 2, '(' + row[0] + '₁,…,' + row[0] + 'ₖ)', 'diagram-paper-param'));
      svg.appendChild(el('path', { d: 'M225 ' + (row[2] - 5) + ' C285 ' + (row[2] - 5) + ' 310 105 424 105', class: 'diagram-paper-arrow diagram-paper-arrow--thin', 'marker-end': 'url(#arrowhead-plate)' }));
    });
    svg.appendChild(text(493, 114, 'zₙ', 'diagram-paper-label'));
    svg.appendChild(text(493, 234, 'xₙ', 'diagram-paper-label'));
    svg.appendChild(text(544, 286, 'n = 1,…,N', 'diagram-paper-small'));
    svg.appendChild(text(630, 112, 'latent', 'diagram-paper-small'));
    svg.appendChild(text(630, 232, 'observed', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawIidPlateFigure(target, repeated) {
    var card = makeStaticCard(
      repeated ? 'iid-plate' : 'single-plate',
      repeated ? 'Plate notation for i.i.d. data' : 'Latent parameter and observation',
      repeated
        ? 'The open node is the latent parameter; each observed node xᵢ appears as another likelihood term p(xᵢ | θ).'
        : 'The parameter θ generates an observed sample x through the likelihood p(x | θ).'
    );
    var svg = createSvg(820, 300, '0 0 820 300');
    svg.setAttribute('aria-label', repeated ? 'Plate notation diagram for independent observations generated by θ.' : 'Graphical model diagram where θ generates x.');
    var markerUrl = addArrowhead(svg, 'arrowhead-iid-plate', 'diagram-paper-arrowhead');

    if (repeated) {
      svg.appendChild(el('rect', { x: 76, y: 124, width: 118, height: 118, rx: 8, class: 'diagram-paper-plate diagram-plate-draw' }));
      svg.appendChild(text(170, 232, 'n', 'diagram-paper-small'));
    }

    svg.appendChild(el('circle', { cx: 135, cy: 56, r: 25, class: 'diagram-paper-node diagram-paper-node--latent diagram-step diagram-step--1' }));
    svg.appendChild(text(176, 67, '\u03b8', 'diagram-paper-label diagram-paper-label--large'));
    svg.appendChild(el('path', { d: 'M135 82 L135 145', class: 'diagram-paper-arrow diagram-step diagram-step--link-1', 'marker-end': markerUrl }));
    svg.appendChild(el('circle', { cx: 135, cy: 184, r: 25, class: 'diagram-paper-node diagram-paper-node--observed-red diagram-step diagram-step--2' }));
    svg.appendChild(mathText(135, 190, 'x', repeated ? 'i' : '', 'diagram-paper-math diagram-paper-math--white'));

    if (repeated) {
      [['x', 1, 330, 165], ['x', 2, 410, 165], ['...', '', 488, 166], ['x', 'n', 570, 165]].forEach(function (node, index) {
        var stepClass = ' diagram-copy--' + (index + 1);
        if (node[0] === '...') {
          svg.appendChild(text(node[2] - 10, node[3] + 6, '...', 'diagram-paper-label diagram-copy' + stepClass));
          return;
        }
        svg.appendChild(el('path', { d: 'M160 70 C230 70 ' + (node[2] - 36) + ' 96 ' + node[2] + ' 136', class: 'diagram-paper-arrow diagram-paper-arrow--thin diagram-copy' + stepClass, 'marker-end': markerUrl }));
        svg.appendChild(el('circle', { cx: node[2], cy: node[3], r: 22, class: 'diagram-paper-node diagram-paper-node--observed-red diagram-copy' + stepClass }));
        svg.appendChild(mathText(node[2], node[3] + 6, node[0], node[1], 'diagram-paper-math diagram-paper-math--white diagram-copy' + stepClass));
      });
      svg.appendChild(text(286, 74, 'same parameter, repeated likelihood terms', 'diagram-paper-small diagram-copy'));
      svg.appendChild(text(286, 238, 'P(θ, x₁, …, xₙ) = P(θ) · ∏ᵢ p(xᵢ | θ)', 'diagram-paper-small diagram-copy'));
    } else {
      svg.appendChild(text(286, 78, 'prior: P(θ)', 'diagram-paper-small'));
      svg.appendChild(text(286, 128, 'likelihood: P(x | θ)', 'diagram-paper-small'));
      svg.appendChild(text(286, 196, 'joint: P(θ, x) = P(θ) P(x | θ)', 'diagram-paper-small'));
    }

    card.stage.appendChild(svg);
    if (repeated) card.card.classList.add('is-expanded');
    mountDiagram(target, card.card);
  }

  function drawBayesComparisonTable(target) {
    var card = makeStaticCard('bayes-table', 'Frequentist and Bayesian estimators', 'The same statistical problem can be approached as direct estimation or as inference under a prior over functions or distributions.');
    var table = document.createElement('table');
    table.className = 'diagram-comparison-table';
    table.innerHTML = '' +
      '<thead><tr><th>Statistical problem</th><th>Frequentist approach</th><th>Bayesian approach</th></tr></thead>' +
      '<tbody>' +
        '<tr><td>regression</td><td>kernel smoother</td><td>Gaussian process</td></tr>' +
        '<tr><td>CDF estimation</td><td>empirical CDF</td><td>Dirichlet process</td></tr>' +
        '<tr><td>density estimation</td><td>kernel density estimator</td><td>Dirichlet process mixture</td></tr>' +
      '</tbody>';
    card.stage.appendChild(table);
    mountDiagram(target, card.card);
  }

  function drawDirichletSimplexFigure(target) {
    var card = makeStaticCard('dirichlet-simplex', 'Dirichlet posterior concentration', 'As more categorical observations arrive, the posterior mass concentrates around the empirical proportions.');
    var svg = createSvg(820, 430, '0 0 820 430');
    svg.setAttribute('aria-label', 'Four triangular simplex panels showing prior, likelihood, and posterior concentration for a Dirichlet model.');

    function triangle(cx, cy, scale, label, phase) {
      var top = [cx, cy - 72];
      var left = [cx - 82, cy + 64];
      var right = [cx + 82, cy + 64];
      svg.appendChild(el('polygon', { points: top.join(',') + ' ' + left.join(',') + ' ' + right.join(','), class: 'diagram-simplex-base' }));
      for (var ring = 0; ring < 5; ring += 1) {
        var t = 0.12 + ring * 0.12 + phase;
        var points = [
          [cx, cy - 58 + ring * 10],
          [cx - 62 + ring * 9, cy + 50 - ring * 5],
          [cx + 62 - ring * 12, cy + 50 - ring * 8]
        ];
        svg.appendChild(el('polygon', { points: points.map(function (point) { return point.join(','); }).join(' '), class: 'diagram-simplex-contour', opacity: (0.28 + t).toFixed(2) }));
      }
      svg.appendChild(el('circle', { cx: cx - 14 + phase * 48, cy: cy + 6 - phase * 32, r: 6, class: 'diagram-simplex-dot' }));
      svg.appendChild(text(cx - 102, cy + 104, label, 'diagram-paper-small'));
    }

    triangle(220, 124, 1, 'prior: Dirichlet(6,6,6)', 0.02);
    triangle(600, 124, 1, 'likelihood after n = 20', 0.12);
    triangle(220, 318, 1, 'posterior after n = 20', 0.18);
    triangle(600, 318, 1, 'posterior after n = 200', 0.28);
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawRlLoopFigure(target) {
    var card = makeStaticCard('rl-loop', 'Agent-environment loop', 'At each time step, the agent observes state and reward, takes an action, and the environment transitions to the next state.');
    card.card.classList.add('is-animated-loop');
    var svg = createSvg(820, 380, '0 0 820 380');
    svg.setAttribute('aria-label', 'Reinforcement learning loop connecting agent and environment through actions, states, and rewards.');
    var markerUrl = addArrowhead(svg, 'arrowhead-rl-loop', 'diagram-paper-arrowhead');

    svg.appendChild(el('rect', { x: 292, y: 48, width: 236, height: 72, rx: 18, class: 'diagram-paper-box diagram-paper-box--agent' }));
    svg.appendChild(text(366, 92, 'Agent', 'diagram-paper-label diagram-paper-label--white'));
    svg.appendChild(el('rect', { x: 292, y: 252, width: 236, height: 72, rx: 18, class: 'diagram-paper-box diagram-paper-box--environment' }));
    svg.appendChild(text(334, 296, 'Environment', 'diagram-paper-label diagram-paper-label--white'));

    svg.appendChild(el('path', { d: 'M528 84 C668 84 678 288 530 288', class: 'diagram-paper-arrow diagram-loop-action', 'marker-end': markerUrl }));
    svg.appendChild(el('path', { d: 'M292 288 C146 288 144 84 290 84', class: 'diagram-paper-arrow diagram-loop-state', 'marker-end': markerUrl }));
    svg.appendChild(el('path', { d: 'M292 305 C176 305 174 102 292 102', class: 'diagram-paper-arrow diagram-loop-reward', 'marker-end': markerUrl }));

    svg.appendChild(mathText(680, 154, 'A', 't', 'diagram-paper-math'));
    svg.appendChild(text(720, 158, 'action', 'diagram-paper-small'));
    svg.appendChild(mathText(82, 178, 'S', 't', 'diagram-paper-math'));
    svg.appendChild(text(34, 178, 'state', 'diagram-paper-small'));
    svg.appendChild(mathText(188, 204, 'R', 't', 'diagram-paper-math'));
    svg.appendChild(mathText(326, 354, 'S', 't+1', 'diagram-paper-math'));
    svg.appendChild(mathText(436, 354, 'R', 't+1', 'diagram-paper-math'));

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawGraphModelFigure(target, title, caption) {
    var card = makeStaticCard('graph-model', title || 'Graphical model structure', caption || 'Nodes represent random variables and edges encode the conditional-dependence structure.');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Scientific graph diagram with variables connected by conditional-dependence edges.');
    var edges = [[170, 110, 320, 90], [320, 90, 470, 126], [320, 90, 330, 230], [470, 126, 610, 100], [470, 126, 565, 245], [330, 230, 565, 245], [170, 110, 260, 250]];
    edges.forEach(function (edge) {
      svg.appendChild(el('line', { x1: edge[0], y1: edge[1], x2: edge[2], y2: edge[3], class: 'diagram-paper-edge' }));
    });
    [
      ['X₁', 170, 110, 'observed'], ['X₂', 320, 90, 'observed'], ['X₃', 470, 126, 'latent'],
      ['X₄', 610, 100, 'observed'], ['X₅', 330, 230, 'latent'], ['X₆', 565, 245, 'observed'], ['X₇', 260, 250, 'observed']
    ].forEach(function (node) {
      svg.appendChild(el('circle', { cx: node[1], cy: node[2], r: 32, class: 'diagram-paper-node diagram-paper-node--' + node[3] }));
      svg.appendChild(text(node[1] - 14, node[2] + 8, node[0], 'diagram-paper-label'));
    });
    svg.appendChild(text(74, 318, 'observed variables: filled / latent variables: open', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawCrpFigure(target) {
    var card = makeStaticCard('crp-figure', 'Chinese restaurant process intuition', 'A new observation either joins an existing cluster with probability proportional to its size, or starts a new cluster.');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Chinese restaurant process diagram showing customers assigned to clusters.');
    var markerUrl = addArrowhead(svg, 'arrowhead-crp', 'diagram-paper-arrowhead');
    var tables = [[190, 150, 3, '#1f77b4'], [410, 145, 4, '#2ca02c'], [610, 178, 2, '#d62728']];
    tables.forEach(function (table, tableIndex) {
      svg.appendChild(el('ellipse', { cx: table[0], cy: table[1], rx: 82, ry: 46, class: 'diagram-table' }));
      svg.appendChild(text(table[0] - 30, table[1] + 7, 'cluster ' + (tableIndex + 1), 'diagram-paper-small'));
      for (var index = 0; index < table[2]; index += 1) {
        var angle = (Math.PI * 2 * index / table[2]) - Math.PI / 2;
        var cx = table[0] + Math.cos(angle) * 58;
        var cy = table[1] + Math.sin(angle) * 72;
        svg.appendChild(el('circle', { cx: cx, cy: cy, r: 14, fill: table[3], class: 'diagram-table-customer' }));
      }
    });
    svg.appendChild(el('path', { d: 'M112 292 C240 248 318 272 365 232', class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
    svg.appendChild(text(82, 315, 'P(join k) ∝ nₖ', 'diagram-paper-small'));
    svg.appendChild(text(548, 72, 'P(new table) ∝ α', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawVaeFigure(target) {
    var card = makeStaticCard('vae-figure', 'Variational autoencoder', 'The encoder approximates qφ(z | x), latent samples pass through z, and the decoder models pθ(x | z).');
    var svg = createSvg(820, 320, '0 0 820 320');
    svg.setAttribute('aria-label', 'VAE architecture diagram with encoder, latent variable, and decoder.');
    var markerUrl = addArrowhead(svg, 'arrowhead-vae', 'diagram-paper-arrowhead');
    [['x', 90, 160], ['encoder', 260, 160], ['z', 410, 160], ['decoder', 565, 160], ['x̂', 735, 160]].forEach(function (node, index) {
      var width = index === 1 || index === 3 ? 118 : 70;
      svg.appendChild(el('rect', { x: node[1] - width / 2, y: node[2] - 38, width: width, height: 76, rx: 8, class: index === 2 ? 'diagram-paper-node--latent-box' : 'diagram-paper-box' }));
      if (node[0] === 'encoder') {
        svg.appendChild(mathText(node[1] - width / 2 + 18, node[2] + 8, 'q', 'φ', 'diagram-paper-label diagram-paper-math'));
        svg.appendChild(text(node[1] - width / 2 + 42, node[2] + 8, '(z | x)', 'diagram-paper-label'));
      } else if (node[0] === 'decoder') {
        svg.appendChild(mathText(node[1] - width / 2 + 18, node[2] + 8, 'p', 'θ', 'diagram-paper-label diagram-paper-math'));
        svg.appendChild(text(node[1] - width / 2 + 42, node[2] + 8, '(x | z)', 'diagram-paper-label'));
      } else {
        svg.appendChild(text(node[1] - width / 2 + 18, node[2] + 8, node[0], 'diagram-paper-label'));
      }
    });
    [[128, 160, 198, 160], [320, 160, 372, 160], [448, 160, 506, 160], [625, 160, 696, 160]].forEach(function (edge) {
      svg.appendChild(el('path', { d: 'M' + edge[0] + ' ' + edge[1] + ' L' + edge[2] + ' ' + edge[3], class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
    });
    svg.appendChild(text(235, 252, 'ELBO = reconstruction − KL(qφ(z | x) ∥ p(z))', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawRnnSequenceFigure(target) {
    var title = 'Recurrent neural network';
    var caption = 'Inputs are processed one step at a time through hidden states h_t before producing outputs y_t.';
    var card = makeStaticCard('sequence-figure', title || 'Sequence model', caption || 'A recurrent or attention-based model transforms an input sequence into contextual hidden states before prediction.');
    card.card.classList.add('is-staged');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Sequence model diagram with input tokens, hidden states, and output tokens.');
    var markerUrl = addArrowhead(svg, 'arrowhead-sequence', 'diagram-paper-arrowhead');
    for (var index = 0; index < 5; index += 1) {
      var x = 120 + index * 130;
      var stageClass = 'diagram-step diagram-step--' + (index + 1);
      svg.appendChild(el('rect', { x: x - 34, y: 258, width: 68, height: 48, rx: 8, class: 'diagram-paper-box ' + stageClass }));
      svg.appendChild(el('circle', { cx: x, cy: 174, r: 32, class: 'diagram-paper-node diagram-paper-node--latent ' + stageClass }));
      svg.appendChild(el('rect', { x: x - 34, y: 28, width: 68, height: 48, rx: 8, class: 'diagram-paper-box diagram-paper-output ' + stageClass }));
      svg.appendChild(mathText(x, 287, 'x', index + 1, 'diagram-paper-math diagram-paper-math--sequence ' + stageClass));
      svg.appendChild(mathText(x, 179, 'h', index + 1, 'diagram-paper-math diagram-paper-math--sequence ' + stageClass));
      svg.appendChild(mathText(x, 57, 'y', index + 1, 'diagram-paper-math diagram-paper-math--sequence ' + stageClass));
      svg.appendChild(el('path', { d: 'M' + x + ' 258 L' + x + ' 208', class: 'diagram-paper-arrow ' + stageClass, 'marker-end': markerUrl }));
      svg.appendChild(el('path', { d: 'M' + x + ' 140 L' + x + ' 78', class: 'diagram-paper-arrow ' + stageClass, 'marker-end': markerUrl }));
      if (index < 4) svg.appendChild(el('path', { d: 'M' + (x + 34) + ' 174 L' + (x + 96) + ' 174', class: 'diagram-paper-arrow diagram-step diagram-step--link-' + (index + 1), 'marker-end': markerUrl }));
    }
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawSelfAttentionFigure(target) {
    var card = makeStaticCard('attention-figure', 'Self-attention sequence model', 'Each token builds a contextual representation by attending to every token in the sequence.');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Self-attention diagram with tokens connected to a shared attention matrix and contextual outputs.');
    var markerUrl = addArrowhead(svg, 'arrowhead-attention', 'diagram-paper-arrowhead');
    var tokens = ['x', 'x', 'x', 'x'];

    for (var index = 0; index < 4; index += 1) {
      var x = 115 + index * 125;
      svg.appendChild(el('rect', { x: x - 34, y: 260, width: 68, height: 48, rx: 8, class: 'diagram-paper-box' }));
      svg.appendChild(mathText(x, 289, tokens[index], index + 1, 'diagram-paper-math diagram-paper-math--sequence'));
      svg.appendChild(el('path', { d: 'M' + x + ' 260 C' + (x + 18) + ' 220 520 220 572 182', class: 'diagram-paper-arrow diagram-paper-arrow--thin', 'marker-end': markerUrl }));
    }

    svg.appendChild(el('rect', { x: 548, y: 76, width: 176, height: 176, rx: 10, class: 'diagram-paper-box diagram-attention-matrix' }));
    for (var row = 0; row < 4; row += 1) {
      for (var col = 0; col < 4; col += 1) {
        var opacity = 0.22 + 0.13 * ((row + col) % 4);
        svg.appendChild(el('rect', { x: 570 + col * 34, y: 98 + row * 34, width: 24, height: 24, rx: 4, class: 'diagram-attention-cell', opacity: opacity.toFixed(2) }));
      }
    }
    svg.appendChild(text(586, 67, 'attention weights', 'diagram-paper-small'));

    for (var outIndex = 0; outIndex < 4; outIndex += 1) {
      var y = 68 + outIndex * 54;
      svg.appendChild(el('rect', { x: 92, y: y - 22, width: 82, height: 44, rx: 8, class: 'diagram-paper-box diagram-paper-output' }));
      svg.appendChild(mathText(133, y + 5, 'c', outIndex + 1, 'diagram-paper-math'));
      svg.appendChild(el('path', { d: 'M548 ' + (116 + outIndex * 34) + ' C420 ' + y + ' 275 ' + y + ' 176 ' + y, class: 'diagram-paper-arrow diagram-paper-arrow--thin', 'marker-end': markerUrl }));
    }

    svg.appendChild(text(232, 185, 'all tokens interact in parallel', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawEncoderDecoderFigure(target) {
    var card = makeStaticCard('encoder-decoder-figure', 'Encoder-decoder sequence model', 'The encoder compresses the source sequence into contextual states; the decoder generates target tokens step by step.');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Encoder-decoder diagram with source tokens, encoded context, and autoregressive decoder outputs.');
    var markerUrl = addArrowhead(svg, 'arrowhead-encoder-decoder', 'diagram-paper-arrowhead');

    for (var sourceIndex = 0; sourceIndex < 3; sourceIndex += 1) {
      var sourceX = 96 + sourceIndex * 94;
      svg.appendChild(el('rect', { x: sourceX - 31, y: 248, width: 62, height: 44, rx: 8, class: 'diagram-paper-box' }));
      svg.appendChild(mathText(sourceX, 274, 'x', sourceIndex + 1, 'diagram-paper-math'));
      svg.appendChild(el('path', { d: 'M' + sourceX + ' 248 L' + sourceX + ' 196', class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
      svg.appendChild(el('circle', { cx: sourceX, cy: 158, r: 30, class: 'diagram-paper-node diagram-paper-node--latent' }));
      svg.appendChild(mathText(sourceX, 163, 'e', sourceIndex + 1, 'diagram-paper-math'));
      if (sourceIndex < 2) svg.appendChild(el('path', { d: 'M' + (sourceX + 31) + ' 158 L' + (sourceX + 63) + ' 158', class: 'diagram-paper-arrow diagram-paper-arrow--thin', 'marker-end': markerUrl }));
    }

    svg.appendChild(el('path', { d: 'M312 158 C370 106 450 106 508 158', class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
    svg.appendChild(el('rect', { x: 338, y: 82, width: 144, height: 54, rx: 10, class: 'diagram-paper-node--latent-box' }));
    svg.appendChild(text(370, 116, 'context', 'diagram-paper-small'));

    for (var targetIndex = 0; targetIndex < 3; targetIndex += 1) {
      var targetX = 542 + targetIndex * 92;
      svg.appendChild(el('circle', { cx: targetX, cy: 158, r: 30, class: 'diagram-paper-node diagram-paper-node--latent' }));
      svg.appendChild(mathText(targetX, 163, 'd', targetIndex + 1, 'diagram-paper-math'));
      svg.appendChild(el('path', { d: 'M' + targetX + ' 126 L' + targetX + ' 80', class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
      svg.appendChild(el('rect', { x: targetX - 31, y: 30, width: 62, height: 44, rx: 8, class: 'diagram-paper-box diagram-paper-output' }));
      svg.appendChild(mathText(targetX, 56, 'y', targetIndex + 1, 'diagram-paper-math'));
      if (targetIndex < 2) svg.appendChild(el('path', { d: 'M' + (targetX + 31) + ' 158 L' + (targetX + 61) + ' 158', class: 'diagram-paper-arrow diagram-paper-arrow--thin', 'marker-end': markerUrl }));
    }

    svg.appendChild(text(86, 326, 'encoder: read source sequence', 'diagram-paper-small'));
    svg.appendChild(text(542, 326, 'decoder: generate target sequence', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
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
    svg.setAttribute('aria-label', 'Bayesian graphical model showing a parameter θ generating an observation x.');

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
      copies.push(path, node, text(cx - 8, 139, ['x₁', 'x₂', 'x₃'][index], 'diagram-node-label diagram-copy'));
    }

    svg.appendChild(plate);
    svg.appendChild(theta);
    svg.appendChild(x);
    svg.appendChild(arrow);
    svg.appendChild(text(162, 86, '\u03b8', 'diagram-node-label diagram-node-label--math'));
    svg.appendChild(text(164, 187, 'x', 'diagram-node-label'));
    svg.appendChild(text(350, 202, 'n observations', 'diagram-plate-label diagram-copy'));
    copies.forEach(function (node) { svg.appendChild(node); });

    var status = document.createElement('div');
    status.className = 'concept-diagram__status';
    status.textContent = 'Parameter \u03b8 generates one observation x.';

    card.stage.appendChild(svg);
    card.card.appendChild(status);

    addButton(card.card, 'show repeated observations', function () {
      state.step = (state.step + 1) % 2;
      card.card.classList.toggle('is-expanded', state.step === 1);
      status.textContent = state.step === 1
        ? 'The same latent parameter \u03b8 can generate a sample x₁, x₂, ..., xₙ.'
        : 'Parameter \u03b8 generates one observation x.';
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
    addRange('mean separation |μ₃ − μ₂|', 0.8, 3.2, 0.05, params.separation, function (value) {
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
      context.font = '14px Newsreader, serif';
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
      context.font = 'italic 19px Newsreader, serif';
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
      context.font = '14px Newsreader, serif';
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
      context.font = 'italic 20px Newsreader, serif';
      context.fillText('p(x) = Σₖ πₖ N(x | μₖ, σ²)', 185, 38);
      drawLegend();
    }

    syncParameters();
    render();
    mountDiagram(target, card.card);
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

  function enhanceFigures() {
    var title = ((document.querySelector('#page.post h1.title') || {}).textContent || '').toLowerCase();
    var post = document.querySelector('#page.post');
    var body = post ? getPostBody(post) : null;
    if (!body || body.dataset.diagramsEnhanced === 'true') return;
    body.dataset.diagramsEnhanced = 'true';

    var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3'));
    var bayesHeading = headings.find(function (node) { return /bayes|graphical model|generative model/i.test(node.textContent); });
    var mixtureDensityImage = body.querySelector('img[src*="mixture-1d"]');
    var approxParagraph = Array.prototype.slice.call(body.querySelectorAll('p')).find(function (node) {
      return /Choose \$Z\$|generative model/i.test(node.textContent);
    });

    Array.prototype.slice.call(body.querySelectorAll('img')).forEach(function (image) {
      var src = image.getAttribute('src') || '';
      if (/mixture-2021\.png/i.test(src)) {
        drawGaussianDataFigure(image);
      } else if (/map2?\.jpg/i.test(src)) {
        drawIidPlateFigure(image, /map2\.jpg/i.test(src));
      } else if (/bayes_table\.png/i.test(src)) {
        drawBayesComparisonTable(image);
      } else if (/sds-365\/dirichlet\.png/i.test(src)) {
        drawDirichletSimplexFigure(image);
      } else if (/sds-365\/rl\.png/i.test(src)) {
        drawRlLoopFigure(image);
      } else if (/mixture-mle-1d\.png/i.test(src)) {
        drawLatentPlateFigure(image);
      } else if (/(^|\/)graph\.png|cond_ind_graph|discrete_gm/i.test(src)) {
        drawGraphModelFigure(image, /cond_ind/i.test(src) ? 'Conditional independence graph' : 'Graphical model structure');
      } else if (/crp(_|\.)|crp_5|crp_6/i.test(src)) {
        drawCrpFigure(image);
      } else if (/(^|\/)vae\.png|sds-365\/vae\.png/i.test(src)) {
        drawVaeFigure(image);
      } else if (/rnn_2/i.test(src)) {
        drawRnnSequenceFigure(image);
      } else if (/transformer\.png/i.test(src)) {
        drawSelfAttentionFigure(image);
      } else if (/seq_to_seq/i.test(src)) {
        drawEncoderDecoderFigure(image);
      }
    });

    if ((/bayesian inference/.test(title) || (bayesHeading && /bayes/i.test(bayesHeading.textContent))) && bayesHeading) {
      drawBayesGraph(bayesHeading, {
        title: 'Parameter to observation',
        caption: 'A graphical model makes the modeling assumption visible: \u03b8 is latent, x is observed, and the arrow encodes p(x | \u03b8).'
      });
    }

    if (/mixture/.test(title) && mixtureDensityImage && document.body.contains(mixtureDensityImage)) {
      drawMixturePlot(mixtureDensityImage);
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
