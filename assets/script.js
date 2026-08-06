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

  // Hero atmosphere — a tranquil, prophetic light layer designed to give the
  // GOD effect: slow drifting light particles (dust motes in a sunbeam), a
  // soft vertical light beam descending from above, and a gentle radial pulse
  // that breathes at ~15s intervals. Blue palette, respects prefers-reduced-motion.
  // Also applies a subtle scroll parallax to the hero photo for 3D depth.
  const heroCanvas = document.getElementById('heroFx');
  if (heroCanvas && heroCanvas.getContext) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = heroCanvas.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes = [], raf = null, t = 0;

    // Colour palette — matches Awaken brand (Heavenly Sky + Graceful Blue) with pure white for highlights.
    const BLUE   = '35,95,223';   // #235FDF
    const SKY    = '96,157,201';  // #609DC9
    const WHITE  = '255,255,255';

    function resize() {
      const r = heroCanvas.getBoundingClientRect();
      W = r.width; H = r.height;
      heroCanvas.width  = Math.floor(W * dpr);
      heroCanvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      // Light particles — slow, sparse, drifting upward like dust in a sunbeam.
      const count = reduce ? 26 : (W < 700 ? 42 : 70);
      motes = [];
      for (let i = 0; i < count; i++) motes.push(newMote(true));
    }

    function newMote(alive) {
      return {
        x: Math.random() * W,
        y: alive ? Math.random() * H : H + 10,
        s: 0.7 + Math.random() * 2.2,          // size
        vy: 0.06 + Math.random() * 0.22,       // vertical drift (very slow)
        drift: (Math.random() - 0.5) * 0.14,   // gentle horizontal sway
        tw: Math.random() * Math.PI * 2,       // twinkle phase
        tws: 0.005 + Math.random() * 0.015,    // twinkle speed (slow)
        warm: Math.random() < 0.25,            // 25% warm-white, 75% cool-white/blue
      };
    }

    function frame() {
      t += 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      // 1. Wide radial glow (breathing) — centered slightly above the middle.
      const pulse = 0.55 + 0.25 * Math.sin(t * 0.0025); // very slow breath
      const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.75);
      glow.addColorStop(0.0, 'rgba(' + SKY + ',' + (0.18 * pulse) + ')');
      glow.addColorStop(0.5, 'rgba(' + BLUE + ',' + (0.05 * pulse) + ')');
      glow.addColorStop(1.0, 'rgba(' + BLUE + ',0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // 2. Volumetric light beam descending from above (God-light).
      const beamSway = Math.sin(t * 0.001) * 24;
      const cx = W * 0.68 + beamSway; // beam centre — right of subject
      const beamW = Math.max(180, W * 0.28);
      const beam = ctx.createLinearGradient(cx, 0, cx + beamW * 0.15, H);
      beam.addColorStop(0.0, 'rgba(' + WHITE + ',0.14)');
      beam.addColorStop(0.35, 'rgba(' + SKY + ',0.08)');
      beam.addColorStop(1.0, 'rgba(' + BLUE + ',0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(cx - beamW * 0.15, 0);
      ctx.lineTo(cx + beamW * 0.15, 0);
      ctx.lineTo(cx + beamW * 0.9,  H);
      ctx.lineTo(cx - beamW * 0.9,  H);
      ctx.closePath();
      ctx.fill();

      // 3. Slow-drifting light motes (dust in a sunbeam).
      motes.forEach((m) => {
        m.y -= m.vy;
        m.x += m.drift;
        m.tw += m.tws;
        if (m.y < -10) Object.assign(m, newMote(false));
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(m.tw));
        const col = m.warm ? WHITE : SKY;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.s * 4.5);
        g.addColorStop(0.0, 'rgba(' + col + ',' + (0.85 * tw) + ')');
        g.addColorStop(1.0, 'rgba(' + col + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.s * 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
    }, { passive: true });

    if (reduce) {
      // Draw a single static composed frame (still atmospheric, but no motion).
      frame();
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    } else {
      frame();
      // Pause the animation when the tab isn't visible to save battery.
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        else if (!raf) { frame(); }
      });
    }

    // 4. Very subtle scroll parallax on the hero photo — the image shifts up
    //    at ~30% of scroll speed, giving a sense of depth without dizziness.
    const heroBg = heroCanvas.parentElement;
    const heroImg = heroBg && heroBg.querySelector('img');
    if (heroImg && !reduce) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = Math.min(400, window.scrollY);
          heroImg.style.transform = 'translate3d(0, ' + (y * 0.18) + 'px, 0) scale(1.05)';
          heroCanvas.style.transform = 'translate3d(0, ' + (y * 0.10) + 'px, 0)';
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
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
