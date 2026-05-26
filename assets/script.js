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
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (a.closest('.has-dropdown') && a.querySelector('.chev') && window.innerWidth <= 980) return;
        links.classList.remove('open');
        toggle.classList.remove('open');
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
  document.querySelectorAll('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const note = form.querySelector('.form-result') || (() => {
        const n = document.createElement('p');
        n.className = 'form-note form-result';
        form.appendChild(n);
        return n;
      })();
      if (btn) { btn.textContent = 'Request received ✓'; btn.disabled = true; }
      note.textContent = 'Thank you. Your request has been noted. Our team will reach out shortly. (This is a demo form — connect it to your email or scheduling tool before going live.)';
      note.style.color = 'var(--gold-soft)';
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
})();
