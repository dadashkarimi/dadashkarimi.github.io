/* Live public collection feed. The five static cards remain the fallback. */
(function () {
  'use strict';
  var root = 'https://raw.githubusercontent.com/dadashkarimi/dadashkarimi.github.io/main/';
  var home = 'https://javidstudio.pixieset.com/';
  var grid = document.getElementById('album-grid');
  var count = document.getElementById('album-count');
  if (!grid || !count || !window.fetch) return;
  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); }, 10000);
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function render(data) {
    if (data.version !== 1 || data.source !== home || !Array.isArray(data.collections) ||
        !data.collections.length || data.collections.length > 400) throw new Error('Invalid collection feed');
    var seen = new Set();
    var ids = new Set();
    var fragment = document.createDocumentFragment();
    data.collections.forEach(function (album, index) {
      var url = new URL(album.url);
      if (url.origin !== new URL(home).origin || url.username || url.password || url.search || url.hash ||
          !/^\/[a-zA-Z0-9_-]+\/$/.test(url.pathname) || seen.has(url.href) ||
          typeof album.title !== 'string' || !album.title.trim() || album.title.length > 180 ||
          typeof album.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(album.id) || ids.has(album.id) ||
          typeof album.cover !== 'string' || !/^images\/photography\/[a-zA-Z0-9_-]+\.webp$/.test(album.cover)) {
        throw new Error('Invalid album');
      }
      seen.add(url.href); ids.add(album.id);
      var article = element('article', 'album');
      article.id = album.id;
      var link = element('a', 'album-link');
      link.href = url.href;
      link.setAttribute('aria-label', 'View album on Pixieset: ' + album.title);
      var cover = element('div', 'album-cover');
      var wrap = element('span', 'album-image-wrap');
      var image = element('img');
      image.src = new URL(album.cover, root).href;
      image.alt = typeof album.alt === 'string' ? album.alt : album.title + ' collection cover';
      image.width = Number.isInteger(album.width) && album.width > 0 ? album.width : 960;
      image.height = Number.isInteger(album.height) && album.height > 0 ? album.height : 640;
      image.loading = index < 3 ? 'eager' : 'lazy';
      image.decoding = 'async';
      wrap.appendChild(image); cover.appendChild(wrap);
      var caption = element('div', 'album-caption');
      var number = element('span', 'album-number', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      var arrow = element('span', 'album-arrow', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      caption.append(number, element('h3', 'album-title', album.title), arrow);
      link.append(cover, caption, element('span', 'album-destination', 'View album on Pixieset'));
      article.appendChild(link); fragment.appendChild(article);
    });
    // Do not displace someone already navigating the cards with the keyboard.
    if (grid.contains(document.activeElement)) return;
    grid.replaceChildren(fragment);
    count.textContent = data.collections.length + (data.collections.length === 1 ? ' album' : ' albums');
  }
  fetch(root + 'data/pixieset-collections.json', {
    cache: 'no-cache', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal
  }).then(function (response) {
    if (!response.ok) throw new Error('Collection feed unavailable');
    return response.json();
  }).then(render).catch(function () {
    // Leave the working static cards and their direct links unchanged.
  }).finally(function () { clearTimeout(timeout); });
})();
