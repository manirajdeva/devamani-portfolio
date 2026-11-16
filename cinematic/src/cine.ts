import './cine.css';
import { gsap, ScrollTrigger, initSmoothScroll, getLenis, scrollToId } from './lib/motion';
import { sceneState } from './state/scene';
import { CAPSULES } from './engine/capsuleData';
import { hasWebGL, prefersReducedMotion } from './engine/quality';

/**
 * Cinematic layer for the whole portfolio: a fixed WebGL particle scene behind every page,
 * Lenis smooth scrolling, GSAP scroll choreography, word-by-word reveals and a line-sweep page curtain.
 * Home (body[data-cine="home"]) gets the full scroll story (tree -> cloud -> cube -> waves);
 * every other page gets the cube breaking into calm energy waves, dimmed behind the content.
 */
const reduced = prefersReducedMotion();
const isHome = document.body.dataset.cine === 'home';
const lite = /gallery/i.test(location.pathname);
const root = document.documentElement;
root.classList.add('cine-on');
if (isHome) root.classList.add('cine-home');

/* ---------------------------------------------------------------- DOM layer (lives on <html>, outside <body>) */
const layer = document.createElement('div');
layer.id = 'cine-bg';
layer.setAttribute('aria-hidden', 'true');
const scrim = document.createElement('div');
scrim.className = 'cine-scrim';
const vignette = document.createElement('div');
vignette.className = 'cine-vignette';
const curtain = document.createElement('div');
curtain.id = 'cine-curtain';
curtain.innerHTML = '<span class="cc-line"></span><span class="cc-label">T / DEVAMANI</span>';
root.append(layer, curtain);

let webgl = hasWebGL();
const canvas = document.createElement('canvas');
const capsuleEls: HTMLSpanElement[] = [];
let brandEl: HTMLDivElement | null = null;

if (webgl) {
  layer.append(canvas);
  if (isHome) {
    const labels = document.createElement('div');
    labels.className = 'cine-labels';
    CAPSULES.forEach((c) => {
      const s = document.createElement('span');
      s.className = 'capsule-label';
      s.textContent = c.label;
      capsuleEls.push(s);
      labels.append(s);
    });
    brandEl = document.createElement('div');
    brandEl.className = 'cine-brand';
    brandEl.innerHTML = '<div class="cb-name">T Devamani</div><div class="cb-sub">data · software · mountains</div>';
    labels.append(brandEl);
    layer.append(labels);
  }
} else {
  const fb = document.createElement('div');
  fb.className = 'cine-fallback';
  layer.append(fb);
}
layer.append(scrim, vignette);

/* ---------------------------------------------------------------- scene */
if (webgl) {
  import('./engine/Experience')
    .then(({ Experience }) => {
      try {
        const exp = new Experience(canvas, {
          reducedMotion: reduced,
          lite,
          onFailure: () => {
            canvas.remove();
            layer.prepend(Object.assign(document.createElement('div'), { className: 'cine-fallback' }));
          },
          onCapsuleClick: () => isHome && scrollToId('toolbox'),
        });
        exp.setLabels({ capsules: capsuleEls, brand: brandEl });
        exp.start();
      } catch (err) {
        console.warn('[cine] WebGL unavailable, using fallback.', err);
        canvas.remove();
        layer.prepend(Object.assign(document.createElement('div'), { className: 'cine-fallback' }));
        webgl = false;
      }
    })
    .catch(() => {});
}

/* ---------------------------------------------------------------- helpers */
/** Wrap every word of [data-split] elements so it can slide up from behind a mask. */
function splitWords(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((n) => {
    const parts = (n.textContent || '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((p) => {
      if (!p) return;
      if (/^\s+$/.test(p)) {
        frag.append(document.createTextNode(' '));
        return;
      }
      const mask = document.createElement('span');
      mask.className = 'sw';
      const inner = document.createElement('span');
      inner.className = 'sw-i';
      inner.textContent = p;
      mask.append(inner);
      frag.append(mask);
    });
    n.replaceWith(frag);
  });
}
document.querySelectorAll<HTMLElement>('[data-split]').forEach(splitWords);

