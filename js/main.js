(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------- Footer year ------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------- Header scroll state ------------------------ */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------- Mobile menu -------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const navMobile = document.getElementById('nav-mobile');
  if (menuToggle && navMobile) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
      navMobile.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fechar menu');
      navMobile.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    navMobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ------------------------------- Scrollspy ----------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-desktop a'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((sec) => spy.observe(sec));
  }

  /* ------------------------------- Reveal on scroll ----------------------------- */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------- Hero network animation ----------------------- */
  const canvas = document.getElementById('hero-network');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    let raf = null;

    const LABELS = ['Estratégia', 'Comunicação', 'Posicionamento', 'Conteúdo', 'Tráfego', 'Conexão', 'Percepção'];
    const COLORS = ['249, 73, 1', '122, 74, 38'];

    function resize() {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      const count = width < 640 ? 16 : width < 1080 ? 24 : 32;
      nodes = new Array(count).fill(0).map((_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1.2,
        label: i < LABELS.length && width >= 760 ? LABELS[i] : null,
        color: COLORS[i % 2],
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = Math.min(width, height) * 0.22;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.35;
            ctx.strokeStyle = `rgba(${a.color}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${n.color}, 0.9)`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        if (n.label) {
          ctx.font = '500 12px Inter, sans-serif';
          ctx.fillStyle = `rgba(245, 244, 242, 0.4)`;
          ctx.fillText(n.label, n.x + 8, n.y - 8);
        }
      });

      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      step();
      cancelAnimationFrame(raf);
    } else {
      step();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          raf = requestAnimationFrame(step);
        }
      });
    }
  }

  /* ------------------------------- Reels carousel (portfólio em vídeo) ----------- */
  const reelsTrack = document.getElementById('reelsTrack');
  if (reelsTrack) {
    const cards = Array.from(reelsTrack.querySelectorAll('.reel-card:not(.reel-card--ghost)'));
    const hoverCapable = window.matchMedia('(hover: hover)').matches;

    let hovering = false;
    let dragging = false;
    let touching = false;
    let lastInteraction = 0;
    let direction = 1;
    let raf = null;

    function anyPlaying() {
      return cards.some((card) => !card.querySelector('video').paused);
    }

    cards.forEach((card) => {
      const video = card.querySelector('video');
      const playBtn = card.querySelector('.reel-card__play');

      playBtn.addEventListener('click', () => {
        if (video.paused) {
          cards.forEach((other) => {
            if (other !== card) {
              const otherVideo = other.querySelector('video');
              if (!otherVideo.paused) otherVideo.pause();
            }
          });
          video.muted = false;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', () => card.classList.add('is-playing'));
      video.addEventListener('pause', () => card.classList.remove('is-playing'));
      video.addEventListener('ended', () => card.classList.remove('is-playing'));
    });

    if (hoverCapable) {
      reelsTrack.addEventListener('pointerenter', () => { hovering = true; });
      reelsTrack.addEventListener('pointerleave', () => { hovering = false; });
    }

    reelsTrack.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      reelsTrack.classList.add('is-dragging');
      const startX = e.clientX;
      const startScroll = reelsTrack.scrollLeft;

      const onMove = (ev) => {
        reelsTrack.scrollLeft = startScroll - (ev.clientX - startX);
      };
      const onUp = () => {
        dragging = false;
        lastInteraction = Date.now();
        reelsTrack.classList.remove('is-dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });

    reelsTrack.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    reelsTrack.addEventListener('touchend', () => { touching = false; lastInteraction = Date.now(); }, { passive: true });
    reelsTrack.addEventListener('wheel', () => { lastInteraction = Date.now(); }, { passive: true });

    function reelsStep() {
      const paused = hovering || dragging || touching || anyPlaying() || reduceMotion || (Date.now() - lastInteraction < 900);
      if (!paused) {
        const maxScroll = reelsTrack.scrollWidth - reelsTrack.clientWidth;
        if (maxScroll > 0) {
          reelsTrack.scrollLeft += 0.5 * direction;
          if (reelsTrack.scrollLeft >= maxScroll - 1) direction = -1;
          if (reelsTrack.scrollLeft <= 1) direction = 1;
        }
      }
      raf = requestAnimationFrame(reelsStep);
    }

    if (!reduceMotion) {
      raf = requestAnimationFrame(reelsStep);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          raf = requestAnimationFrame(reelsStep);
        }
      });
    }
  }
})();
