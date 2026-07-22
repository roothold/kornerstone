/* Kornerstone Prophetic Ministry — interactions */
(function () {
  'use strict';

  // Sticky header state
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      if (header) header.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (a.closest('.has-dropdown') && a.querySelector('.chev') && window.innerWidth <= 980) return;
        links.classList.remove('open');
        toggle.classList.remove('open');
        if (header) header.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const ans = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');
      // close siblings
      const parent = item.parentElement;
      parent.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      ans.style.maxHeight = isOpen ? null : ans.scrollHeight + 'px';
    });
  });

  // Booking / contact form (demo handler — no backend)
  // Real form submissions via FormSubmit AJAX. Any form marked with
  // data-formsubmit posts to its `action` URL (FormSubmit ajax endpoint),
  // shows an inline success/error message, and resets on success. Falls back
  // to a normal POST + redirect if JS fails.
  document.querySelectorAll('form[data-formsubmit]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const btnOriginal = btn ? btn.textContent : '';
      const note = form.querySelector('.form-result') || (() => {
        const n = document.createElement('p');
        n.className = 'form-note form-result';
        n.setAttribute('role', 'status');
        n.setAttribute('aria-live', 'polite');
        form.appendChild(n);
        return n;
      })();
      note.textContent = '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!resp.ok) throw new Error('Server rejected submission');
        note.textContent = form.dataset.success || 'Thank you. Your message has been received.';
        note.style.color = 'var(--gold-soft)';
        if (btn) { btn.textContent = 'Sent ✓'; }
        form.reset();
      } catch (err) {
        note.textContent = 'Something went wrong. Please try again, or email kstone@kstonecc.org directly.';
        note.style.color = '#e74c3c';
        if (btn) { btn.disabled = false; btn.textContent = btnOriginal; }
      }
    });
  });

  // Cinematic hero background — prophetic light, sweeping beams & rising embers of faith
  const heroCanvas = document.getElementById('heroFx');
  if (heroCanvas && heroCanvas.getContext) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = heroCanvas.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let embers = [], orbs = [], beams = [], raf = null, t = 0;

    const PURPLES = ['139,92,246', '99,102,241', '177,92,247'];
    const GOLD = '216,181,107';

    function resize() {
      const r = heroCanvas.getBoundingClientRect();
      W = r.width; H = r.height;
      heroCanvas.width = Math.floor(W * dpr);
      heroCanvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      // Slow drifting glow orbs (depth + atmosphere)
      orbs = [
        { x: W * 0.78, y: H * 0.22, r: Math.max(W, H) * 0.55, c: PURPLES[0], a: 0.22, vx: 0.05, vy: 0.02 },
        { x: W * 0.12, y: H * 0.80, r: Math.max(W, H) * 0.50, c: PURPLES[1], a: 0.18, vx: -0.04, vy: -0.03 },
        { x: W * 0.50, y: H * 1.05, r: Math.max(W, H) * 0.40, c: GOLD, a: 0.08, vx: 0.02, vy: 0 }
      ];
      // Light beams of "direction" descending from above
      beams = [];
      const n = W < 700 ? 3 : 5;
      for (let i = 0; i < n; i++) {
        beams.push({
          x: W * (0.12 + 0.18 * i) + (Math.random() * 60 - 30),
          w: 60 + Math.random() * 90,
          sway: 0.4 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          a: 0.05 + Math.random() * 0.06,
          c: PURPLES[i % PURPLES.length]
        });
      }
      // Rising embers (faith ascending)
      const count = reduce ? 26 : (W < 700 ? 40 : 70);
      embers = [];
      for (let i = 0; i < count; i++) embers.push(newEmber(true));
    }

    function newEmber(seed) {
      return {
        x: Math.random() * W,
        y: seed ? Math.random() * H : H + 10,
        s: 0.6 + Math.random() * 2.0,
        vy: 0.18 + Math.random() * 0.55,
        drift: (Math.random() - 0.5) * 0.25,
        tw: Math.random() * Math.PI * 2,
        tws: 0.01 + Math.random() * 0.03,
        gold: Math.random() < 0.32
      };
    }

    function frame() {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      // glow orbs
      ctx.globalCompositeOperation = 'lighter';
      orbs.forEach((o) => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, 'rgba(' + o.c + ',' + o.a + ')');
        g.addColorStop(1, 'rgba(' + o.c + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // descending beams of light
      beams.forEach((b) => {
        const off = Math.sin(t * 0.004 * b.sway + b.phase) * 40;
        const x = b.x + off;
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.01 + b.phase);
        const g = ctx.createLinearGradient(x, 0, x + b.w * 0.4, H);
        g.addColorStop(0, 'rgba(' + b.c + ',' + (b.a * pulse) + ')');
        g.addColorStop(0.6, 'rgba(' + b.c + ',' + (b.a * pulse * 0.25) + ')');
        g.addColorStop(1, 'rgba(' + b.c + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + b.w, 0);
        ctx.lineTo(x + b.w * 1.7 + 60, H); ctx.lineTo(x + b.w * 0.7 - 60, H);
        ctx.closePath(); ctx.fill();
      });

      // rising embers
      embers.forEach((p) => {
        p.y -= p.vy; p.x += p.drift; p.tw += p.tws;
        if (p.y < -10) Object.assign(p, newEmber(false));
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(p.tw));
        const col = p.gold ? GOLD : PURPLES[0];
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 4);
        g.addColorStop(0, 'rgba(' + col + ',' + (0.9 * tw) + ')');
        g.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2); ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); }, { passive: true });
    if (reduce) {
      frame(); cancelAnimationFrame(raf); raf = null; // draw a single static frame
    } else {
      frame();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        else if (!raf) { frame(); }
      });
    }
  }

  // Scripture word-by-word reveal — split blockquotes into staggered words
  document.querySelectorAll('.scripture blockquote').forEach((bq) => {
    const words = bq.textContent.trim().split(/\s+/);
    bq.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w + ' ';
      span.style.transitionDelay = (i * 0.05).toFixed(2) + 's';
      bq.appendChild(span);
    });
  });

  // Footer year
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Timezone-aware meeting times.
  // Any element carrying data-tz-start="HH:MM" and data-tz-zone="IANA" will be rewritten
  // on page load to the visitor's local time with the local timezone abbreviation.
  // Optional data-tz-end="HH:MM" formats a range. Optional data-tz-days preserves
  // day-shift detection (rare — e.g. Fri 12:00 AM WAT = Thu PM in Americas).
  (function convertAllTimes() {
    if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) return;

    function getTzOffsetMinutes(tz, date) {
      try {
        const dtf = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hourCycle: 'h23',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        const parts = {};
        dtf.formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
        const tzWallMs = Date.UTC(
          +parts.year, +parts.month - 1, +parts.day,
          +parts.hour, +parts.minute, +parts.second
        );
        return (tzWallMs - date.getTime()) / 60000;
      } catch (e) { return 0; }
    }

    // Convert HH:MM in sourceTz -> Date object (UTC epoch representing that wall time today)
    function toUtcDate(hhmm, sourceTz) {
      const parts = hhmm.split(':').map(Number);
      const h = parts[0], m = parts[1] || 0;
      if (isNaN(h) || isNaN(m)) return null;
      const now = new Date();
      // Naive UTC assuming the source wall time IS UTC
      const naive = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0
      ));
      const offset = getTzOffsetMinutes(sourceTz, naive);
      return new Date(naive.getTime() - offset * 60000);
    }

    function formatLocal(d, includeTz) {
      const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
      if (includeTz) opts.timeZoneName = 'short';
      return new Intl.DateTimeFormat(undefined, opts).format(d);
    }

    document.querySelectorAll('[data-tz-start]').forEach((el) => {
      const start = el.getAttribute('data-tz-start');
      const end = el.getAttribute('data-tz-end');
      const zone = el.getAttribute('data-tz-zone') || 'Africa/Lagos';
      const startDate = toUtcDate(start, zone);
      if (!startDate) return;
      let text;
      if (end) {
        const endDate = toUtcDate(end, zone);
        if (endDate && endDate < startDate) {
          // overnight range: end is next day
          endDate.setDate(endDate.getDate() + 1);
        }
        text = formatLocal(startDate, false) + '–' + formatLocal(endDate, true);
      } else {
        text = formatLocal(startDate, true);
      }
      // Some formatters emit "AM" / "PM" with narrow no-break space; normalize
      text = text.replace(/ /g, ' ');
      el.textContent = text;
    });
  })();

  // Event countdown — any [data-event-target] section with a target ISO datetime
  // ticks every second showing Days/Hours/Minutes/Seconds until start. After the
  // event has ended (start + data-event-end-offset-hours, default 3), the whole
  // section hides itself so the homepage stays clean without manual removal.
  (function initEventCountdown() {
    document.querySelectorAll('[data-event-target]').forEach((section) => {
      const targetAttr = section.getAttribute('data-event-target');
      const target = new Date(targetAttr).getTime();
      if (isNaN(target)) return;
      const endOffsetHrs = parseFloat(section.getAttribute('data-event-end-offset-hours') || '3');
      const endTime = target + endOffsetHrs * 3600000;
      const parts = {
        days: section.querySelector('[data-ec="days"]'),
        hours: section.querySelector('[data-ec="hours"]'),
        minutes: section.querySelector('[data-ec="minutes"]'),
        seconds: section.querySelector('[data-ec="seconds"]'),
      };
      const countdownEl = section.querySelector('.ec-countdown');
      let timer = null;
      function pad(n) { return String(n).padStart(2, '0'); }
      function tick() {
        const now = Date.now();
        if (now >= endTime) {
          section.setAttribute('hidden', '');
          if (timer) { clearInterval(timer); timer = null; }
          return;
        }
        const diff = target - now;
        if (diff <= 0) {
          if (countdownEl && !countdownEl.querySelector('.ec-live')) {
            countdownEl.innerHTML = '<span class="ec-live">Happening now</span>';
          }
          return;
        }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff / 3600000) % 24);
        const mins = Math.floor((diff / 60000) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        if (parts.days) parts.days.textContent = String(days);
        if (parts.hours) parts.hours.textContent = pad(hours);
        if (parts.minutes) parts.minutes.textContent = pad(mins);
        if (parts.seconds) parts.seconds.textContent = pad(secs);
      }
      tick();
      timer = setInterval(tick, 1000);
    });
  })();

  // "This Week at Kornerstone" — auto-update dates + today marker from local calendar
  // Week runs Monday → Sunday (ISO). JS getDay(): 0=Sun...6=Sat, so we shift Sunday to 7.
  // The "· Today" suffix is CSS pseudo-content (see styles.css), so this JS only
  // has to toggle .today; it does NOT touch time text (that's owned by the
  // timezone converter above).
  (function updateThisWeek() {
    const cards = document.querySelectorAll('.weekgrid .daycard[data-day]');
    if (!cards.length) return;
    const now = new Date();
    const isoDay = (d) => (d === 0 ? 7 : d);
    const todayIso = isoDay(now.getDay());
    cards.forEach((card) => {
      const cardDow = parseInt(card.dataset.day, 10);
      if (isNaN(cardDow)) return;
      const cardIso = isoDay(cardDow);
      const cardDate = new Date(now);
      cardDate.setDate(now.getDate() + (cardIso - todayIso));
      const numEl = card.querySelector('.dnum');
      if (numEl) numEl.textContent = cardDate.getDate();
      card.classList.toggle('today', cardIso === todayIso);
    });
  })();
})();