/** Cursor-following glow + soft 3D tilt on glass cards. */
function spotlight(sel: string, tilt = 5) {
  document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    let f = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(f);
      f = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        if (e.pointerType === 'mouse' && !reduced)
          el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * tilt}deg) rotateY(${(x - 0.5) * tilt}deg) translateY(-4px)`;
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(f);
      el.style.transform = '';
    });
  });
}
spotlight('.cglass.spot');

/* ---------------------------------------------------------------- motion */
initSmoothScroll(reduced);

// modals / panels lock the page with body.no-scroll: pause Lenis so the page doesn't drift behind them
new MutationObserver(() => {
  const l = getLenis();
  if (!l) return;
  if (document.body.classList.contains('no-scroll')) l.stop();
  else l.start();
}).observe(document.body, { attributes: true, attributeFilter: ['class'] });

gsap.context(() => {
  /* scene intro */
  if (reduced) {
    sceneState.reveal = 1;
    sceneState.intro = 1;
  } else {
    gsap.to(sceneState, { reveal: 1, duration: 1.8, ease: 'power2.out' });
    gsap.to(sceneState, { intro: 1, duration: isHome ? 3.8 : 3.2, delay: isHome ? 0.4 : 0.2, ease: 'power3.inOut' });
  }

  if (isHome) {
    /* ---- scroll-scrubbed morph: tree -> cloud -> cube -> waves. Segment lengths mirror the real section heights. */
    const h = (id: string) => document.getElementById(id)?.offsetHeight ?? window.innerHeight;
    const vp = window.innerHeight;
    const seg = { hero: h('hero'), dissolve: h('dissolve'), hold: Math.max(1, h('about') - vp), waves: h('wave-gate') };
    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '#hero', start: 'top top', endTrigger: '#wave-gate', end: 'bottom bottom', scrub: reduced ? true : 1.1, invalidateOnRefresh: true },
      })
      .to(sceneState, { scrollMorph: 2, duration: seg.hero })
      .to(sceneState, { scrollMorph: 3, duration: seg.dissolve })
      .to({}, { duration: seg.hold })
      .to(sceneState, { scrollMorph: 4, duration: seg.waves });

    // dim the waves while reading the content sections, and darken the scrim behind them
    gsap.fromTo(sceneState, { ambient: 1 }, { ambient: 0.45, ease: 'none', scrollTrigger: { trigger: '#main', start: 'top 70%', end: 'top 10%', scrub: true } });
    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '#main', start: 'top 80%', end: 'top 20%', scrub: true } });
  } else {
    /* ---- inner pages: cube breaks into calm waves, dimmed behind the content */
    sceneState.scrollMorph = 4;
    sceneState.ambient = 0.55;
    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'power2.out', delay: 0.4 });
  }

  if (reduced) {
    document.querySelectorAll<HTMLElement>('.sw-i').forEach((w) => (w.style.transform = 'none'));
    return;
  }

  if (isHome) {
    /* hero entrance */
    gsap.from('[data-hero-in]', { opacity: 0, y: 24, duration: 1.4, stagger: 0.12, delay: 1.6, ease: 'power3.out' });
    gsap.from('[data-hero-card]', { opacity: 0, y: 40, duration: 1.4, stagger: 0.12, delay: 2.1, ease: 'power3.out' });
    gsap.from('#hero [data-split] .sw-i', { yPercent: 110, duration: 1.4, stagger: 0.07, delay: 1.2, ease: 'power4.out' });

    // hero copy drifts up and away as the tree dissolves
    gsap.to('.hero-content', { y: -140, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 25%', scrub: true } });

    // runway captions fade through
    gsap.utils.toArray<HTMLElement>('[data-gate-caption]').forEach((el) => {
      gsap
        .timeline({ scrollTrigger: { trigger: el.parentElement, start: 'top 75%', end: 'bottom 25%', scrub: true } })
        .fromTo(el, { opacity: 0, y: 40, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 })
        .to(el, { opacity: 0, y: -40, filter: 'blur(8px)', duration: 1 }, '+=0.6');
    });

    // about copy leaves as the cube breaks apart
    gsap.to('#about .about-in', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '#about', start: 'bottom 85%', end: 'bottom 35%', scrub: true } });

    // word-by-word headline reveals below the hero
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
      if (el.closest('#hero')) return;
      const inAbout = !!el.closest('#about');
      gsap.from(el.querySelectorAll('.sw-i'), { yPercent: 110, duration: 1.2, stagger: 0.06, ease: 'power4.out', scrollTrigger: { trigger: inAbout ? '#about' : el, start: inAbout ? 'top 55%' : 'top 85%', once: true } });
    });

    gsap.set('[data-reveal]', { opacity: 0, y: 36 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
  }
});

const refresh = () => ScrollTrigger.refresh();
window.addEventListener('load', refresh);
document.fonts?.ready.then(refresh).catch(() => {});
// the home page fills in after the data scripts run, so re-measure once its content has settled
setTimeout(refresh, 600);
setTimeout(refresh, 1800);

/* ---------------------------------------------------------------- page curtain (thin-line sweep between pages) */
requestAnimationFrame(() => curtain.classList.add('out'));
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    curtain.classList.remove('in');
    curtain.classList.add('out');
  }
});
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || /\.(pdf|zip|jpg|png|webp)$/i.test(url.pathname)) return;
  if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash jump
  if (reduced) return;
  e.preventDefault();
  curtain.classList.remove('out');
  curtain.classList.add('in');
  setTimeout(() => {
    location.href = a.href;
  }, 520);
});
