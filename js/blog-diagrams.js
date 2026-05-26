(function () {
  var svgNs = 'http://www.w3.org/2000/svg';
  var diagramUid = 0;
  var diagramNumber = 0;

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
    var card = document.createElement('figure');
    card.className = 'concept-diagram scifig concept-diagram--' + type;
    card.dataset.diagram = type;

    var head = document.createElement('div');
    head.className = 'concept-diagram__head scifig-head';

    var label = document.createElement('span');
    label.className = 'concept-diagram__label scifig-eyebrow';
    label.textContent = 'interactive figure';

    var heading = document.createElement('span');
    heading.className = 'scifig-title';
    heading.textContent = title;

    head.appendChild(label);
    head.appendChild(heading);
    card.appendChild(head);

    var stage = document.createElement('div');
    stage.className = 'concept-diagram__stage scifig-plate';
    var number = document.createElement('span');
    number.className = 'scifig-num';
    diagramNumber += 1;
    number.textContent = 'FIG ' + String(diagramNumber).padStart(2, '0');
    stage.appendChild(number);
    card.appendChild(stage);

    if (caption) {
      var copy = document.createElement('figcaption');
      copy.className = 'concept-diagram__caption scifig-caption';
      copy.textContent = caption;
      card.appendChild(copy);
    }

    return { card: card, stage: stage };
  }

  function makeStaticCard(type, title, caption) {
    var card = makeCard(type, title, caption);
    card.card.classList.add('is-static');
    card.card.querySelector('.scifig-eyebrow').textContent = 'scientific figure';
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
    var card = makeStaticCard('cluster-figure', 'Gaussian density over (x1, x2) data', 'A 2D Gaussian rendered in 3D: density is vertical, data live on the floor, and the dashed ellipse is the projected 1-sigma contour.');
    var svg = createSvg(760, 480, '0 0 760 480');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', '3D Gaussian density over a data cloud with principal axes and equation card.');

    var defs = el('defs');
    var axisMarker = el('marker', { id: 'axarr-gauss3d-' + (++diagramUid), viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse' });
    axisMarker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#1a1a1a' }));
    defs.appendChild(axisMarker);
    var purpleMarker = el('marker', { id: 'purplearr-gauss3d-' + (++diagramUid), viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '9', markerHeight: '9', orient: 'auto-start-reverse' });
    purpleMarker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#7e4dc8' }));
    defs.appendChild(purpleMarker);

    var bellGrad = el('radialGradient', { id: 'bell-grad-' + (++diagramUid), cx: '50%', cy: '55%', r: '55%', fx: '50%', fy: '55%' });
    bellGrad.appendChild(el('stop', { offset: '0%', 'stop-color': '#fcd34d', 'stop-opacity': '0.95' }));
    bellGrad.appendChild(el('stop', { offset: '35%', 'stop-color': '#f59e0b', 'stop-opacity': '0.7' }));
    bellGrad.appendChild(el('stop', { offset: '70%', 'stop-color': '#d97706', 'stop-opacity': '0.4' }));
    bellGrad.appendChild(el('stop', { offset: '100%', 'stop-color': '#7c2d12', 'stop-opacity': '0.08' }));
    defs.appendChild(bellGrad);

    var floorGrid = el('pattern', { id: 'floor-grid-' + (++diagramUid), x: '0', y: '0', width: '40', height: '20', patternUnits: 'userSpaceOnUse', patternTransform: 'skewX(-30)' });
    floorGrid.appendChild(el('line', { x1: '0', y1: '0', x2: '0', y2: '20', stroke: '#e5e7eb', 'stroke-width': '1' }));
    floorGrid.appendChild(el('line', { x1: '0', y1: '0', x2: '40', y2: '0', stroke: '#e5e7eb', 'stroke-width': '1' }));
    defs.appendChild(floorGrid);

    var bellGradId = bellGrad.getAttribute('id');
    var floorGridId = floorGrid.getAttribute('id');
    var axisMarkerId = axisMarker.getAttribute('id');
    var purpleMarkerId = purpleMarker.getAttribute('id');

    svg.appendChild(defs);

    svg.appendChild(el('polygon', { points: '210,340 580,250 720,360 350,450', fill: 'url(#' + floorGridId + ')', stroke: '#1a1a1a', 'stroke-width': '1.2' }));
    svg.appendChild(el('ellipse', { cx: '460', cy: '350', rx: '110', ry: '40', fill: '#fed7aa', 'fill-opacity': '0.55', stroke: '#c2410c', 'stroke-width': '1.6', 'stroke-dasharray': '5 4', transform: 'rotate(-12 460 350)' }));
    svg.appendChild(el('ellipse', { cx: '460', cy: '350', rx: '170', ry: '62', fill: 'none', stroke: '#c2410c', 'stroke-width': '1', 'stroke-dasharray': '3 5', opacity: '0.4', transform: 'rotate(-12 460 350)' }));

    [[395, 335, 4], [430, 338, 4], [448, 350, 4], [465, 345, 4], [478, 342, 4], [490, 355, 4], [510, 348, 4], [525, 358, 4], [540, 352, 4], [412, 358, 4], [455, 370, 4], [500, 368, 4], [475, 328, 4], [430, 320, 4], [380, 318, 3.5], [560, 375, 3.5], [395, 380, 3.5], [550, 320, 3.5]].forEach(function (point) {
      svg.appendChild(el('circle', { cx: String(point[0]), cy: String(point[1]), r: String(point[2]), fill: '#2563eb', stroke: '#ffffff', 'stroke-width': '0.8' }));
    });

    [[460, 340, 135, 42, 0.95], [460, 320, 120, 36, 0.92], [460, 295, 105, 30, 0.92], [460, 265, 88, 24, 0.93], [460, 232, 70, 18, 0.94], [460, 200, 50, 13, 0.95], [460, 172, 30, 8, 0.96]].forEach(function (layer) {
      svg.appendChild(el('ellipse', { cx: String(layer[0]), cy: String(layer[1]), rx: String(layer[2]), ry: String(layer[3]), fill: 'url(#' + bellGradId + ')', opacity: String(layer[4]) }));
    });
    svg.appendChild(el('ellipse', { cx: '460', cy: '155', rx: '15', ry: '4', fill: '#fef3c7' }));
    svg.appendChild(el('circle', { cx: '460', cy: '150', r: '3.5', fill: '#92400e' }));

    svg.appendChild(el('line', { x1: '460', y1: '450', x2: '460', y2: '120', stroke: '#1a1a1a', 'stroke-width': '1', 'stroke-dasharray': '2 4', opacity: '0.5' }));
    svg.appendChild(el('line', { x1: '460', y1: '155', x2: '460', y2: '350', stroke: '#1a1a1a', 'stroke-width': '1.2', 'stroke-dasharray': '3 3', opacity: '0.6' }));
    svg.appendChild(el('circle', { cx: '460', cy: '350', r: '5', fill: '#1a1a1a' }));
    svg.appendChild(text(475, 362, 'μ', 'diagram-paper-math'));
    svg.appendChild(el('line', { x1: '460', y1: '350', x2: '370', y2: '330', stroke: '#7e4dc8', 'stroke-width': '2.5', 'marker-end': 'url(#' + purpleMarkerId + ')' }));
    svg.appendChild(el('line', { x1: '460', y1: '350', x2: '490', y2: '305', stroke: '#7e4dc8', 'stroke-width': '2.5', 'marker-end': 'url(#' + purpleMarkerId + ')' }));

    svg.appendChild(el('line', { x1: '210', y1: '340', x2: '360', y2: '455', stroke: '#1a1a1a', 'stroke-width': '1.8', opacity: '0.85', 'marker-end': 'url(#' + axisMarkerId + ')' }));
    svg.appendChild(text(370, 470, 'x₁', 'diagram-paper-math'));
    svg.appendChild(el('line', { x1: '210', y1: '340', x2: '585', y2: '245', stroke: '#1a1a1a', 'stroke-width': '1.8', opacity: '0.85', 'marker-end': 'url(#' + axisMarkerId + ')' }));
    svg.appendChild(text(595, 240, 'x₂', 'diagram-paper-math'));
    svg.appendChild(el('line', { x1: '210', y1: '340', x2: '210', y2: '60', stroke: '#1a1a1a', 'stroke-width': '1.8', opacity: '0.85', 'marker-end': 'url(#' + axisMarkerId + ')' }));
    svg.appendChild(text(195, 50, 'p(x)', 'diagram-paper-math'));

    svg.appendChild(el('line', { x1: '380', y1: '318', x2: '295', y2: '295', stroke: '#2563eb', 'stroke-width': '1', opacity: '0.5' }));
    svg.appendChild(el('circle', { cx: '295', cy: '295', r: '3', fill: '#2563eb' }));
    svg.appendChild(text(212, 286, 'observations', 'diagram-paper-note'));
    svg.appendChild(text(218, 304, 'x_i in R^2', 'diagram-paper-note'));

    svg.appendChild(el('line', { x1: '370', y1: '330', x2: '280', y2: '220', stroke: '#7e4dc8', 'stroke-width': '1', opacity: '0.5' }));
    svg.appendChild(el('circle', { cx: '280', cy: '220', r: '3', fill: '#7e4dc8' }));
    svg.appendChild(text(160, 210, 'eigenvectors of Σ', 'diagram-paper-note diagram-paper-note--purple'));
    svg.appendChild(text(176, 228, 'principal axes', 'diagram-paper-note'));

    svg.appendChild(el('line', { x1: '460', y1: '155', x2: '600', y2: '165', stroke: '#92400e', 'stroke-width': '1', opacity: '0.6' }));
    svg.appendChild(el('circle', { cx: '600', cy: '165', r: '3', fill: '#92400e' }));
    svg.appendChild(text(610, 155, 'p(μ): max density', 'diagram-paper-note diagram-paper-note--orange'));

    // Place the equation card in an isolated top-left area to avoid overlap.
    svg.appendChild(el('rect', { x: '26', y: '22', width: '216', height: '52', rx: '4', fill: '#fafaf9', stroke: '#1a1a1a', 'stroke-width': '1', opacity: '0.96' }));
    svg.appendChild(text(62, 44, 'p(x) = N(x; μ, Σ)', 'diagram-paper-math'));
    svg.appendChild(text(82, 62, '2D Gaussian density', 'diagram-paper-small'));

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawGaussianCloudFigure(target) {
    var card = makeStaticCard('gaussian-cloud', 'Gaussian over a data cloud', 'The mean μ sits at the center of mass, the 1σ ellipse captures the main spread, and principal axes come from eigenvectors of Σ.');
    var svg = createSvg(760, 360, '0 0 760 360');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', '2D Gaussian over a data cloud with contour, mean, and principal axes.');
    var markerId = 'pp-flat-gauss-' + (++diagramUid);
    var defs = el('defs');
    var marker = el('marker', { id: markerId, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse' });
    marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#7e4dc8' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    svg.appendChild(el('rect', { x: '20', y: '20', width: '720', height: '320', rx: '2', fill: 'none', stroke: '#f1f5f9' }));
    svg.appendChild(el('ellipse', { cx: '400', cy: '180', rx: '220', ry: '120', fill: 'none', stroke: '#e8693f', 'stroke-width': '1', 'stroke-dasharray': '2 4', opacity: '0.45', transform: 'rotate(-15 400 180)' }));
    svg.appendChild(el('ellipse', { cx: '400', cy: '180', rx: '150', ry: '80', fill: '#fed7aa', 'fill-opacity': '0.18', stroke: '#e8693f', 'stroke-width': '2', 'stroke-dasharray': '8 5', transform: 'rotate(-15 400 180)' }));

    var points = [[296, 131], [341, 121], [391, 116], [436, 121], [476, 131], [271, 166], [326, 161], [376, 171], [426, 181], [471, 191], [516, 201], [301, 216], [356, 226], [406, 236], [456, 246], [496, 251], [251, 201], [561, 181]];
    points.forEach(function (point) {
      svg.appendChild(el('line', { x1: String(point[0] - 6), y1: String(point[1] - 6), x2: String(point[0] + 6), y2: String(point[1] + 6), stroke: '#2b78d6', 'stroke-width': '2', 'stroke-linecap': 'round' }));
      svg.appendChild(el('line', { x1: String(point[0] + 6), y1: String(point[1] - 6), x2: String(point[0] - 6), y2: String(point[1] + 6), stroke: '#2b78d6', 'stroke-width': '2', 'stroke-linecap': 'round' }));
    });

    svg.appendChild(el('circle', { cx: '408', cy: '185', r: '5', fill: '#2d8c50' }));
    svg.appendChild(text(420, 200, 'μ', 'diagram-paper-math'));
    svg.appendChild(el('line', { x1: '408', y1: '185', x2: '320', y2: '130', stroke: '#7e4dc8', 'stroke-width': '2.5', 'marker-end': 'url(#' + markerId + ')' }));
    svg.appendChild(el('line', { x1: '408', y1: '185', x2: '500', y2: '155', stroke: '#7e4dc8', 'stroke-width': '2.5', 'marker-end': 'url(#' + markerId + ')' }));

    svg.appendChild(text(50, 50, 'data points (x)', 'diagram-paper-note'));
    svg.appendChild(text(50, 72, '1σ contour', 'diagram-paper-note diagram-paper-note--orange'));
    svg.appendChild(text(50, 94, 'principal axes', 'diagram-paper-note diagram-paper-note--purple'));
    svg.appendChild(text(50, 116, 'μ - mean', 'diagram-paper-note diagram-paper-note--green'));

    svg.appendChild(el('rect', { x: '608', y: '38', width: '115', height: '42', rx: '4', fill: '#fafaf9', stroke: '#1a1a1a', 'stroke-width': '1' }));
    svg.appendChild(text(632, 60, 'x ~ N(μ, Σ)', 'diagram-paper-math'));
    svg.appendChild(text(646, 74, 'd = 2', 'diagram-paper-small'));

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawConvexityFigure(target) {
    var card = makeStaticCard('convexity-figure', 'Convexity: chord lies above the curve', 'For a convex function, the chord between f(x) and f(y) sits above the curve, so f((x + y)/2) ≤ (f(x) + f(y))/2.');
    var svg = createSvg(820, 380, '0 0 820 380');
    svg.setAttribute('aria-label', 'Convex function diagram with chord between two points above the curve.');
    svg.appendChild(el('line', { x1: 80, y1: 320, x2: 760, y2: 320, class: 'diagram-figure-axis-line diagram-figure-axis-line--blue' }));
    svg.appendChild(el('line', { x1: 410, y1: 48, x2: 410, y2: 335, class: 'diagram-figure-axis-line diagram-figure-axis-line--blue' }));
    svg.appendChild(el('path', { d: 'M110 88 Q410 410 710 88', class: 'diagram-figure-curve diagram-figure-draw' }));
    svg.appendChild(text(722, 88, 'f', 'diagram-paper-small diagram-paper-note diagram-paper-note--green'));
    [['x', 210, 174], ['y', 610, 174]].forEach(function (point) {
      svg.appendChild(el('line', { x1: point[1], y1: point[2], x2: point[1], y2: 320, class: 'diagram-figure-guide diagram-figure-guide--pink' }));
      svg.appendChild(el('line', { x1: point[1], y1: 314, x2: point[1], y2: 326, class: 'diagram-figure-tick diagram-figure-guide--pink' }));
      svg.appendChild(text(point[1] - 6, 350, point[0], 'diagram-paper-small diagram-paper-note diagram-paper-note--pink'));
    });
    svg.appendChild(el('line', { x1: 210, y1: 174, x2: 610, y2: 174, class: 'diagram-figure-chord' }));
    svg.appendChild(el('circle', { cx: 210, cy: 174, r: 6, class: 'diagram-figure-chord-dot' }));
    svg.appendChild(el('circle', { cx: 610, cy: 174, r: 6, class: 'diagram-figure-chord-dot' }));
    svg.appendChild(el('circle', { cx: 410, cy: 246, r: 6, class: 'diagram-figure-mid-dot' }));
    svg.appendChild(el('line', { x1: 410, y1: 246, x2: 410, y2: 320, class: 'diagram-figure-guide diagram-figure-guide--red' }));
    svg.appendChild(text(380, 350, '(x + y)/2', 'diagram-paper-small diagram-paper-note diagram-paper-note--red'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawPosteriorPredictiveFigure(target) {
    var card = makeStaticCard('posterior-grid', 'Posterior predictive shrinks with more data', 'As n grows, the posterior predictive band narrows around the true function; uncertainty decreases at the usual O(1/√n) scale.');
    var grid = document.createElement('div');
    grid.className = 'diagram-panel-grid diagram-panel-grid--2';

    function addPanel(label, band, mean, observations, tight) {
      var cell = document.createElement('div');
      cell.className = 'diagram-panel-cell';
      var title = document.createElement('div');
      title.className = 'diagram-panel-cell-label';
      title.textContent = label;
      var svg = createSvg(220, 145, '0 0 220 145');
      svg.appendChild(el('line', { x1: 24, y1: 72, x2: 204, y2: 72, class: 'diagram-mini-axis' }));
      svg.appendChild(el('line', { x1: 24, y1: 18, x2: 24, y2: 128, class: 'diagram-mini-axis' }));
      svg.appendChild(el('path', { d: band, fill: tight ? '#fcd34d' : '#fed7e2', opacity: tight ? 0.58 : 0.82 }));
      svg.appendChild(el('path', { d: 'M24 72 Q66 25 110 72 T204 72', class: 'diagram-mini-truth' }));
      svg.appendChild(el('path', { d: mean, class: 'diagram-mini-mean' }));
      observations.forEach(function (point) {
        svg.appendChild(el('circle', { cx: point[0], cy: point[1], r: 3, class: 'diagram-mini-observation' }));
      });
      cell.appendChild(title);
      cell.appendChild(svg);
      grid.appendChild(cell);
    }

    addPanel('n = 1', 'M24 22 Q70 118 112 38 T204 106 L204 120 Q156 35 112 112 T24 36 Z', 'M24 72 Q112 60 204 82', [[112, 56]]);
    addPanel('n = 2', 'M24 38 Q70 104 112 54 T204 96 L204 108 Q156 58 112 98 T24 50 Z', 'M24 72 Q70 62 112 72 T204 78', [[70, 45], [154, 88]]);
    addPanel('n = 4', 'M24 50 Q70 98 112 60 T204 90 L204 102 Q156 66 112 96 T24 62 Z', 'M24 72 Q70 35 112 72 T204 72', [[58, 38], [102, 67], [150, 92], [184, 78]]);
    addPanel('n = 25', 'M24 62 Q70 35 112 62 T204 72 L204 82 Q156 46 112 74 T24 72 Z', 'M24 72 Q70 30 112 72 T204 70', [[34, 66], [48, 55], [60, 43], [72, 34], [84, 38], [96, 50], [108, 65], [120, 78], [132, 90], [146, 96], [160, 92], [174, 82], [188, 74], [198, 70]], true);
    card.stage.appendChild(grid);
    mountDiagram(target, card.card);
  }

  function drawEmIterationsFigure(target) {
    var card = makeStaticCard('em-grid', 'EM iterations on a 2-Gaussian mixture', 'EM converges from poor circular guesses to anisotropic ellipses aligned with the two clusters; after a few iterations, the parameters are essentially fixed.');
    var grid = document.createElement('div');
    grid.className = 'diagram-panel-grid diagram-panel-grid--3';
    var panels = [['(a) init', 14, 14, 0], ['(b) L = 1', 20, 10, -22], ['(c) L = 2', 24, 9, -30], ['(d) L = 5', 28, 8, -32], ['(e) L = 20', 22, 6, -35], ['(f) converged', 25, 5, -35]];

    panels.forEach(function (panel, panelIndex) {
      var cell = document.createElement('div');
      cell.className = 'diagram-panel-cell';
      var title = document.createElement('div');
      title.className = 'diagram-panel-cell-label';
      title.textContent = panel[0];
      var svg = createSvg(180, 145, '0 0 180 145');
      svg.appendChild(el('line', { x1: 16, y1: 72, x2: 168, y2: 72, class: 'diagram-mini-axis' }));
      svg.appendChild(el('line', { x1: 90, y1: 14, x2: 90, y2: 132, class: 'diagram-mini-axis' }));
      [[62, 45, '#3b6cb8'], [122, 92, '#c4453a']].forEach(function (cluster, clusterIndex) {
        svg.appendChild(el('ellipse', { cx: cluster[0], cy: cluster[1], rx: panel[1], ry: panel[2], transform: 'rotate(' + panel[3] + ' ' + cluster[0] + ' ' + cluster[1] + ')', fill: 'none', stroke: cluster[2], 'stroke-width': panelIndex > 3 ? 1.9 : 1.6 }));
        if (panelIndex > 3) svg.appendChild(el('ellipse', { cx: cluster[0], cy: cluster[1], rx: Math.max(8, panel[1] - 9), ry: Math.max(3, panel[2] - 2), transform: 'rotate(' + panel[3] + ' ' + cluster[0] + ' ' + cluster[1] + ')', fill: 'none', stroke: cluster[2], 'stroke-width': 1.2, opacity: 0.9 }));
        for (var index = 0; index < 9; index += 1) {
          var offsetX = ((index * 17) % 27) - 13;
          var offsetY = ((index * 23) % 25) - 12;
          svg.appendChild(el('circle', { cx: cluster[0] + offsetX, cy: cluster[1] + offsetY, r: 2, fill: panelIndex === 0 ? '#2d8c50' : cluster[2] }));
        }
      });
      cell.appendChild(title);
      cell.appendChild(svg);
      grid.appendChild(cell);
    });
    card.stage.appendChild(grid);
    mountDiagram(target, card.card);
  }

  function drawGaussianProcessFigure(target) {
    var card = makeStaticCard('gp-function', 'Gaussian process as a random function', 'A draw from a GP is a continuous random function; at finite inputs X1, X2, X3 the outputs are jointly Gaussian.');
    var svg = createSvg(760, 280, '0 0 760 280');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', 'Gaussian process random function with horizontal m(Xi) labels and dashed drop lines.');
    var markerUrl = addArrowhead(svg, 'arrowhead-gp-axis', 'diagram-paper-arrowhead');

    svg.appendChild(el('path', {
      d: 'M 90 80 Q 140 0 200 30 Q 250 90 290 50 Q 330 10 370 100 Q 410 170 450 110 Q 490 60 530 130 Q 570 180 610 140 L 610 170 Q 570 220 530 170 Q 490 110 450 150 Q 410 210 370 140 Q 330 50 290 90 Q 250 130 200 70 Q 140 40 90 120 Z',
      fill: '#fde68a',
      opacity: '0.35'
    }));
    svg.appendChild(el('path', {
      d: 'M 90 100 Q 140 20 200 50 Q 250 110 290 70 Q 330 30 370 120 Q 410 190 450 130 Q 490 80 530 150 Q 570 200 610 160',
      fill: 'none',
      stroke: '#1a1a1a',
      'stroke-width': '2.5'
    }));
    svg.appendChild(el('line', { x1: 60, y1: 220, x2: 700, y2: 220, stroke: '#1a1a1a', 'stroke-width': 2, 'marker-end': markerUrl }));

    [[200, 50, 'X₁', 'm(X₁)'], [290, 70, 'X₂', 'm(X₂)'], [370, 120, 'X₃', 'm(X₃)']].forEach(function (point) {
      svg.appendChild(el('line', { x1: point[0], y1: point[1], x2: point[0], y2: 220, stroke: '#1a1a1a', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
      svg.appendChild(el('circle', { cx: point[0], cy: point[1], r: 6, fill: '#c4453a', stroke: '#ffffff', 'stroke-width': 1.5 }));
      svg.appendChild(text(point[0] - 18, point[1] - 14, point[3], 'diagram-paper-math'));
      svg.appendChild(text(point[0] - 10, 245, point[2], 'diagram-paper-math'));
    });

    svg.appendChild(text(606, 50, 'one draw m(.)', 'diagram-paper-note'));
    svg.appendChild(text(590, 68, '+ credible band', 'diagram-paper-note diagram-paper-note--orange'));
    card.stage.appendChild(svg);
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
    var card = makeStaticCard('bayes-table', 'Two estimation paradigms', 'Frequentist methods produce point estimators while Bayesian methods place distributions over the same objects.');
    var svg = createSvg(760, 360, '0 0 760 360');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', 'Frequentist and Bayesian estimation paradigms across regression, CDF, and density estimation.');

    svg.appendChild(el('rect', { x: '30', y: '20', width: '200', height: '36', rx: '18', fill: '#1a1a1a' }));
    svg.appendChild(text(62, 44, 'STATISTICAL PROBLEM', 'diagram-paper-label diagram-paper-label--white'));
    svg.appendChild(el('rect', { x: '260', y: '20', width: '230', height: '36', rx: '18', fill: '#e8f3ff', stroke: '#2b78d6', 'stroke-width': '1.5' }));
    svg.appendChild(text(330, 44, 'FREQUENTIST', 'diagram-paper-note diagram-paper-note--purple'));
    svg.appendChild(el('rect', { x: '520', y: '20', width: '230', height: '36', rx: '18', fill: '#fce4ec', stroke: '#c44488', 'stroke-width': '1.5' }));
    svg.appendChild(text(606, 44, 'BAYESIAN', 'diagram-paper-note diagram-paper-note--red'));

    [['regression', 115], ['CDF estimation', 205], ['density estimation', 295]].forEach(function (row) {
      svg.appendChild(text(54, row[1], row[0], 'diagram-paper-math diagram-paper-math--left'));
    });

    svg.appendChild(el('rect', { x: '265', y: '80', width: '220', height: '70', rx: '6', fill: '#f9fbff', stroke: '#cbd5e1' }));
    svg.appendChild(el('path', { d: 'M 280 128 Q 315 108 360 105 T 465 122', fill: 'none', stroke: '#2b78d6', 'stroke-width': '2' }));
    svg.appendChild(text(332, 145, 'kernel smoother', 'diagram-paper-small'));

    svg.appendChild(el('rect', { x: '525', y: '80', width: '220', height: '70', rx: '6', fill: '#fef5f8', stroke: '#f8c8da' }));
    svg.appendChild(el('path', { d: 'M 540 108 Q 575 88 620 86 T 725 106 L 725 130 Q 690 130 620 120 T 540 140 Z', fill: '#f4a8c4', opacity: '0.45' }));
    svg.appendChild(el('path', { d: 'M 540 128 Q 575 108 620 105 T 725 122', fill: 'none', stroke: '#c44488', 'stroke-width': '2' }));
    svg.appendChild(text(592, 145, 'Gaussian process', 'diagram-paper-small'));

    svg.appendChild(el('rect', { x: '265', y: '170', width: '220', height: '70', rx: '6', fill: '#f9fbff', stroke: '#cbd5e1' }));
    svg.appendChild(el('path', { d: 'M 280 225 L 315 225 L 315 215 L 350 215 L 350 202 L 385 202 L 385 192 L 420 192 L 420 185 L 465 185', fill: 'none', stroke: '#2b78d6', 'stroke-width': '2' }));
    svg.appendChild(text(334, 235, 'empirical CDF', 'diagram-paper-small'));

    svg.appendChild(el('rect', { x: '525', y: '170', width: '220', height: '70', rx: '6', fill: '#fef5f8', stroke: '#f8c8da' }));
    svg.appendChild(el('path', { d: 'M 540 225 L 575 223 L 575 213 L 610 211 L 610 199 L 645 197 L 645 187 L 680 184 L 725 182', fill: 'none', stroke: '#c44488', 'stroke-width': '2' }));
    svg.appendChild(text(584, 235, 'Dirichlet process', 'diagram-paper-small'));

    svg.appendChild(el('rect', { x: '265', y: '260', width: '220', height: '70', rx: '6', fill: '#f9fbff', stroke: '#cbd5e1' }));
    svg.appendChild(el('path', { d: 'M 280 315 Q 315 300 350 292 Q 390 280 430 296 Q 455 306 470 315', fill: '#cfe1f4', opacity: '0.55', stroke: '#2b78d6', 'stroke-width': '2' }));
    svg.appendChild(text(328, 322, 'kernel density est.', 'diagram-paper-small'));

    svg.appendChild(el('rect', { x: '525', y: '260', width: '220', height: '70', rx: '6', fill: '#fef5f8', stroke: '#f8c8da' }));
    svg.appendChild(el('path', { d: 'M 540 315 Q 565 310 580 290 Q 595 275 610 290 Q 625 310 640 315 Q 665 315 680 290 Q 695 275 710 290 Q 722 305 730 315', fill: '#fce4ec', opacity: '0.85', stroke: '#c44488', 'stroke-width': '2' }));
    svg.appendChild(text(610, 322, 'DP mixture', 'diagram-paper-small'));

    [70, 160, 250, 340].forEach(function (y) {
      svg.appendChild(el('line', { x1: '30', y1: String(y), x2: '750', y2: String(y), stroke: '#e5e7eb', 'stroke-width': '1' }));
    });

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawDirichletSimplexFigure(target) {
    var card = makeStaticCard('dirichlet-simplex', 'Dirichlet posterior concentration', 'As n grows, contours contract around empirical proportions and posterior spread shrinks at the expected 1/sqrt(n) rate.');
    var grid = document.createElement('div');
    grid.className = 'diagram-panel-grid diagram-panel-grid--2';

    function panel(label, sigma, innerSvg) {
      var cell = document.createElement('div');
      cell.className = 'diagram-panel-cell';
      var svg = createSvg(240, 220, '0 0 240 220');
      svg.setAttribute('class', 'plate-svg');
      svg.setAttribute('aria-label', label);
      innerSvg(svg);
      cell.appendChild(svg);
      var cap = document.createElement('div');
      cap.className = 'diagram-panel-cell-label';
      cap.textContent = label + '   sigma ~ ' + sigma;
      cell.appendChild(cap);
      grid.appendChild(cell);
    }

    function simplexBase(svg) {
      svg.appendChild(el('polygon', { points: '120,30 30,180 210,180', fill: '#ffffff', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
      svg.appendChild(text(112, 22, 'θ₁', 'diagram-paper-math'));
      svg.appendChild(text(14, 196, 'θ₂', 'diagram-paper-math'));
      svg.appendChild(text(206, 196, 'θ₃', 'diagram-paper-math'));
    }

    panel('prior - Dirichlet(1,1,1)', '0.18', function (svg) {
      simplexBase(svg);
      ['120,55 50,170 190,170', '120,75 65,160 175,160', '120,90 78,153 162,153', '120,103 88,145 152,145', '120,113 96,140 144,140'].forEach(function (points) {
        svg.appendChild(el('polygon', { points: points, fill: 'none', stroke: '#d97706', 'stroke-width': 1.2, opacity: 0.85 }));
      });
      svg.appendChild(el('polygon', { points: '120,90 78,153 162,153', fill: '#fde68a', opacity: 0.25 }));
      svg.appendChild(el('circle', { cx: 120, cy: 130, r: 5, fill: '#1a1a1a' }));
    });

    panel('posterior - n = 20', '0.18', function (svg) {
      simplexBase(svg);
      [48, 36, 26, 16, 8].forEach(function (radius) {
        svg.appendChild(el('ellipse', { cx: 92, cy: 148, rx: radius, ry: Math.max(5, Math.round(radius * 0.66)), transform: 'rotate(20 92 148)', fill: 'none', stroke: '#d97706', 'stroke-width': 1.2, opacity: 0.85 }));
      });
      svg.appendChild(el('ellipse', { cx: 92, cy: 148, rx: 36, ry: 24, transform: 'rotate(20 92 148)', fill: '#fde68a', opacity: 0.25 }));
      svg.appendChild(el('circle', { cx: 92, cy: 148, r: 5, fill: '#1a1a1a' }));
    });

    panel('posterior - n = 200', '0.06', function (svg) {
      simplexBase(svg);
      [[22, 14], [16, 10], [11, 7], [6, 4]].forEach(function (radius) {
        svg.appendChild(el('ellipse', { cx: 88, cy: 150, rx: radius[0], ry: radius[1], transform: 'rotate(20 88 150)', fill: 'none', stroke: '#d97706', 'stroke-width': 1.2, opacity: 0.9 }));
      });
      svg.appendChild(el('ellipse', { cx: 88, cy: 150, rx: 16, ry: 10, transform: 'rotate(20 88 150)', fill: '#fde68a', opacity: 0.35 }));
      svg.appendChild(el('circle', { cx: 88, cy: 150, r: 5, fill: '#1a1a1a' }));
    });

    panel('posterior - n = 2000', '0.02', function (svg) {
      simplexBase(svg);
      [[8, 5], [5, 3]].forEach(function (radius) {
        svg.appendChild(el('ellipse', { cx: 86, cy: 151, rx: radius[0], ry: radius[1], transform: 'rotate(20 86 151)', fill: 'none', stroke: '#d97706', 'stroke-width': 1.2, opacity: 0.9 }));
      });
      svg.appendChild(el('ellipse', { cx: 86, cy: 151, rx: 6, ry: 4, transform: 'rotate(20 86 151)', fill: '#fde68a', opacity: 0.5 }));
      svg.appendChild(el('circle', { cx: 86, cy: 151, r: 5, fill: '#1a1a1a' }));
      svg.appendChild(el('line', { x1: 83, y1: 148, x2: 89, y2: 154, stroke: '#c4453a', 'stroke-width': 2 }));
      svg.appendChild(el('line', { x1: 89, y1: 148, x2: 83, y2: 154, stroke: '#c4453a', 'stroke-width': 2 }));
      svg.appendChild(text(98, 143, 'true θ', 'diagram-paper-note diagram-paper-note--red'));
    });

    card.stage.appendChild(grid);
    mountDiagram(target, card.card);
  }

  function drawRlLoopFigure(target, variant) {
    if (variant === 'taxi-grid') {
      var gridCard = makeStaticCard('taxi-gridworld', 'Taxi gridworld environment', 'Four named locations (R, G, Y, B), walls, and the taxi state make a compact but structured RL benchmark.');
      var gridSvg = createSvg(720, 480, '0 0 720 480');
      gridSvg.setAttribute('class', 'plate-svg');
      gridSvg.setAttribute('aria-label', 'Taxi 5x5 gridworld with landmarks and walls.');

      for (var r = 0; r < 5; r += 1) {
        for (var c = 0; c < 5; c += 1) {
          var fill = '#ffffff';
          if ((r === 3 && c === 0) || (r === 0 && c === 0)) fill = '#dbeafe';
          if (r === 4 && c === 0) fill = '#ede9fe';
          if (r === 4 && c === 3) fill = '#e0f2fe';
          gridSvg.appendChild(el('rect', { x: 80 + c * 80, y: 50 + r * 80, width: 80, height: 80, fill: fill, stroke: '#1a1a1a', 'stroke-width': 1.2 }));
        }
      }
      gridSvg.appendChild(el('line', { x1: 240, y1: 50, x2: 240, y2: 130, stroke: '#1a1a1a', 'stroke-width': 5 }));
      gridSvg.appendChild(el('line', { x1: 240, y1: 290, x2: 240, y2: 370, stroke: '#1a1a1a', 'stroke-width': 5 }));
      gridSvg.appendChild(el('line', { x1: 320, y1: 370, x2: 320, y2: 450, stroke: '#1a1a1a', 'stroke-width': 5 }));
      [['R', 120, 90, '#3b82f6', '#ffffff'], ['G', 440, 90, '#ffffff', '#1a1a1a'], ['Y', 120, 410, '#a855f7', '#ffffff'], ['B', 360, 410, '#ffffff', '#1a1a1a'], ['T', 200, 330, '#f97316', '#ffffff']].forEach(function (node) {
        gridSvg.appendChild(el('circle', { cx: node[1], cy: node[2], r: 20, fill: node[3], stroke: '#1a1a1a', 'stroke-width': 1.5 }));
        gridSvg.appendChild(text(node[1] - 6, node[2] + 6, node[0], 'diagram-paper-label'));
      });
      gridCard.stage.appendChild(gridSvg);
      mountDiagram(target, gridCard.card);
      return;
    }

    if (variant === 'taxi-rollout') {
      var rolloutCard = makeStaticCard('taxi-rollout', 'Rollout filmstrip - 4 snapshots', 'Four moments from one episode show exploration before policy convergence.');
      var rolloutSvg = createSvg(800, 320, '0 0 800 320');
      rolloutSvg.setAttribute('class', 'plate-svg');
      rolloutSvg.setAttribute('aria-label', 'Taxi rollout snapshots at different timesteps.');
      var labels = ['dropoff', 'east', 'north', 'pickup'];
      var tSteps = ['7', '43', '93', '100'];
      for (var panel = 0; panel < 4; panel += 1) {
        var ox = 20 + panel * 200;
        rolloutSvg.appendChild(el('rect', { x: ox, y: 30, width: 180, height: 200, fill: '#fafaf9', stroke: '#1a1a1a', 'stroke-width': 1.2 }));
        rolloutSvg.appendChild(text(ox + 36, 20, 'action: ' + labels[panel], 'diagram-paper-note'));
        rolloutSvg.appendChild(el('rect', { x: ox + 60 + panel * 2, y: 50, width: 12, height: 14, fill: '#f97316', opacity: 0.75 }));
        rolloutSvg.appendChild(text(ox + 14, 135, 't=' + tSteps[panel], 'diagram-paper-small'));
      }
      rolloutSvg.appendChild(el('line', { x1: 40, y1: 265, x2: 780, y2: 265, stroke: '#1a1a1a', 'stroke-width': 2 }));
      rolloutCard.stage.appendChild(rolloutSvg);
      mountDiagram(target, rolloutCard.card);
      return;
    }

    if (variant === 'taxi-value') {
      var valueCard = makeStaticCard('taxi-value', 'Value function over taxi position', 'Darker cells indicate lower value for the selected passenger-location condition.');
      var valueSvg = createSvg(760, 360, '0 0 760 360');
      valueSvg.setAttribute('class', 'plate-svg');
      valueSvg.setAttribute('aria-label', 'Taxi value heatmap over a 5x5 grid.');
      var colors = [
        ['#fafafa', '#f4f4f5', '#e7e5e4', '#d6d3d1', '#a8a29e'],
        ['#f4f4f5', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c'],
        ['#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e'],
        ['#d6d3d1', '#a8a29e', '#78716c', '#44403c', '#1c1917'],
        ['#a8a29e', '#78716c', '#57534e', '#1c1917', '#0c0a09']
      ];
      for (var rr = 0; rr < 5; rr += 1) {
        for (var cc = 0; cc < 5; cc += 1) {
          valueSvg.appendChild(el('rect', { x: 170 + cc * 60, y: 70 + rr * 60, width: 50, height: 50, fill: colors[rr][cc] }));
        }
      }
      valueSvg.appendChild(el('rect', { x: 620, y: 70, width: 25, height: 240, fill: 'url(#valuebar)' }));
      var defs = el('defs');
      var gradient = el('linearGradient', { id: 'valuebar', x1: '0', y1: '0', x2: '0', y2: '1' });
      gradient.appendChild(el('stop', { offset: '0%', 'stop-color': '#fafafa' }));
      gradient.appendChild(el('stop', { offset: '100%', 'stop-color': '#0c0a09' }));
      defs.appendChild(gradient);
      valueSvg.appendChild(defs);
      valueCard.stage.appendChild(valueSvg);
      mountDiagram(target, valueCard.card);
      return;
    }

    var card = makeStaticCard('rl-loop', 'Agent-environment loop', 'At each time step, the agent observes state and reward, takes an action, and the environment transitions to the next state.');
    var svg = createSvg(760, 380, '0 0 760 380');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', 'Closed reinforcement learning loop with action, state, and reward arrows.');
    var defs = el('defs');
    var action = el('marker', { id: 'arr-action-loop', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '9', markerHeight: '9', orient: 'auto-start-reverse' });
    action.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#1a1a1a' }));
    var state = el('marker', { id: 'arr-state-loop', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '9', markerHeight: '9', orient: 'auto-start-reverse' });
    state.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#2b78d6' }));
    var reward = el('marker', { id: 'arr-reward-loop', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '9', markerHeight: '9', orient: 'auto-start-reverse' });
    reward.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#c4453a' }));
    defs.appendChild(action);
    defs.appendChild(state);
    defs.appendChild(reward);
    svg.appendChild(defs);

    svg.appendChild(el('rect', { x: 270, y: 50, width: 220, height: 70, rx: 10, fill: '#2d8c50', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
    svg.appendChild(text(345, 92, 'Agent', 'diagram-paper-label diagram-paper-label--white'));
    svg.appendChild(el('rect', { x: 270, y: 260, width: 220, height: 70, rx: 10, fill: '#3b6cb8', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
    svg.appendChild(text(307, 302, 'Environment', 'diagram-paper-label diagram-paper-label--white'));

    svg.appendChild(el('path', { d: 'M 490 85 Q 620 85 620 190 Q 620 295 490 295', fill: 'none', stroke: '#1a1a1a', 'stroke-width': 2.2, 'marker-end': 'url(#arr-action-loop)' }));
    svg.appendChild(el('path', { d: 'M 270 295 Q 140 295 140 190 Q 140 85 270 85', fill: 'none', stroke: '#2b78d6', 'stroke-width': 2.2, 'marker-end': 'url(#arr-state-loop)' }));
    svg.appendChild(el('path', { d: 'M 290 295 Q 200 295 200 190 Q 200 105 290 105', fill: 'none', stroke: '#c4453a', 'stroke-width': 2, 'marker-end': 'url(#arr-reward-loop)' }));

    svg.appendChild(mathText(640, 185, 'A', 't', 'diagram-paper-math'));
    svg.appendChild(text(640, 210, 'action', 'diagram-paper-note'));
    svg.appendChild(mathText(142, 180, 'S', 't', 'diagram-paper-math'));
    svg.appendChild(text(100, 180, 'state', 'diagram-paper-note diagram-paper-note--purple'));
    svg.appendChild(mathText(218, 195, 'R', 't', 'diagram-paper-math'));
    svg.appendChild(text(218, 170, 'reward', 'diagram-paper-note diagram-paper-note--red'));
    svg.appendChild(text(322, 360, 'S_{t+1}, R_{t+1} arrive next step', 'diagram-paper-small'));
    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawGraphModelFigure(target, variant, title, caption) {
    if (variant === 'sparse-estimation') {
      var sparseCard = makeStaticCard('graph-estimation', 'From binary samples to a sparse graph', 'Node-wise sparse logistic regressions are merged with an agreement rule to recover graph structure.');
      var sparseSvg = createSvg(800, 320, '0 0 800 320');
      sparseSvg.setAttribute('class', 'plate-svg');
      sparseSvg.setAttribute('aria-label', 'Pipeline from binary samples to sparse graph estimation.');
      var m1 = addArrowhead(sparseSvg, 'arrowhead-graph-estimation', 'diagram-paper-arrowhead');
      sparseSvg.appendChild(el('rect', { x: 30, y: 60, width: 180, height: 180, fill: '#fff', stroke: '#1a1a1a', 'stroke-width': 1.2 }));
      sparseSvg.appendChild(text(52, 90, 'Z1 Z2 Z3 Z4', 'diagram-paper-small'));
      sparseSvg.appendChild(el('line', { x1: 225, y1: 150, x2: 280, y2: 150, class: 'diagram-paper-arrow', 'marker-end': m1 }));
      [0, 1, 2].forEach(function (idx) {
        sparseSvg.appendChild(el('rect', { x: 290, y: 70 + idx * 55, width: 190, height: 40, rx: 4, fill: '#e8f3ff', stroke: '#2b78d6', 'stroke-width': 1.2 }));
        sparseSvg.appendChild(text(344, 96 + idx * 55, 'Z' + (idx + 1) + ' ~ Z_-'+ (idx + 1), 'diagram-paper-small'));
      });
      sparseSvg.appendChild(el('line', { x1: 498, y1: 150, x2: 555, y2: 150, class: 'diagram-paper-arrow', 'marker-end': m1 }));
      [[630, 110, 'Z1'], [710, 110, 'Z2'], [630, 190, 'Z3'], [710, 190, 'Z4']].forEach(function (node) {
        sparseSvg.appendChild(el('circle', { cx: node[0], cy: node[1], r: 22, fill: '#f3f4f6', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
        sparseSvg.appendChild(text(node[0] - 10, node[1] + 5, node[2], 'diagram-paper-small'));
      });
      sparseSvg.appendChild(el('line', { x1: 652, y1: 110, x2: 688, y2: 110, stroke: '#1a1a1a', 'stroke-width': 2 }));
      sparseSvg.appendChild(el('line', { x1: 630, y1: 132, x2: 630, y2: 168, stroke: '#1a1a1a', 'stroke-width': 2 }));
      sparseCard.stage.appendChild(sparseSvg);
      mountDiagram(target, sparseCard.card);
      return;
    }

    if (variant === 'laplacian') {
      var lapCard = makeStaticCard('graph-laplacian', 'Graph and its Laplacian, side by side', 'Diagonal entries are node degrees, off-diagonals are -1 on edges, and each row sums to zero.');
      var lapSvg = createSvg(780, 340, '0 0 780 340');
      lapSvg.setAttribute('class', 'plate-svg');
      lapSvg.setAttribute('aria-label', 'Graph with highlighted center node and corresponding Laplacian matrix.');
      [['A', 80, 80], ['B', 100, 160], ['C', 170, 160], ['D', 240, 100], ['E', 240, 220], ['F', 100, 220], ['G', 170, 270]].forEach(function (node) {
        lapSvg.appendChild(el('circle', { cx: node[1], cy: node[2], r: node[0] === 'C' ? 22 : 18, fill: node[0] === 'C' ? '#06b6d4' : '#e5e5e5', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
        lapSvg.appendChild(text(node[1] - 5, node[2] + 4, node[0], 'diagram-paper-small'));
      });
      [[170, 160, 80, 80], [170, 160, 100, 160], [170, 160, 240, 100], [170, 160, 240, 220], [170, 160, 100, 220], [170, 160, 170, 270]].forEach(function (edge) {
        lapSvg.appendChild(el('line', { x1: edge[0], y1: edge[1], x2: edge[2], y2: edge[3], stroke: '#1a1a1a', 'stroke-width': 1.5 }));
      });
      lapSvg.appendChild(el('rect', { x: 430, y: 70, width: 260, height: 220, fill: '#fff', stroke: '#1a1a1a', 'stroke-width': 1.2 }));
      lapSvg.appendChild(text(520, 56, 'L = D - A', 'diagram-paper-math'));
      lapSvg.appendChild(text(450, 108, 'row C: [-1, -1, 5, -1, -1, -1, -1]', 'diagram-paper-small'));
      lapCard.stage.appendChild(lapSvg);
      mountDiagram(target, lapCard.card);
      return;
    }

    var card = makeStaticCard('graph-model', title || 'Graphical model structure', caption || 'Nodes represent random variables and edges encode the conditional-dependence structure.');
    var svg = createSvg(820, 360, '0 0 820 360');
    svg.setAttribute('aria-label', 'Scientific graph diagram with variables connected by conditional-dependence edges.');
    var edges = [[170, 110, 320, 90], [320, 90, 470, 126], [320, 90, 330, 230], [470, 126, 610, 100], [470, 126, 565, 245], [330, 230, 565, 245], [170, 110, 260, 250]];
    edges.forEach(function (edge) {
      svg.appendChild(el('line', { x1: edge[0], y1: edge[1], x2: edge[2], y2: edge[3], class: 'diagram-paper-edge' }));
    });
    [['X₁', 170, 110, 'observed'], ['X₂', 320, 90, 'observed'], ['X₃', 470, 126, 'latent'], ['X₄', 610, 100, 'observed'], ['X₅', 330, 230, 'latent'], ['X₆', 565, 245, 'observed'], ['X₇', 260, 250, 'observed']].forEach(function (node) {
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
    var caption = 'The blue hidden-state chain carries information through time, so each output depends on the full input prefix.';
    var card = makeStaticCard('sequence-figure', title, caption);
    var svg = createSvg(720, 320, '0 0 720 320');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', 'Recurrent neural network with inputs x_t, hidden states h_t, and outputs y_t.');
    var markerUrl = addArrowhead(svg, 'arrowhead-rnn', 'diagram-paper-arrowhead');

    svg.appendChild(el('line', { x1: 60, y1: 290, x2: 660, y2: 290, stroke: '#ccc', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    svg.appendChild(text(600, 305, 'time ->', 'diagram-paper-note'));

    [[130, 240, '1'], [320, 240, '2'], [510, 240, '3']].forEach(function (node) {
      svg.appendChild(el('rect', { x: node[0], y: node[1], width: 50, height: 38, rx: 4, fill: '#ffffff', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
      svg.appendChild(mathText(node[0] + 25, node[1] + 23, 'x', node[2], 'diagram-paper-math'));
    });
    [[155, '1'], [345, '2'], [535, '3']].forEach(function (node) {
      svg.appendChild(el('circle', { cx: node[0], cy: 170, r: 26, fill: '#e8f3ff', stroke: '#2b78d6', 'stroke-width': 2 }));
      svg.appendChild(mathText(node[0], 175, 'h', node[1], 'diagram-paper-math'));
    });
    [[130, 80, '1'], [320, 80, '2'], [510, 80, '3']].forEach(function (node) {
      svg.appendChild(el('rect', { x: node[0], y: node[1], width: 50, height: 38, rx: 4, fill: '#fef3c7', stroke: '#d97706', 'stroke-width': 1.5 }));
      svg.appendChild(mathText(node[0] + 25, node[1] + 23, 'y', node[2], 'diagram-paper-math'));
    });

    [[155, 240, 155, 198], [345, 240, 345, 198], [535, 240, 535, 198], [155, 144, 155, 120], [345, 144, 345, 120], [535, 144, 535, 120]].forEach(function (line) {
      svg.appendChild(el('line', { x1: line[0], y1: line[1], x2: line[2], y2: line[3], class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
    });
    [[181, 170, 319, 170], [371, 170, 509, 170]].forEach(function (line) {
      svg.appendChild(el('line', { x1: line[0], y1: line[1], x2: line[2], y2: line[3], stroke: '#2b78d6', 'stroke-width': 2.3, 'marker-end': markerUrl }));
    });

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawSelfAttentionFigure(target) {
    var card = makeStaticCard('attention-figure', 'Self-attention sequence model', 'The highlighted token builds its context from all positions using a weighted attention row.');
    var svg = createSvg(740, 360, '0 0 740 360');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', 'Self-attention with contextual tokens and attention matrix.');
    var markerUrl = addArrowhead(svg, 'arrowhead-attention', 'diagram-paper-arrowhead');

    [[80, 280, '1'], [180, 280, '2'], [280, 280, '3'], [380, 280, '4']].forEach(function (node) {
      svg.appendChild(el('rect', { x: node[0], y: node[1], width: 60, height: 40, rx: 4, fill: '#ffffff', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
      svg.appendChild(mathText(node[0] + 30, node[1] + 25, 'x', node[2], 'diagram-paper-math'));
    });
    [[80, 30, 60, 40, '1'], [180, 30, 60, 40, '2'], [278, 28, 64, 44, '3'], [380, 30, 60, 40, '4']].forEach(function (node, index) {
      svg.appendChild(el('rect', {
        x: node[0], y: node[1], width: node[2], height: node[3], rx: 4,
        fill: index === 2 ? '#fef3c7' : '#ffffff',
        stroke: index === 2 ? '#d97706' : '#1a1a1a',
        'stroke-width': index === 2 ? 2 : 1.5
      }));
      svg.appendChild(mathText(node[0] + node[2] / 2, node[1] + 27, 'c', node[4], 'diagram-paper-math'));
    });

    [[110, 280, 305, 74, '0.25', 1.5], [210, 280, 308, 74, '0.55', 2.2], [310, 280, 310, 74, '1', 3.2], [410, 280, 315, 74, '0.7', 2.4]].forEach(function (edge) {
      svg.appendChild(el('line', {
        x1: edge[0], y1: edge[1], x2: edge[2], y2: edge[3],
        stroke: '#2b78d6', 'stroke-width': edge[5], opacity: edge[4], 'marker-end': markerUrl
      }));
    });

    svg.appendChild(text(600, 60, 'attention weights', 'diagram-paper-small'));
    for (var row = 0; row < 4; row += 1) {
      for (var col = 0; col < 4; col += 1) {
        var fills = [
          ['#e7e5e4', '#a8a29e', '#d6d3d1', '#78716c'],
          ['#a8a29e', '#e7e5e4', '#57534e', '#a8a29e'],
          ['#e7e5e4', '#a8a29e', '#1c1917', '#57534e'],
          ['#d6d3d1', '#78716c', '#a8a29e', '#1c1917']
        ];
        svg.appendChild(el('rect', {
          x: 540 + col * 32,
          y: 90 + row * 32,
          width: 30,
          height: 30,
          fill: fills[row][col],
          stroke: row === 2 ? '#d97706' : 'none',
          'stroke-width': row === 2 ? 2 : 0
        }));
      }
    }

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function drawEncoderDecoderFigure(target) {
    var card = makeStaticCard('encoder-decoder-figure', 'Encoder-decoder with bottleneck', 'The encoder compresses the source into one context vector, and the decoder unrolls outputs from that bottleneck.');
    var svg = createSvg(800, 340, '0 0 800 340');
    svg.setAttribute('class', 'plate-svg');
    svg.setAttribute('aria-label', 'Encoder-decoder with context bottleneck.');
    var markerUrl = addArrowhead(svg, 'arrowhead-encoder-decoder', 'diagram-paper-arrowhead');

    svg.appendChild(el('rect', { x: 20, y: 20, width: 350, height: 300, rx: 6, fill: '#f0f9ff', opacity: 0.4 }));
    svg.appendChild(el('rect', { x: 430, y: 20, width: 350, height: 300, rx: 6, fill: '#fef3c7', opacity: 0.35 }));

    [[50, 260, '1'], [150, 260, '2'], [250, 260, '3']].forEach(function (node) {
      svg.appendChild(el('rect', { x: node[0], y: node[1], width: 50, height: 38, rx: 4, fill: '#fff', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
      svg.appendChild(mathText(node[0] + 25, node[1] + 22, 'x', node[2], 'diagram-paper-math'));
    });
    [[75, '1'], [175, '2'], [275, '3']].forEach(function (node) {
      svg.appendChild(el('circle', { cx: node[0], cy: 185, r: 24, fill: '#e8f3ff', stroke: '#2b78d6', 'stroke-width': 2 }));
      svg.appendChild(mathText(node[0], 190, 'e', node[1], 'diagram-paper-math'));
    });
    [[75, 260, 75, 211], [175, 260, 175, 211], [275, 260, 275, 211], [99, 185, 151, 185], [199, 185, 251, 185], [299, 185, 343, 185], [457, 185, 486, 185], [534, 185, 586, 185], [634, 185, 686, 185], [510, 161, 510, 120], [610, 161, 610, 120], [710, 161, 710, 120]].forEach(function (line) {
      svg.appendChild(el('line', { x1: line[0], y1: line[1], x2: line[2], y2: line[3], class: 'diagram-paper-arrow', 'marker-end': markerUrl }));
    });

    svg.appendChild(el('rect', { x: 345, y: 160, width: 110, height: 55, rx: 6, fill: '#fef9c3', stroke: '#d97706', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }));
    svg.appendChild(text(372, 194, 'context c', 'diagram-paper-note diagram-paper-note--orange'));

    [[510, '1'], [610, '2'], [710, '3']].forEach(function (node) {
      svg.appendChild(el('circle', { cx: node[0], cy: 185, r: 24, fill: '#fef3c7', stroke: '#d97706', 'stroke-width': 2 }));
      svg.appendChild(mathText(node[0], 190, 'd', node[1], 'diagram-paper-math'));
      svg.appendChild(el('rect', { x: node[0] - 25, y: 80, width: 50, height: 38, rx: 4, fill: '#fff', stroke: '#1a1a1a', 'stroke-width': 1.5 }));
      svg.appendChild(mathText(node[0], 102, 'y', node[1], 'diagram-paper-math'));
    });

    card.stage.appendChild(svg);
    mountDiagram(target, card.card);
  }

  function addButton(card, label, onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'concept-diagram__button scifig-btn';
    button.textContent = label;
    button.addEventListener('click', onClick);
    card.appendChild(button);
    return button;
  }

  function drawBayesGraph(target, options) {
    var state = { mode: 'single' };
    var card = makeCard('bayes-graph', options.title, options.caption);
    var svg = createSvg(640, 260, '0 0 640 260');
    svg.setAttribute('class', 'plate-svg');
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

    var controls = document.createElement('div');
    controls.className = 'concept-diagram__controls scifig-controls';
    card.card.appendChild(controls);

    function applyMode(mode) {
      state.mode = mode;
      var singleVisible = mode !== 'many';
      var plateVisible = mode !== 'single';
      x.style.display = singleVisible ? '' : 'none';
      arrow.style.display = singleVisible ? '' : 'none';
      plate.style.opacity = plateVisible ? '1' : '0.15';
      copies.forEach(function (node) {
        node.style.opacity = plateVisible ? '1' : '0.15';
      });
      status.textContent = mode === 'single'
        ? 'Parameter \u03b8 generates one observation x.'
        : mode === 'many'
          ? 'The same latent parameter \u03b8 generates a sample x₁, x₂, ..., xₙ.'
          : 'Both views are visible: one sample and the full plate notation.';
    }

    ['single', 'many', 'both'].forEach(function (mode, index) {
      var label = mode === 'single' ? 'show one observation' : mode === 'many' ? 'show n observations' : 'show both';
      var button = addButton(controls, label, function () {
        Array.prototype.slice.call(controls.querySelectorAll('.scifig-btn')).forEach(function (node) {
          node.classList.remove('active');
        });
        button.classList.add('active');
        applyMode(mode);
      });
      if (index === 0) button.classList.add('active');
    });
    applyMode('single');

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
    controls.className = 'concept-diagram__controls scifig-controls';

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
      if (/gaussian-2021\.png/i.test(src)) {
        drawGaussianCloudFigure(image);
      } else if (/mixture-2021\.png/i.test(src)) {
        drawGaussianDataFigure(image);
      } else if (/convex\.JPG/i.test(src)) {
        drawConvexityFigure(image);
      } else if (/posterior\.png/i.test(src)) {
        drawPosteriorPredictiveFigure(image);
      } else if (/mixture-em-1d\.png/i.test(src)) {
        drawEmIterationsFigure(image);
      } else if (/sds-365\/gaussian\.png/i.test(src)) {
        drawGaussianProcessFigure(image);
      } else if (/map2?\.jpg/i.test(src)) {
        drawIidPlateFigure(image, /map2\.jpg/i.test(src));
      } else if (/bayes_table\.png/i.test(src)) {
        drawBayesComparisonTable(image);
      } else if (/sds-365\/dirichlet\.png/i.test(src)) {
        drawDirichletSimplexFigure(image);
      } else if (/sds-365\/rl_taxi\.png/i.test(src)) {
        drawRlLoopFigure(image, 'taxi-grid');
      } else if (/sds-365\/taxi_random\.png/i.test(src)) {
        drawRlLoopFigure(image, 'taxi-rollout');
      } else if (/sds-365\/taxi_value(_2)?\.png/i.test(src)) {
        drawRlLoopFigure(image, 'taxi-value');
      } else if (/sds-365\/rl\.png/i.test(src)) {
        drawRlLoopFigure(image);
      } else if (/mixture-mle-1d\.png/i.test(src)) {
        drawLatentPlateFigure(image);
      } else if (/graph_estimation_examples_2\.png/i.test(src)) {
        drawGraphModelFigure(image, 'sparse-estimation');
      } else if (/graph_estimation_examples_3\.png/i.test(src)) {
        drawGraphModelFigure(image, 'laplacian');
      } else if (/(^|\/)graph\.png|cond_ind_graph|discrete_gm/i.test(src)) {
        drawGraphModelFigure(image, null, /cond_ind/i.test(src) ? 'Conditional independence graph' : 'Graphical model structure');
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
