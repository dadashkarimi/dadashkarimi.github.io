/* Native disclosure works without JavaScript; image links also have a direct-file fallback. */
(function () {
  'use strict';
  var details = document.getElementById('pigment-bitts-2026');
  if (!details) return;
  function revealLinkedTalk() {
    if (window.location.hash === '#pigment-bitts-2026') details.open = true;
  }
  revealLinkedTalk();
  window.addEventListener('hashchange', revealLinkedTalk);
  var modal = document.getElementById('talk-photo-lightbox');
  if (!modal || typeof modal.showModal !== 'function') return;
  var links = Array.prototype.slice.call(details.querySelectorAll('[data-talk-photo]'));
  var image = document.getElementById('talk-lightbox-image');
  var caption = document.getElementById('talk-lightbox-caption');
  var counter = document.getElementById('talk-photo-counter');
  var original = document.getElementById('talk-lightbox-original');
  var active = 0;
  var returnFocus = null;
  function showPhoto(index) {
    active = (index + links.length) % links.length;
    var link = links[active];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    caption.textContent = link.getAttribute('data-caption');
    counter.textContent = (active + 1) + ' / ' + links.length;
    original.href = link.href;
  }
  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      returnFocus = link;
      showPhoto(index);
      if (!modal.open) modal.showModal();
      document.body.classList.add('talk-photo-modal-open');
    });
  });
  modal.querySelector('.talk-lightbox-close').addEventListener('click', function () { modal.close(); });
  modal.querySelector('.talk-lightbox-prev').addEventListener('click', function () { showPhoto(active - 1); });
  modal.querySelector('.talk-lightbox-next').addEventListener('click', function () { showPhoto(active + 1); });
  modal.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(active + 1); }
  });
  modal.addEventListener('click', function (event) {
    if (event.target !== modal) return;
    var box = modal.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
  });
  modal.addEventListener('close', function () {
    document.body.classList.remove('talk-photo-modal-open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll: true});
  });
})();
