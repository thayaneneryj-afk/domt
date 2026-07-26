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
  const revealEls = Array.from(document.querySelectorAll('.reveal, .line-reveal'));
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

  /* ------------------------------- Contadores animados (provas de resultado) ---- */
  const counterEls = Array.from(document.querySelectorAll('[data-count-to]'));
  if (counterEls.length) {
    const formatCounter = (el, value) => {
      const decimals = Number(el.dataset.decimals || 0);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      el.textContent = `${prefix}${formatted}${suffix}`;
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counterEls.forEach((el) => formatCounter(el, Number(el.dataset.countTo)));
    } else {
      const animateCounter = (el) => {
        const target = Number(el.dataset.countTo);
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          formatCounter(el, target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counterEls.forEach((el) => counterObserver.observe(el));
    }
  }

  /* ------------------------------- Parallax sutil (seção crença) ---------------- */
  const crencaHero = document.querySelector('.crenca-banner');
  const crencaImg = document.getElementById('crencaHeroImg');
  if (crencaHero && crencaImg && !reduceMotion) {
    let crencaTicking = false;
    const updateCrencaParallax = () => {
      const rect = crencaHero.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const center = rect.top + rect.height / 2 - vh / 2;
      const range = vh / 2 + rect.height / 2;
      const progress = Math.max(-1, Math.min(1, center / range));
      crencaImg.style.transform = `translateY(${(progress * -22).toFixed(2)}px)`;
      crencaTicking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!crencaTicking) {
          crencaTicking = true;
          requestAnimationFrame(updateCrencaParallax);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', updateCrencaParallax);
    updateCrencaParallax();
  }

  /* ------------------------------- Ecossistema de serviços (rede interativa) ----- */
  const serviceNetwork = document.getElementById('serviceNetwork');
  if (serviceNetwork) {
    const serviceNodes = Array.from(serviceNetwork.querySelectorAll('.service-node[data-service]'));
    const serviceLines = Array.from(serviceNetwork.querySelectorAll('[data-line]'));
    const panelWrap = document.getElementById('servicePanelWrap');
    const panels = panelWrap ? Array.from(panelWrap.querySelectorAll('.service-panel[data-panel]')) : [];
    const hint = document.getElementById('serviceNetworkHint');
    const hoverCapable = window.matchMedia('(hover: hover)').matches;
    let locked = null;

    function setVisual(key) {
      serviceNodes.forEach((n) => n.classList.toggle('is-active', n.dataset.service === key));
      serviceLines.forEach((l) => l.classList.toggle('is-active', l.dataset.line === key));
      serviceNetwork.classList.toggle('has-active', !!key);
    }

    function openPanel(key) {
      panels.forEach((p) => {
        const match = p.dataset.panel === key;
        if (match) p.hidden = false;
      });
      // força reflow antes de adicionar a classe, garantindo a transição de entrada
      void panelWrap.offsetWidth;
      panels.forEach((p) => p.classList.toggle('is-visible', p.dataset.panel === key));
      serviceNodes.forEach((n) => n.setAttribute('aria-expanded', String(n.dataset.service === key)));
      if (hint) hint.style.display = 'none';
      panels.forEach((p) => {
        if (p.dataset.panel !== key) {
          window.setTimeout(() => {
            if (!p.classList.contains('is-visible')) p.hidden = true;
          }, 600);
        }
      });
    }

    serviceNodes.forEach((node) => {
      const key = node.dataset.service;

      if (hoverCapable) {
        node.addEventListener('mouseenter', () => setVisual(key));
        node.addEventListener('mouseleave', () => setVisual(locked));
        node.addEventListener('focus', () => setVisual(key));
        node.addEventListener('blur', () => setVisual(locked));
      }
      node.addEventListener('click', () => {
        locked = key;
        setVisual(key);
        openPanel(key);
      });
    });
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

  /* ------------------------------- Typewriter (faixa de autoridade) ------------- */
  const typewriterEl = document.getElementById('typewriterText');
  if (typewriterEl) {
    const phrases = [
      '+9 anos de experiência',
      '+50 marcas atendidas',
      '+1.000 projetos desenvolvidos',
      'Clientes no Brasil e Estados Unidos',
    ];

    if (reduceMotion) {
      typewriterEl.textContent = phrases.join('   •   ');
    } else {
      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const typewriterTick = () => {
        const current = phrases[phraseIndex];
        let delay;

        if (!deleting) {
          charIndex++;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            delay = 1900;
          } else {
            delay = 45 + Math.random() * 35;
          }
        } else {
          charIndex--;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 450;
          } else {
            delay = 22 + Math.random() * 18;
          }
        }

        setTimeout(typewriterTick, delay);
      };

      setTimeout(typewriterTick, 400);
    }
  }

  /* ------------------------------- Reels carousel (portfólio em vídeo) ----------- */
  const reelsTrack = document.getElementById('reelsTrack');
  if (reelsTrack) {
    const firstGroup = reelsTrack.querySelector('.reels-group');
    const cards = Array.from(reelsTrack.querySelectorAll('.reels-group:not([aria-hidden]) .reel-card'));

    let dragging = false;
    let dragMoved = false;
    let touching = false;
    let lastInteraction = 0;
    let wrapping = false;
    let raf = null;

    function wrapScroll() {
      if (wrapping) return;
      const groupWidth = firstGroup.getBoundingClientRect().width;
      if (groupWidth <= 0) return;
      if (reelsTrack.scrollLeft >= groupWidth) {
        wrapping = true;
        reelsTrack.scrollLeft -= groupWidth;
        wrapping = false;
      } else if (reelsTrack.scrollLeft < 0) {
        wrapping = true;
        reelsTrack.scrollLeft += groupWidth;
        wrapping = false;
      }
    }
    reelsTrack.addEventListener('scroll', wrapScroll, { passive: true });

    function anyEngaged() {
      return cards.some((card) => card.classList.contains('is-playing'));
    }

    function disengage(card) {
      const video = card.querySelector('video');
      const playBtn = card.querySelector('.reel-card__play');
      video.muted = true;
      video.currentTime = 0;
      video.play().catch(() => {});
      card.classList.remove('is-playing');
      playBtn.setAttribute('aria-label', 'Reproduzir vídeo de portfólio da DOMT');
    }

    cards.forEach((card) => {
      const video = card.querySelector('video');
      const playBtn = card.querySelector('.reel-card__play');

      card.addEventListener('click', () => {
        if (dragMoved) return;
        const engaged = card.classList.contains('is-playing');
        if (!engaged) {
          cards.forEach((other) => {
            if (other !== card && other.classList.contains('is-playing')) disengage(other);
          });
          video.currentTime = 0;
          video.muted = false;
          video.play().catch(() => {});
          card.classList.add('is-playing');
          playBtn.setAttribute('aria-label', 'Pausar vídeo de portfólio da DOMT');
          lastInteraction = Date.now();
        } else {
          disengage(card);
          lastInteraction = Date.now();
        }
      });
    });

    /* Reprodução ambiente: todo vídeo visível toca mudo e em loop,
       dando movimento ao carrossel assim que a página carrega. O clique
       assume o controle (áudio, reinício) e some da lista ambiente. */
    if ('IntersectionObserver' in window && !reduceMotion) {
      const allCards = Array.from(reelsTrack.querySelectorAll('.reel-card'));
      const ambientObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const card = entry.target;
            if (card.classList.contains('is-playing')) return;
            const video = card.querySelector('video');
            if (!video) return;
            if (entry.isIntersecting) {
              video.muted = true;
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.3 }
      );
      allCards.forEach((card) => ambientObserver.observe(card));
    }

    reelsTrack.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      dragMoved = false;
      reelsTrack.classList.add('is-dragging');
      const startX = e.clientX;
      const startScroll = reelsTrack.scrollLeft;

      const onMove = (ev) => {
        if (Math.abs(ev.clientX - startX) > 5) dragMoved = true;
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

    let touchStartX = 0;
    let touchStartY = 0;
    let touchHorizontal = false;
    reelsTrack.addEventListener(
      'touchstart',
      (e) => {
        touching = true;
        touchHorizontal = false;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
      },
      { passive: true }
    );
    reelsTrack.addEventListener(
      'touchmove',
      (e) => {
        const t = e.touches[0];
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);
        if (dx > dy && dx > 6) touchHorizontal = true;
      },
      { passive: true }
    );
    const endTouch = () => {
      touching = false;
      // só conta como interação com o carrossel (pausando o auto-scroll) se o
      // gesto foi de fato horizontal — um scroll vertical da página que só
      // passa por cima do carrossel não deve travar o movimento automático.
      if (touchHorizontal) lastInteraction = Date.now();
      touchHorizontal = false;
    };
    reelsTrack.addEventListener('touchend', endTouch, { passive: true });
    reelsTrack.addEventListener('touchcancel', endTouch, { passive: true });
    reelsTrack.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) lastInteraction = Date.now();
    }, { passive: true });

    function reelsStep() {
      const paused = dragging || touching || anyEngaged() || reduceMotion || (Date.now() - lastInteraction < 900);
      if (!paused) {
        reelsTrack.scrollLeft += 0.5;
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
