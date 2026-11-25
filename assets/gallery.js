/* Event Images: day filter + accessible lightbox (keyboard, swipe, deep links) */
(function () {
  var days = Array.prototype.slice.call(document.querySelectorAll('.gal-day'));
  if (!days.length) return;
  var chips = Array.prototype.slice.call(document.querySelectorAll('.gal-chip'));
  var countEl = document.querySelector('[data-gal-count]');
  var total = document.querySelectorAll('.gal-item').length;

  function visibleItems() {
    return Array.prototype.slice.call(document.querySelectorAll('.gal-day:not([hidden]) .gal-item'));
  }
  function setDay(day, scroll) {
    days.forEach(function (d) { d.hidden = day !== 'all' && d.dataset.day !== day; });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.day === day)); });
    var n = visibleItems().length;
    if (countEl) countEl.textContent = day === 'all' ? total + ' photos' : n + ' of ' + total + ' photos';
    var active = chips.filter(function (c) { return c.dataset.day === day; })[0];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (scroll) {
      var top = document.querySelector('.gal-bar').getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { setDay(c.dataset.day, true); }); });

  // ---------- Lightbox ----------
  var icon = function (d) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var lb = document.createElement('div');
  lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML =
    '<div class="lb__top"><span class="lb__count" aria-live="polite"></span><div class="lb__tools">' +
    '<button type="button" data-lb="share" aria-label="Share this photo">' + icon('<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4M12 2v14"/>') + '</button>' +
    '<a data-lb="download" download aria-label="Download this photo">' + icon('<path d="M12 3v13M6 11l6 6 6-6M4 21h16"/>') + '</a>' +
    '<button type="button" data-lb="close" aria-label="Close photo viewer">' + icon('<path d="M6 6l12 12M18 6L6 18"/>') + '</button>' +
    '</div></div>' +
    '<div class="lb__stage">' +
    '<button type="button" class="lb__nav lb__nav--prev" data-lb="prev" aria-label="Previous photo">' + icon('<path d="M15 5l-7 7 7 7"/>') + '</button>' +
    '<img class="lb__img" alt="" />' +
    '<button type="button" class="lb__nav lb__nav--next" data-lb="next" aria-label="Next photo">' + icon('<path d="M9 5l7 7-7 7"/>') + '</button>' +
    '<span class="lb__toast" role="status"></span></div>' +
    '<div class="lb__cap"></div>';
  document.body.appendChild(lb);
  var img = lb.querySelector('.lb__img'), cnt = lb.querySelector('.lb__count'), cap = lb.querySelector('.lb__cap'),
      dl = lb.querySelector('[data-lb="download"]'), toast = lb.querySelector('.lb__toast');
  var items = [], idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + items.length) % items.length;
    var a = items[idx], thumb = a.querySelector('img');
    img.classList.add('loading');
    fit();
    img.alt = thumb.alt;
    var full = new Image();
    full.onload = function () { if (items[idx] === a) { img.src = a.href; img.classList.remove('loading'); } };
    full.src = a.href;
    img.src = thumb.currentSrc || thumb.src;
    cnt.textContent = (idx + 1) + ' / ' + items.length;
    cap.innerHTML = '<strong>' + a.dataset.event + '</strong> &middot; ' + a.dataset.label;
    dl.href = a.href; dl.setAttribute('download', 'kornerstone-' + a.id + '.webp');
    history.replaceState(null, '', '#' + a.id);
    [idx + 1, idx - 1].forEach(function (n) { var p = items[(n + items.length) % items.length]; if (p) { new Image().src = p.href; } });
  }
  function fit() {
    var a = items[idx]; if (!a) return;
    var st = lb.querySelector('.lb__stage'), w = +a.dataset.w, h = +a.dataset.h;
    var pad = window.innerWidth > 700 ? 160 : 0;
    var s = Math.min((st.clientWidth - pad) / w, st.clientHeight / h);
    img.style.width = Math.round(w * s) + 'px'; img.style.height = Math.round(h * s) + 'px';
  }
  window.addEventListener('resize', function () { if (lb.classList.contains('open')) fit(); });
  function open(a) {
    items = visibleItems(); lastFocus = document.activeElement;
    lb.classList.add('open'); document.body.classList.add('lb-lock');
    show(Math.max(0, items.indexOf(a)));
    lb.querySelector('[data-lb="close"]').focus();
  }
  function close() {
    lb.classList.remove('open'); document.body.classList.remove('lb-lock');
    history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function flash(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 1800); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.gal-item');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); open(a); }
  });
  lb.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lb]');
    if (!b) { if (e.target === lb || e.target.classList.contains('lb__stage')) close(); return; }
    var act = b.dataset.lb;
    if (act === 'close') close();
    else if (act === 'prev') show(idx - 1);
    else if (act === 'next') show(idx + 1);
    else if (act === 'share') {
      var url = location.href;
      if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { flash('Link copied'); });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') {
      var f = Array.prototype.slice.call(lb.querySelectorAll('button, a[href]')).filter(function (el) { return el.offsetParent !== null; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null, sy = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(idx + (dx < 0 ? 1 : -1));
    else if (dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.4) close();
  }, { passive: true });

  // Deep link: event-images.html#d03-07 opens that photo
  var target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.classList.contains('gal-item')) open(target);
})();
