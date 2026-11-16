/* ==========================================================================
   main.js — DEVAMANI streaming-style portfolio
   Loaded on every page (after data.js and content.js).

   Sections
   1. Helpers & storage          6. Rows, cards, arrows
   2. Content -> card items      7. Detail modal
   3. Profiles                   8. Search
   4. Header / footer chrome     9. Home-page boot (splash, picker, hero)
   5. Page effects              10. Contact page (email form)

   <body data-page="home|resume|contact|vihara|story"  data-root="" or "../">
   ========================================================================== */

/* 1. HELPERS & STORAGE --------------------------------------------------- */
const ROOT = document.body.dataset.root || "";
const PAGE = document.body.dataset.page || "";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $  = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const decode = s => { const t = document.createElement("textarea"); t.innerHTML = s; return t.value; };
const asset = p => (p && !/^(https?:|\/)/.test(p) ? ROOT + p : p);
/* small preview copies (assets/images/gallery/thumbs/...) keep the grids fast; full files open in the viewer */
const thumbOf = p => (p && p.indexOf("assets/images/gallery/") === 0 ? p.replace("assets/images/gallery/", "assets/images/gallery/thumbs/") : p);

/* localStorage can throw (private windows, blocked storage) — always wrap. */
const store = {
  get(key, fallback = null) { try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } },
  getJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; } },
  setJSON(key, val) { this.set(key, JSON.stringify(val)); }
};
const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } },
  set(key, val) { try { sessionStorage.setItem(key, val); } catch (e) { /* ignore */ } }
};


/* GALLERY PASSWORD GATE -------------------------------------------------------
   Visitors see the Photography collection only. "Travel & Memories" and "All"
   ask for a password. The password is stored only as a SHA-256 hash.
   NOTE: this is a front-end gate for a static site. It hides the photos from
   normal visitors, but it is not real security: the image files and data.js
   remain publicly reachable by URL. Use a server-side login for true privacy. */
const GAL_HASH = "a5c3dd48facf21ed5f916d0ae979091fead570e6aea6c1d8038d1f68b26fa51f";
/* Unlock state lives in memory only: a refresh, leaving the page or the Back button locks it again. */
let galOpen = false;
try { sessionStorage.removeItem("dm.gallery"); } catch (e) { /* ignore */ }
window.addEventListener("pageshow", e => { if (e.persisted && galOpen) location.reload(); });  /* Back/Forward cache restore */
const galUnlocked = () => galOpen;
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function askGalleryPassword() {
  return new Promise(resolve => {
    const prev = document.activeElement;
    const wrap = document.createElement("div");
    wrap.className = "pw-back";
    wrap.innerHTML = `
      <form class="pw-box" role="dialog" aria-modal="true" aria-labelledby="pw-t" autocomplete="off">
        <i class="fa-solid fa-lock pw-ico" aria-hidden="true"></i>
        <h3 id="pw-t">Private collection</h3>
        <p>Enter the password to view Travel &amp; Memories.</p>
        <input type="password" id="pw-in" inputmode="numeric" placeholder="Password" aria-label="Password" autocomplete="off">
        <div class="pw-err" id="pw-err" role="alert"></div>
        <div class="pw-actions"><button type="button" class="btn btn-info" data-x>Cancel</button><button type="submit" class="btn btn-play">Unlock</button></div>
      </form>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("open"));
    const input = wrap.querySelector("#pw-in"), err = wrap.querySelector("#pw-err"), box = wrap.querySelector(".pw-box");
    input.focus();
    const done = ok => { wrap.classList.remove("open"); setTimeout(() => wrap.remove(), 250); if (prev && prev.focus) prev.focus(); resolve(ok); };
    wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest("[data-x]")) done(false); });
    wrap.addEventListener("keydown", e => { if (e.key === "Escape") done(false); });
    box.addEventListener("submit", async e => {
      e.preventDefault();
      if (!(window.crypto && crypto.subtle)) { err.textContent = "Unlocking needs a secure (https) connection."; return; }
      if (await sha256Hex(input.value.trim()) === GAL_HASH) { galOpen = true; done(true); }
      else { err.textContent = "Wrong password. Try again."; box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); input.select(); }
    });
  });
}

/* Stable pseudo-random "match %" (90–98) per item, so it never flickers. */
function matchFor(key) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 90 + (h % 9);
}

/* 2. CONTENT -> CARD ITEMS ------------------------------------------------
   Every row is built from the data files and normalised to one shape:
   { key, kind, title, cap, image, icon, color, brand, tags[], match, year, dur,
     desc, label, progress, rank, cast[], episodes[], html, link, linkText, result }
   -------------------------------------------------------------------------- */
const ITEMS = {};                       // key -> item (used by modal + search)
function reg(item) { placeholderArt(item); item.match = matchFor(item.key); ITEMS[item.key] = item; return item; }

const careerIcons = { education: "fa-graduation-cap", symbiosys: "fa-network-wired", "vizag-amogh": "fa-snowflake", atmecs: "fa-heart-pulse", ibexlabs: "fa-building-columns" };

function buildRows() {
  const rows = {};

  rows.skills = skills.map(s => reg({
    key: s.id, kind: "Skill", title: s.title, icon: s.icon, brand: s.brand, color: s.color, tags: s.tags,
    dur: s.level, desc: s.desc, cast: s.tags, episodes: [], year: "Skill"
  }));

  const jobs = careerTimeline.filter(c => c.id !== "future-goals");
  rows.career = jobs.map((c, i) => {
    const years = (c.date.match(/\d{4}/g) || []);
    const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0] || "";
    const current = /present/i.test(c.date);
    const title = decode(c.title), sub = decode(c.subtitle);
    const d = document.createElement("div"); d.innerHTML = c.fullDetails;
    return reg({
      key: "c-" + c.id, kind: "Career", title: `S1 E${i + 1} – ${title}${sub ? " at " + sub : ""} (${span})`,
      cap: `S1 E${i + 1} · ${title}`, icon: careerIcons[c.id] || "fa-briefcase",
      color: ["#1e3a8a", "#7c2d12", "#0e7490", "#6d28d9", "#9f1239"][i % 5],
      tags: c.tags, dur: c.date, year: span, desc: decode(c.summary),
      progress: current ? 65 : 100, progressNote: current ? "In progress" : "Season complete",
      cast: c.tags, episodes: $$("li", d).map(li => li.textContent)
    });
  });

  rows.projects = projects.map(p => {
    const res = (p.results && p.results[0]) || "";
    return reg({
      key: "p-" + p.id, kind: "Project", title: p.title, art: ({ "artemis-cpe": "pipeline", "western-asset-management": "warehouse", "viharasetu-website": "web" })[p.id] || "pipeline", tags: p.tags, dur: p.duration, year: p.duration.match(/\d{4}/)?.[0] || "",
      desc: `${p.problem} ${p.solution}`, cast: p.tags, episodes: p.responsibilities,
      result: res.startsWith("[") ? "[EDIT] Add a measurable result" : res,
      extra: `<p><b>Client</b><br>${esc(p.client)}</p><p><b>Role</b><br>${esc(p.role)}</p>`
    });
  });

  rows.top10 = topTen.map((t, i) => reg({
    key: t.id, kind: "Top 10", title: t.title, icon: t.icon, brand: t.brand, color: t.color, tags: t.tags,
    rank: i + 1, desc: t.desc, paragraphs: t.paragraphs, year: "Rank #" + (i + 1), dur: "Data Engineering", cast: t.related || t.tags, episodes: t.points || [], epTitle: t.points ? "What I do with it" : undefined
  }));

  rows.vihara = viharaOriginals.map(v => reg({
    key: v.id, kind: "ViharaSetu", title: v.title, image: v.image, icon: v.icon, tags: v.tags, label: "VIHARASETU ORIGINAL",
    year: "2026", dur: "Since 20 Feb 2026", desc: v.desc, cast: ["T Devamani Raju", "Sateesh R", "Devi K"],
    link: "viharasetu.html", linkText: "Visit ViharaSetu"
  }));

  rows.travel = travelStories.map(t => reg({
    key: "tr-" + t.id, kind: "Travel", title: t.title, image: t.image, art: t.art, theme: t.theme, tags: t.tags, year: t.date, dur: t.location, desc: t.description,
    cast: ["Companions: [EDIT]"], episodes: ["Day 1 – [EDIT]", "Day 2 – [EDIT]", "Day 3 – [EDIT]"],
    link: t.storyPage, linkText: "Read the full story"
  }));

  rows.trek = trekkingStories.map(t => reg({
    key: "tk-" + t.id, kind: "Trekking", title: t.title, image: t.image, art: t.art, theme: t.theme, label: t.status ? "PLANNED · " + t.date.toUpperCase() : undefined, tags: t.tags, year: t.date, dur: t.duration, desc: t.description,
    cast: ["Companions: [EDIT]"],
    episodes: [`Location – ${t.location}`, `Difficulty – ${t.difficulty}`, `Distance – ${t.distance}`, `Max altitude – ${t.altitude}`, `Duration – ${t.duration}`],
    link: t.storyPage, linkText: "Read the trek diary"
  }));

  rows.life = lifeStories.map(l => reg({
    key: "l-" + l.id, kind: "Life Story", title: l.title, image: l.image, tags: [l.category], year: l.date, dur: l.category,
    desc: l.description, html: l.content, cast: [], episodes: []
  }));

  rows.inspirations = inspirationsList.map(i => reg({
    key: i.id, kind: "Inspiration", title: i.title, image: i.image, tags: i.tags, year: "People", dur: "Inspiration",
    desc: i.desc, cast: [], episodes: [], link: i.page, linkText: "Read the story"
  }));

  rows.gallery = galleryImages.map((g, i) => ({ g, i })).filter(({ g }) => galUnlocked() || g.category === "Photography").map(({ g, i }) => reg({
    key: "g-" + i, kind: "Gallery", title: g.caption, image: thumbOf(g.src), full: g.src, tags: [g.category], year: "Photo", dur: g.category,
    desc: "", cast: [], episodes: [], galleryOnly: true
  }));

  return rows;
}

/* Row catalogue: id -> title, group (used by nav anchors) */
const ROW_META = {
  myList:       { title: "My List", group: "work" },
  skills:       { title: "Top Skills", group: "work" },
  career:       { title: "Career Timeline", group: "work" },
  projects:     { title: "Featured Projects", group: "work" },
  top10:        { title: "Top 10 in Data Engineering", group: "work" },
  vihara:       { title: "ViharaSetu Originals", group: "vihara" },
  travel:       { title: "Travel Journal", group: "journal" },
  trek:         { title: "Trekking Diaries", group: "journal" },
  life:         { title: "Life Stories", group: "journal" },
  inspirations: { title: "My Inspirations", group: "journal" },
  gallery:      { title: "Gallery", group: "journal" }
};

/* 3. PROFILES -------------------------------------------------------------
   Each profile just changes the row order — nothing is hidden. */
const PROFILES = {
  recruiter: { name: "Recruiter", sub: "Career & Projects first", icon: "fa-briefcase", cls: "av-recruiter",
    order: ["career", "projects", "skills", "top10", "vihara", "travel", "trek", "life", "inspirations", "gallery"] },
  engineer:  { name: "Data Engineer", sub: "Skills & Top 10 first", icon: "fa-database", cls: "av-engineer",
    order: ["skills", "top10", "projects", "career", "vihara", "travel", "trek", "life", "inspirations", "gallery"] },
  traveler:  { name: "Traveler", sub: "Travel & Trekking first", icon: "fa-mountain-sun", cls: "av-traveler",
    order: ["travel", "trek", "gallery", "life", "inspirations", "vihara", "skills", "career", "projects", "top10"] },
  vihara:    { name: "ViharaSetu", sub: "Originals first", icon: "fa-bridge", cls: "av-vihara",
    order: ["vihara", "travel", "trek", "gallery", "life", "inspirations", "projects", "career", "skills", "top10"] }
};
const getProfileId = () => { const p = store.get("dm.profile"); return PROFILES[p] ? p : null; };

/* 4. HEADER / FOOTER CHROME ----------------------------------------------- */
const SOCIAL = [
  { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "https://www.linkedin.com/in/tdevamani/" },
  { icon: "fa-brands fa-github", label: "GitHub", href: "https://github.com/manirajdeva" },
  { icon: "fa-brands fa-instagram", label: "Instagram", href: "https://instagram.com/maniraj_deva" },
  { icon: "fa-brands fa-youtube", label: "YouTube", href: "https://www.youtube.com/@Travel_with_devaratha" }
];
const NAV_ITEMS = [
  ["home", "index.html", "home"], ["work", "work.html", "work"], ["gallery", "gallery.html", "gallery"], ["trekking", "trekking.html", "trekking"],
  ["inspirations", "inspirations.html", "inspirations"], ["vihara", "viharasetu.html", "viharasetu"], ["contact", "contact.html", "contact"]
];
const PALETTE_PAGES = [
  ["Home", "index.html", "fa-house", "Landing page"], ["Work", "work.html", "fa-briefcase", "Experience, projects and toolbox"],
  ["Resume", "resume.html", "fa-file-lines", "Resume and download"], ["Gallery", "gallery.html", "fa-images", "Photography and memories"],
  ["Trekking", "trekking.html", "fa-mountain", "Trek diaries"], ["Inspirations", "inspirations.html", "fa-lightbulb", "People who shaped me"],
  ["ViharaSetu", "viharasetu.html", "fa-bridge", "The travel venture I co-founded"], ["Contact", "contact.html", "fa-envelope", "Say hello"]
];

function headerHTML() {
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="dv-bar" id="dv-bar">
    <div class="dv-bar-in">
      <a href="${ROOT}index.html" class="dv-logo" aria-label="T Devamani Raju — home"><span class="dv-lt">&lt;</span>devamani<span class="dv-lt">/&gt;</span></a>
      <nav class="dv-tabs" id="nav-links" aria-label="Main">${NAV_ITEMS.map(([k, h, l]) => `<a href="${ROOT}${h}" data-nav="${k}">${l}</a>`).join("")}</nav>
      <div class="dv-right">
        <button class="dv-k" id="dv-open" type="button" aria-label="Search and jump to a page (Ctrl K)"><i class="fa-solid fa-magnifying-glass"></i><span>Search</span><kbd>Ctrl K</kbd></button>
        <a class="dv-cta" href="${ROOT}resume.html"><i class="fa-solid fa-file-lines"></i> Resume</a>
        <button class="dv-ham" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
  </header>`;
}

function footerHTML() {
  const col = (title, links) => `<div><h4>${title}</h4><ul>${links.map(([t, h, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a></li>`).join("")}</ul></div>`;
  return `
  <footer class="dv-foot">
    <div class="dv-foot-in">
      <div class="dv-foot-top">
        <div class="dv-foot-brand">
          <a href="${ROOT}index.html" class="dv-logo"><span class="dv-lt">&lt;</span>devamani<span class="dv-lt">/&gt;</span></a>
          <p>Software &amp; data engineer. I build reliable pipelines, trails and bridges.</p>
          <span class="dv-status"><i></i> Bengaluru, India</span>
        </div>
        <div class="dv-foot-cols">
          ${col("Navigate", [["Home", ROOT + "index.html"], ["Work", ROOT + "work.html"], ["Resume", ROOT + "resume.html"], ["Contact", ROOT + "contact.html"]])}
          ${col("Explore", [["Gallery", ROOT + "gallery.html"], ["Trekking", ROOT + "trekking.html"], ["Inspirations", ROOT + "inspirations.html"], ["ViharaSetu", ROOT + "viharasetu.html"]])}
          ${col("Elsewhere", SOCIAL.map(s => [s.label, s.href, true]))}
        </div>
      </div>
      <div class="dv-foot-bottom"><span>&copy; 2026 T Devamani Raju</span><span class="dv-mono">built with HTML, CSS &amp; vanilla JS</span></div>
    </div>
  </footer>`;
}

/* Command palette: Ctrl/Cmd+K or the Search button. Jump to a page or a story. */
function initPalette() {
  let wrap = null, items = [], sel = 0;
  const index = () => {
    const pages = PALETTE_PAGES.map(([t, h, i, s]) => ({ t, s, i, u: ROOT + h }));
    const extra = typeof buildSearchIndex === "function" ? buildSearchIndex().map(x => ({ t: x.title, s: x.type, i: "fa-hashtag", u: ROOT + x.url, tags: (x.tags || []).join(" ") })) : [];
    return pages.concat(extra);
  };
  const draw = q => {
    const all = index(), term = q.trim().toLowerCase();
    items = term ? all.filter(x => (x.t + " " + (x.s || "") + " " + (x.tags || "")).toLowerCase().includes(term)) : all.slice(0, PALETTE_PAGES.length);
    items = items.slice(0, 9); sel = 0;
    $("#dv-list", wrap).innerHTML = items.length ? items.map((x, n) => `<a class="dv-item${n === 0 ? " on" : ""}" href="${x.u}" data-n="${n}"><i class="fa-solid ${x.i}"></i><span><b>${esc(x.t)}</b><small>${esc(x.s || "")}</small></span><em>↵</em></a>`).join("") : `<p class="dv-none">No match for "${esc(q)}".</p>`;
  };
  const mark = () => $$(".dv-item", wrap).forEach((a, n) => { a.classList.toggle("on", n === sel); if (n === sel) a.scrollIntoView({ block: "nearest" }); });
  const close = () => { if (wrap) { wrap.classList.remove("open"); document.body.classList.remove("no-scroll"); } };
  const open = () => {
    if (!wrap) {
      wrap = document.createElement("div"); wrap.className = "dv-pal";
      wrap.innerHTML = `<div class="dv-pal-box" role="dialog" aria-modal="true" aria-label="Search"><div class="dv-pal-in"><i class="fa-solid fa-magnifying-glass"></i><input id="dv-q" type="text" placeholder="Jump to a page, project or story…" autocomplete="off" aria-label="Search"><kbd>Esc</kbd></div><div id="dv-list" class="dv-list"></div><div class="dv-pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></div></div>`;
      document.body.appendChild(wrap);
      wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest(".dv-item")) close(); });
      const q = $("#dv-q", wrap);
      q.addEventListener("input", () => draw(q.value));
      q.addEventListener("keydown", e => {
        if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); mark(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); }
        else if (e.key === "Enter" && items[sel]) { location.href = items[sel].u; }
      });
    }
    $("#dv-q", wrap).value = ""; draw("");
    wrap.classList.add("open"); document.body.classList.add("no-scroll");
    setTimeout(() => $("#dv-q", wrap).focus(), 30);
  };
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); wrap && wrap.classList.contains("open") ? close() : open(); }
    else if (e.key === "Escape") close();
    else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName) && !(wrap && wrap.classList.contains("open"))) { e.preventDefault(); open(); }
  });
  $("#dv-open").addEventListener("click", open);
}

let PAGE_NAV = "";
function initChrome() {
  const h = $("#site-header"), f = $("#site-footer");
  if (h) h.outerHTML = headerHTML();
  if (f) f.outerHTML = footerHTML();

  const bar = $("#dv-bar");
  const onScroll = () => bar.classList.toggle("solid", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Highlight the current page */
  if (location.pathname.includes("/inspirations/")) PAGE_NAV = "inspirations";
  if (/-trek\.html$/.test(location.pathname)) PAGE_NAV = "trekking";
  const here = PAGE_NAV || { home: "home", devhome: "home", work: "work", devwork: "work", gallery: "gallery", inspirations: "inspirations", trekking: "trekking", resume: "work", contact: "contact", vihara: "vihara", story: "trekking" }[PAGE] || "";
  $$(`[data-nav="${here}"]`).forEach(a => a.classList.add("active"));

  /* Mobile menu */
  const ham = $("#hamburger"), links = $("#nav-links");
  const setMenu = open => {
    links.classList.toggle("open", open);
    ham.setAttribute("aria-expanded", open);
    ham.innerHTML = `<i class="fa-solid ${open ? "fa-xmark" : "fa-bars"}"></i>`;
  };
  ham.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  initPalette();
}
function setNavAvatar() { /* profiles were removed in the redesign */ }

/* 5. PAGE EFFECTS ----------------------------------------------------------
   Fade-in on scroll for anything with .fx */
function initFadeIn() {
  const els = $$(".fx:not(.in)");
  if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

/* 6. ROWS, CARDS, ARROWS ---------------------------------------------------- */
const likes = new Set(store.getJSON("dm.likes", []));
const myList = new Set(store.getJSON("dm.list", []));

/* Thin-line animated SVG artwork for cards (used instead of photos).
   Add a new design by adding a key to LINE_ART; give an item art:"key". */
const LINE_ART = {
  /* data pipeline: sources -> warehouse -> reports */
  pipeline: `
    <g class="ln"><rect x="22" y="32" width="34" height="22" rx="4"/><rect x="22" y="80" width="34" height="22" rx="4"/><rect x="22" y="128" width="34" height="22" rx="4"/></g>
    <path class="draw" style="--d:.1s" pathLength="1" d="M56 43 C96 43 96 91 132 91"/>
    <path class="draw" style="--d:.3s" pathLength="1" d="M56 91 L132 91"/>
    <path class="draw" style="--d:.5s" pathLength="1" d="M56 139 C96 139 96 91 132 91"/>
    <path class="flow" pathLength="1" d="M56 43 C96 43 96 91 132 91 M56 91 L132 91 M56 139 C96 139 96 91 132 91"/>
    <g class="draw" style="--d:.8s"><rect pathLength="1" x="132" y="66" width="56" height="50" rx="8"/><path pathLength="1" d="M144 82 H176 M144 91 H176 M144 100 H164"/></g>
    <path class="draw" style="--d:1.2s" pathLength="1" d="M188 91 C216 91 216 52 246 52 M188 91 C216 91 216 130 246 130"/>
    <path class="flow" pathLength="1" d="M188 91 C216 91 216 52 246 52 M188 91 C216 91 216 130 246 130"/>
    <g class="draw" style="--d:1.5s"><rect pathLength="1" x="246" y="34" width="52" height="36" rx="5"/><path pathLength="1" d="M256 62 V52 M266 62 V46 M276 62 V56 M286 62 V42"/><rect pathLength="1" x="246" y="112" width="52" height="36" rx="5"/><path pathLength="1" d="M256 140 L268 128 L278 134 L290 120"/></g>`,
  /* warehouse: stacked data layers + rising line */
  warehouse: `
    <path class="draw" style="--d:.1s" pathLength="1" d="M14 62 H96 M14 90 H96 M14 118 H96"/>
    <path class="flow" pathLength="1" d="M14 62 H96 M14 90 H96 M14 118 H96"/>
    <g class="draw" style="--d:.4s"><ellipse pathLength="1" cx="150" cy="52" rx="48" ry="12"/><path pathLength="1" d="M102 52 V128 M198 52 V128"/><path pathLength="1" d="M102 80 A48 12 0 0 0 198 80 M102 104 A48 12 0 0 0 198 104 M102 128 A48 12 0 0 0 198 128"/></g>
    <path class="draw" style="--d:1.1s" pathLength="1" d="M214 90 C230 90 230 90 244 90"/>
    <g class="draw" style="--d:1.3s"><path pathLength="1" d="M244 140 V40 M244 140 H304"/><path pathLength="1" d="M250 128 L266 106 L280 114 L300 62"/></g>
    <circle class="pulse" cx="300" cy="62" r="4"/>`,
  /* website: browser frame, mountain and route */
  web: `
    <g class="draw" style="--d:.1s"><rect pathLength="1" x="58" y="26" width="204" height="128" rx="9"/><path pathLength="1" d="M58 48 H262"/></g>
    <g class="ln"><circle cx="72" cy="37" r="3"/><circle cx="84" cy="37" r="3"/><circle cx="96" cy="37" r="3"/></g>
    <path class="draw" style="--d:.7s" pathLength="1" d="M70 142 L116 92 L142 118 L186 66 L250 142"/>
    <circle class="draw" style="--d:1.1s" pathLength="1" cx="226" cy="76" r="10"/>
    <path class="draw" style="--d:1.4s" pathLength="1" d="M80 138 C116 124 136 146 176 126 S228 112 238 134"/>
    <path class="flow" pathLength="1" d="M80 138 C116 124 136 146 176 126 S228 112 238 134"/>
    <circle class="pulse" cx="238" cy="134" r="4"/>`
};
LINE_ART.journey = `
    <g class="draw" style="--d:.1s"><path pathLength="1" d="M0 142 L66 82 L108 114 L170 48 L238 122 L270 98 L320 142"/><path pathLength="1" d="M150 68 L170 48 L190 70 M52 98 L66 82 L80 98"/></g>
    <circle class="draw" style="--d:.9s" pathLength="1" cx="252" cy="38" r="14"/>
    <path class="draw" style="--d:1.2s" pathLength="1" d="M18 164 C86 142 130 172 200 152 S286 144 304 122"/>
    <path class="flow" pathLength="1" d="M18 164 C86 142 130 172 200 152 S286 144 304 122"/>
    <circle class="pulse" cx="304" cy="122" r="4"/>`;
LINE_ART.contours = [34, 56, 78, 100, 124].map((r, i) => `<ellipse class="draw" style="--d:${(i * .25).toFixed(2)}s" pathLength="1" cx="160" cy="92" rx="${r * 1.25}" ry="${r * .62}" transform="rotate(${-14 + i * 6} 160 92)"/>`).join("") +
  `<path class="draw" style="--d:1.4s" pathLength="1" d="M146 100 L160 74 L174 100 Z"/><circle class="pulse" cx="160" cy="68" r="3.5"/>`;
LINE_ART.orbits = `<circle class="draw" pathLength="1" cx="160" cy="92" r="16"/>` + [34, 58, 84].map((r, i) => `<circle class="draw" style="--d:${(i * .3).toFixed(1)}s" pathLength="1" cx="160" cy="92" r="${r}"/><g class="orb ${i % 2 ? "r" : ""}" style="animation-duration:${10 + i * 5}s"><circle class="dot" cx="${160 + r}" cy="92" r="4"/></g>`).join("");
const LINE_THEME = { rajasthan: ["#b45309", "#7c2d12"], vihara: ["#c2410c", "#0f3d3a"], travel: ["#3730a3", "#0e7490"], trek: ["#166534", "#0b1d3a"], life: ["#7e22ce", "#be123c"] };
/* Cards whose photo file is still a "[Cover Image]" placeholder get generated line-art instead */
const PLACEHOLDER_IMG = /life-0\d|gallery\/project-|data-engineering|trekking\/trek-(01|netravathi|sivagange|zpoint)|viharasetu\/(gallery-\d|our-story|why-|viharasetu-cover\.jpg)/;
const VIHARA_LOGO = "assets/images/viharasetu/viharasetu-logo.png";
function logoTile(it) { return `<div class="logo-tile"><img src="${asset(VIHARA_LOGO)}" alt="${esc(it.title)} — ViharaSetu logo"></div>`; }
function placeholderArt(it) {
  if (!it.image || !PLACEHOLDER_IMG.test(it.image)) return;
  if (/viharasetu-cover\.jpg/.test(it.image)) { it.logo = true; return; }
  const k = it.kind;
  it.art = k === "Trekking" ? "contours" : k === "Life Story" ? "orbits" : k === "Project" ? "pipeline" : "journey";
  it.theme = k === "Trekking" ? "trek" : k === "Life Story" ? "life" : k === "Travel" ? "travel" : "vihara";
}
LINE_ART.abc = `
    <circle class="draw acc" style="--d:.1s" pathLength="1" cx="58" cy="42" r="11"/>
    <g class="draw" style="--d:.3s"><path pathLength="1" d="M0 160 L46 126 L86 144 L136 92 L170 132 L214 62 L236 84 L264 38 L302 104 L320 92"/><path pathLength="1" d="M96 160 L124 86 L134 102 L146 86 L176 160"/></g>
    <path class="draw" style="--d:1.2s" pathLength="1" d="M254 56 L264 38 L276 60 M206 76 L214 62 L224 78"/>
    <path class="draw acc" style="--d:1.4s" pathLength="1" d="M14 172 C66 160 90 176 140 158 S212 152 238 124 S266 102 280 94"/>
    <path class="flow" pathLength="1" d="M14 172 C66 160 90 176 140 158 S212 152 238 124 S266 102 280 94"/>
    <path class="draw" style="--d:2s" pathLength="1" d="M276 102 L284 88 L292 102 Z"/><circle class="pulse" cx="284" cy="84" r="3.5"/>`;
LINE_ART.rajasthan = `
    <circle class="draw acc" style="--d:.1s" pathLength="1" cx="256" cy="44" r="14"/>
    <path class="draw" style="--d:.3s" pathLength="1" d="M0 162 H320"/>
    <path class="draw" style="--d:.5s" pathLength="1" d="M16 162 V122 H28 V114 H36 V122 H48 V114 H56 V122 H68 V114 H76 V122 H88 V162"/>
    <g class="draw" style="--d:.9s"><path pathLength="1" d="M112 162 V98 H238 V162"/><path pathLength="1" d="M122 98 a13 13 0 0 1 26 0 M148 98 V86 M135 85 V78 M175 98 a14 14 0 0 1 28 0 M189 84 V70 M186 70 h6 M212 98 a13 13 0 0 1 26 0 M225 85 V78"/><path pathLength="1" d="M128 162 V138 a9 9 0 0 1 18 0 V162 M166 162 V132 a10 10 0 0 1 20 0 V162 M206 162 V138 a9 9 0 0 1 18 0 V162"/></g>
    <path class="draw" style="--d:1.6s" pathLength="1" d="M256 162 V134 L268 122 L280 134 V162 M244 162 h48"/>
    <path class="draw acc" style="--d:1.9s" pathLength="1" d="M0 176 C60 166 110 180 170 172 S270 164 320 174"/>
    <path class="flow" pathLength="1" d="M0 176 C60 166 110 180 170 172 S270 164 320 174"/>
    <circle class="pulse" cx="300" cy="170" r="3.5"/>`;
function lineArt(kind, theme) {
  const t = LINE_THEME[theme];
  return `<div class="line-art" ${t ? `style="--bg1:${t[0]};--bg2:${t[1]}"` : ""} aria-hidden="true"><svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round" stroke-linejoin="round">${LINE_ART[kind] || LINE_ART.pipeline}</svg></div>`;
}

function thumbHTML(it) {
  if (it.logo) return logoTile(it);
  if (it.art) return lineArt(it.art, it.theme);
  if (it.image) return `<img src="${asset(it.image)}" alt="${esc(it.title)}" loading="lazy" decoding="async">`;
  return `<div class="tile-icon" style="background:linear-gradient(135deg, ${it.color || "#333"}, #111)">
            <i class="${it.brand ? "fa-brands" : "fa-solid"} ${it.icon || "fa-star"}" aria-hidden="true"></i>${it.cap ? "" : `<span>${esc(it.title)}</span>`}</div>`;
}

/* Flip-card back faces for skill tiles: thin-line animated SVG per skill */
const arms = [0, 60, 120, 180, 240, 300].map(a => `<path class="draw" pathLength="1" transform="rotate(${a} 80 50)" d="M80 50 V16 M80 30 l-7 -7 M80 30 l7 -7"/>`).join("");
const SKILL_ART = {
  snowflake: `<g class="spin slow">${arms}</g><circle class="pulse" cx="80" cy="50" r="3"/>`,
  dbt: `<path class="draw" pathLength="1" d="M22 24 H48 M22 50 H48 M22 76 H48 M48 24 C64 24 64 50 78 50 M48 50 H78 M48 76 C64 76 64 50 78 50 M92 50 H110 M110 50 C122 50 122 28 136 28 M110 50 C122 50 122 72 136 72"/>
    <path class="flow" pathLength="1" d="M22 24 H48 M22 50 H48 M22 76 H48 M48 24 C64 24 64 50 78 50 M48 50 H78 M48 76 C64 76 64 50 78 50 M92 50 H110 M110 50 C122 50 122 28 136 28 M110 50 C122 50 122 72 136 72"/>
    <g class="draw" pathLength="1"><circle pathLength="1" cx="16" cy="24" r="6"/><circle pathLength="1" cx="16" cy="50" r="6"/><circle pathLength="1" cx="16" cy="76" r="6"/><rect pathLength="1" x="78" y="40" width="14" height="20" rx="3"/><circle pathLength="1" cx="142" cy="28" r="6"/><circle pathLength="1" cx="142" cy="72" r="6"/></g>`,
  airflow: `<g class="spin"><circle class="draw" pathLength="1" cx="80" cy="50" r="5"/>${[0, 72, 144, 216, 288].map(a => `<path class="draw" pathLength="1" transform="rotate(${a} 80 50)" d="M80 45 C80 28 94 20 104 26 C94 26 88 36 84 47"/>`).join("")}</g>
    <path class="flow" pathLength="1" d="M14 82 C40 70 52 94 80 84 S124 72 148 82"/>`,
  sql: `<g class="draw"><rect pathLength="1" x="30" y="18" width="100" height="64" rx="5"/><path pathLength="1" d="M30 36 H130 M30 54 H130 M30 70 H130 M70 18 V82 M104 18 V82"/></g>
    <rect class="scan" x="31" y="37" width="98" height="16" rx="2"/>`,
  python: `<path class="draw" pathLength="1" d="M26 30 L44 46 L26 62 M54 66 H84"/>
    <path class="draw" style="--d:.4s" pathLength="1" d="M112 40 A18 18 0 1 1 100 62 M112 40 l-8 -2 M112 40 l-2 8"/>
    <rect class="blink" x="90" y="64" width="10" height="2.5"/>`,
  aws: `<path class="draw" pathLength="1" d="M42 66 C26 66 24 44 40 42 C40 22 70 14 82 30 C98 20 122 34 116 52 C132 52 134 68 118 68 Z"/>
    <path class="bob" pathLength="1" d="M70 82 V50 M62 58 L70 50 L78 58"/>
    <path class="bob2" pathLength="1" d="M92 50 V82 M84 74 L92 82 L100 74"/>`
};
function skillBack(it) {
  const svg = SKILL_ART[it.key] || SKILL_ART.snowflake;
  return `<div class="face back" style="background:linear-gradient(135deg, ${it.color || "#333"}, #0b0d12)"><svg class="line-art-svg" viewBox="0 0 160 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg><div class="back-note">${esc(it.dur || "")}</div></div>`;
}

function cardHTML(it, opts = {}) {
  if (it.kind === "Skill" && !opts.top10) return `
  <article class="card flip" tabindex="0" data-key="${esc(it.key)}" aria-label="${esc(it.title)}">
    <div class="thumb"><div class="flip-in"><div class="face front">${thumbHTML(it)}</div>${skillBack(it)}</div></div>
  </article>`;
  const on = k => (k === "list" ? myList.has(it.key) : likes.has(it.key));
  const panel = it.galleryOnly ? "" : `
    <div class="panel">
      <div class="ctrls">
        <button class="ctrl play" data-act="open" aria-label="Open ${esc(it.title)}"><i class="fa-solid fa-play"></i></button>
        <button class="ctrl ${on("list") ? "on" : ""}" data-act="list" aria-pressed="${on("list")}" aria-label="Add ${esc(it.title)} to My List"><i class="fa-solid ${on("list") ? "fa-check" : "fa-plus"}"></i></button>
        <button class="ctrl ${on("like") ? "on" : ""}" data-act="like" aria-pressed="${on("like")}" aria-label="Like ${esc(it.title)}"><i class="fa-regular fa-thumbs-up"></i></button>
        <button class="ctrl more" data-act="open" aria-label="More details about ${esc(it.title)}"><i class="fa-solid fa-chevron-down"></i></button>
      </div>
      <div class="ttl">${esc(it.cap || it.title)}</div>
      <div class="m"><span class="match">${it.match}% Match</span>${it.year ? `<span>${esc(it.year)}</span>` : ""}${it.dur ? `<span>${esc(it.dur)}</span>` : ""}</div>
      <div class="t">${it.tags.slice(0, 3).map(esc).join("<i>•</i>")}</div>
      ${it.result ? `<div class="t" style="margin-top:.35rem;color:#46d369">${esc(it.result)}</div>` : ""}
      ${it.progress != null ? `<div class="ep-bar" title="${esc(it.progressNote || "")}"><i style="width:${it.progress}%"></i></div>` : ""}
    </div>`;

  return `
  <article class="card ${opts.top10 ? "top10" : ""}" tabindex="0" data-key="${esc(it.key)}" aria-label="${esc(it.title)}">
    ${opts.top10 ? `<span class="rank" aria-hidden="true">${it.rank}</span>` : ""}
    <div class="thumb">
      ${it.label ? `<span class="label">${esc(it.label)}</span>` : ""}
      ${thumbHTML(it)}
      ${opts.top10 || !(it.image || it.cap || it.art || it.logo) ? "" : `<div class="cap">${esc(it.cap || it.title)}</div>`}
      ${it.progress != null && !opts.top10 ? `<div class="progress"><i style="width:${it.progress}%"></i></div>` : ""}
    </div>
    ${panel}
  </article>`;
}

function rowHTML(id, items) {
  const meta = ROW_META[id];
  return `
  <section class="row fx" id="${id}" data-group="${meta.group}" aria-labelledby="t-${id}">
    <h2 class="row-title" id="t-${id}">${meta.title}${id === "gallery" ? `<a class="row-link" href="${ROOT}gallery.html">Open full gallery <i class="fa-solid fa-angle-right"></i></a>` : ""}${id === "trek" ? `<a class="row-link" href="${ROOT}trekking.html">Open page <i class="fa-solid fa-angle-right"></i></a>` : ""}${id === "inspirations" ? `<a class="row-link" href="${ROOT}inspirations.html">Open page <i class="fa-solid fa-angle-right"></i></a>` : ""}</h2>
    <div class="row-wrap">
      <button class="arrow left" aria-label="Scroll ${meta.title} left" disabled><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroller" tabindex="-1">${items.map(it => cardHTML(it, { top10: id === "top10" })).join("")}</div>
      <button class="arrow right" aria-label="Scroll ${meta.title} right"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  </section>`;
}

let ROWS = {};
function renderRows(profileId, groups) {
  const host = $("#rows");
  const order = PROFILES[profileId].order.filter(id => groups ? groups.includes(ROW_META[id].group) : !["gallery", "inspirations", "trek"].includes(id));  /* these have their own pages */
  const listItems = [...myList].map(k => ITEMS[k]).filter(Boolean);

  let html = rowHTML("myList", listItems).replace('class="row fx"', `class="row fx${listItems.length ? "" : " hidden"}"`);
  const seen = new Set();
  order.forEach(id => {
    /* anchor targets for the nav's "Work" and "Journal" links */
    const g = ROW_META[id].group;
    if (!groups && (g === "work" || g === "journal") && !seen.has(g)) { html += `<span id="${g}"></span>`; seen.add(g); }
    html += rowHTML(id, ROWS[id]);
  });
  host.innerHTML = html;
  $$(".row", host).forEach(initScroller);
  initFadeIn();
}

function initScroller(rowEl) {
  const sc = $(".scroller", rowEl), l = $(".arrow.left", rowEl), r = $(".arrow.right", rowEl);
  const update = () => {
    l.disabled = sc.scrollLeft < 8;
    r.disabled = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 8;
  };
  const go = dir => sc.scrollBy({ left: dir * sc.clientWidth * 0.85, behavior: reduceMotion ? "auto" : "smooth" });
  l.addEventListener("click", () => go(-1));
  r.addEventListener("click", () => go(1));
  sc.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* One delegated handler for every card on the page (rows + search grid) */
function initCardEvents() {
  const handle = e => {
    const card = e.target.closest(".card");
    if (!card) return;
    const key = card.dataset.key;
    const btn = e.target.closest("[data-act]");
    const act = btn ? btn.dataset.act : "open";
    e.stopPropagation();
    if (act === "list") toggleSet(myList, "dm.list", key);
    else if (act === "like") toggleSet(likes, "dm.likes", key);
    else openModal(key, card);
  };
  document.addEventListener("click", e => { if (e.target.closest("#rows, #results")) handle(e); });
  document.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.classList.contains("card")) { e.preventDefault(); openModal(e.target.dataset.key, e.target); }
  });
}

function toggleSet(set, storeKey, key) {
  set.has(key) ? set.delete(key) : set.add(key);
  store.setJSON(storeKey, [...set]);
  const isList = storeKey === "dm.list";
  $$(`.card[data-key="${CSS.escape(key)}"] [data-act="${isList ? "list" : "like"}"]`).forEach(b => {
    const on = set.has(key);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
    if (isList) b.innerHTML = `<i class="fa-solid ${on ? "fa-check" : "fa-plus"}"></i>`;
  });
  if (isList) refreshMyList();
  syncModalButtons(key);
}

function refreshMyList() {
  const row = $("#myList");
  if (!row) return;
  const items = [...myList].map(k => ITEMS[k]).filter(Boolean);
  row.classList.toggle("hidden", !items.length);
  $(".scroller", row).innerHTML = items.map(it => cardHTML(it)).join("");
  initScroller(row);
}

/* 7. DETAIL MODAL ------------------------------------------------------------ */
let lastFocus = null;

function openModal(keyOrItem, trigger) {
  const it = typeof keyOrItem === "string" ? ITEMS[keyOrItem] : keyOrItem;
  if (!it) return;
  lastFocus = trigger || document.activeElement;
  const m = $("#modal");
  const on = k => (k === "list" ? myList.has(it.key) : likes.has(it.key));

  const banner = it.logo ? logoTile(it) : it.art ? lineArt(it.art, it.theme) : it.image
    ? `<img src="${asset(it.image)}" alt="${esc(it.title)}">`
    : `<div class="tile-icon" style="height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:linear-gradient(135deg, ${it.color || "#333"}, #111)"><i class="${it.brand ? "fa-brands" : "fa-solid"} ${it.icon || "fa-star"}"></i></div>`;

  if (it.galleryOnly) {
    m.innerHTML = `
      <button class="modal-close" aria-label="Close" data-close><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-img-only"><img src="${asset(it.full || it.image)}" alt="${esc(it.title)}"></div>
      <div class="modal-body"><div class="main full"><h2 id="modal-title" style="font-size:2rem">${esc(it.title)}</h2><div class="chips">${it.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div></div></div>`;
  } else {
    m.innerHTML = `
      <button class="modal-close" aria-label="Close" data-close><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-banner${it.logo ? " logo" : ""}">${banner}
        <div class="banner-in">
          <h2 id="modal-title">${esc(it.title)}</h2>
          <div class="hero-actions">
            ${it.link ? `<a class="btn btn-play" href="${ROOT}${it.link}"><i class="fa-solid fa-play"></i> ${esc(it.linkText || "Open")}</a>` : ""}
            ${it.download ? `<a class="btn btn-play" href="${ROOT}${it.download}" download><i class="fa-solid fa-download"></i> Download Resume (PDF)</a>` : ""}
            <button class="ctrl ${on("list") ? "on" : ""}" data-act="list" data-mk="${esc(it.key)}" aria-pressed="${on("list")}" aria-label="Add to My List"><i class="fa-solid ${on("list") ? "fa-check" : "fa-plus"}"></i></button>
            <button class="ctrl ${on("like") ? "on" : ""}" data-act="like" data-mk="${esc(it.key)}" aria-pressed="${on("like")}" aria-label="Like"><i class="fa-regular fa-thumbs-up"></i></button>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="main">
          <div class="meta-line"><span class="match">${it.match}% Match</span>${it.year ? `<span>${esc(it.year)}</span>` : ""}${it.dur ? `<span>${esc(it.dur)}</span>` : ""}<span class="age-badge">${esc(it.kind)}</span></div>
          ${it.paragraphs ? it.paragraphs.map(p => `<p>${esc(p)}</p>`).join("") : `<p>${esc(it.desc)}</p>`}
          ${it.result ? `<p><b style="color:#46d369">Result:</b> ${esc(it.result)}</p>` : ""}
          ${it.progress != null ? `<div class="ep-bar"><i style="width:${it.progress}%"></i></div><p style="font-size:.8rem;margin-top:.3rem">${esc(it.progressNote || "")}</p>` : ""}
          ${it.html ? `<div class="modal-story">${it.html}</div>` : ""}
        </div>
        <div class="side">
          ${it.cast && it.cast.length ? `<p><b>Cast:</b> ${it.cast.map(esc).join(", ")}</p>` : ""}
          ${it.tags && it.tags.length ? `<p><b>Genres:</b></p><div class="chips">${it.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
          ${it.extra || ""}
        </div>
        ${it.episodes && it.episodes.length ? `
        <div class="full">
          <h3 class="sec">${esc(it.epTitle || "Episodes")}</h3>
          <ol class="episodes">${it.episodes.map((e, i) => `<li><span class="n">${i + 1}</span><span class="tx">${esc(e)}</span></li>`).join("")}</ol>
        </div>` : ""}
      </div>`;
  }

  const back = $("#modal-back");
  back.classList.add("open");
  back.scrollTop = 0;
  document.body.classList.add("no-scroll");
  $("[data-close]", m).focus();
}

function closeModal() {
  const back = $("#modal-back");
  if (!back || !back.classList.contains("open")) return;
  back.classList.remove("open");
  document.body.classList.remove("no-scroll");
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function syncModalButtons(key) {
  $$(`#modal [data-mk="${CSS.escape(key)}"]`).forEach(b => {
    const isList = b.dataset.act === "list";
    const on = (isList ? myList : likes).has(key);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
    if (isList) b.innerHTML = `<i class="fa-solid ${on ? "fa-check" : "fa-plus"}"></i>`;
  });
}

function initModal() {
  const back = $("#modal-back");
  back.addEventListener("click", e => {
    if (e.target === back || e.target.closest("[data-close]")) return closeModal();
    const b = e.target.closest("[data-mk]");
    if (b) toggleSet(b.dataset.act === "list" ? myList : likes, b.dataset.act === "list" ? "dm.list" : "dm.likes", b.dataset.mk);
  });
  document.addEventListener("keydown", e => {
    if (!back.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {                       /* keep focus inside the dialog */
      const f = $$("a[href], button:not([disabled])", $("#modal"));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* 8. SEARCH ------------------------------------------------------------------ */
function runSearch(q) {
  q = q.trim().toLowerCase();
  const main = $("#home-main"), res = $("#results");
  if (!q) { res.classList.add("hidden"); main.classList.remove("hidden"); return; }
  const hits = Object.values(ITEMS).filter(it =>
    [it.title, it.kind, it.desc, ...(it.tags || [])].join(" ").toLowerCase().includes(q));
  main.classList.add("hidden");
  res.classList.remove("hidden");
  res.innerHTML = `<h2>${hits.length ? `Results for “${esc(q)}” (${hits.length})` : `No titles match “${esc(q)}”`}</h2>
    ${hits.length ? `<div class="grid">${hits.map(it => cardHTML(it)).join("")}</div>` : `<p class="empty">Try a skill, a place or a tag — e.g. Snowflake, Himalayas, Trekking.</p>`}`;
  window.scrollTo({ top: 0 });
}

/* 9. HOME-PAGE BOOT ---------------------------------------------------------- */
function showPicker() {
  const p = $("#picker");
  p.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  $(".profile-tile", p).focus();
}

function chooseProfile(id) {
  store.set("dm.profile", id);
  $("#picker").classList.add("hidden");
  document.body.classList.remove("no-scroll");
  setNavAvatar(id);
  renderRows(id);
  window.scrollTo({ top: 0 });
}

function initSplash(done) {
  const sp = $("#splash");
  if (!sp || session.get("dm.splash") || reduceMotion) { sp && sp.remove(); return done(); }
  session.set("dm.splash", "1");
  document.body.classList.add("no-scroll");
  let finished = false;
  const finish = () => {
    if (finished) return; finished = true;
    sp.classList.add("leaving");
    setTimeout(() => { sp.remove(); done(); }, 600);
  };
  setTimeout(finish, 2400);
  sp.addEventListener("click", finish);
  document.addEventListener("keydown", finish, { once: true });
}

function initHome() {
  ROWS = buildRows();
  reg({ key: "bio", kind: "About", title: "T Devamani Raju", image: "assets/images/profile/profile.jpg",
        tags: ["Data Engineer", "Traveler", "Trekker", "Photographer"], year: "2026", dur: "Portfolio", paragraphs: bio.paragraphs,
        cast: ["Snowflake", "SQL", "Airflow", "Talend"], episodes: [], download: bio.resume, link: "resume.html", linkText: "View full resume" });
  delete ITEMS.bio.galleryOnly;

  initModal();
  initCardEvents();

  /* Hero buttons */
  $("#hero-play").addEventListener("click", e => {
    e.preventDefault();
    $("#journey").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
  $("#hero-info").addEventListener("click", e => openModal("bio", e.currentTarget));

  /* Picker tiles */
  $$(".profile-tile").forEach(t => t.addEventListener("click", () => chooseProfile(t.dataset.profile)));

  const params = new URLSearchParams(location.search);
  const saved = getProfileId();
  renderRows(saved || "engineer");

  const afterSplash = () => {
    if (params.has("pick") || !saved) showPicker();
    const q = params.get("q");
    if (q) { $("#nav-search").classList.add("open"); $("#search-input").value = q; runSearch(q); }
    if (location.hash) setTimeout(() => { const t = $(CSS.escape ? "#" + CSS.escape(location.hash.slice(1)) : location.hash); t && t.scrollIntoView(); }, 50);
  };
  initSplash(afterSplash);
  initFadeIn();
}

/* 9b. WORK / JOURNAL PAGES ------------------------------------------------
   Same rows as the home page, filtered to one group. */
function initRowsPage(groups) {
  ROWS = buildRows();
  initModal();
  initCardEvents();
  renderRows(getProfileId() || "engineer", groups);
  if (location.hash) setTimeout(() => { const t = document.getElementById(location.hash.slice(1)); t && t.scrollIntoView(); }, 80);
}

/* 10. CONTACT PAGE ("Get Started" email form) ------------------------------- */
function initContactForm() {
  const quick = $("#get-started"), form = $("#contact-form");
  if (!quick || !form) return;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TO = "devamaniraju.talabhatla@ibexlabs.com";

  /* Hero "Get Started": carry the email into the full form and jump to it */
  quick.addEventListener("submit", e => {
    e.preventDefault();
    const v = $("#gs-email").value.trim();
    if (v) $("#cf-email").value = v;
    $("#contact-form-section").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => $(v ? "#cf-name" : "#cf-email").focus({ preventScroll: true }), 500);
  });

  /* Live character counter */
  const msgBox = $("#cf-message"), count = $("#cf-count");
  msgBox.addEventListener("input", () => { count.textContent = `${msgBox.value.length} / 1000`; });

  /* Validation + send. mailto keeps the site fully static; to use Formspree,
     replace the location.href line with a fetch() POST to your endpoint. */
  const out = $("#cf-msg");
  const flag = (id, bad) => $("#" + id).closest(".field").classList.toggle("invalid", bad);
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#cf-name").value.trim(), email = $("#cf-email").value.trim(), msg = msgBox.value.trim();
    flag("cf-name", !name); flag("cf-email", !EMAIL_RE.test(email)); flag("cf-message", !msg);
    if (!name || !EMAIL_RE.test(email) || !msg) {
      out.style.color = "#ff6b6b"; out.textContent = "Please fill in your name, a valid email and a message.";
      return;
    }
    const topic = (form.querySelector("[name=topic]:checked") || {}).value || "Hello";
    const subject = $("#cf-subject").value.trim() || topic;
    const body = `${msg}\n\n— ${name}\n${email}`;
    out.style.color = "#46d369"; out.textContent = "Opening your email app…";
    location.href = `mailto:${TO}?subject=${encodeURIComponent(`[${topic}] ${subject}`)}&body=${encodeURIComponent(body)}`;
  });

  /* Copy-to-clipboard buttons on the info cards */
  $$(".copy").forEach(btn => btn.addEventListener("click", async e => {
    e.preventDefault(); e.stopPropagation();
    try { await navigator.clipboard.writeText(btn.dataset.copy); } catch (err) { return; }
    btn.classList.add("done"); btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => { btn.classList.remove("done"); btn.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 1500);
  }));
}

/* 9c. GALLERY PAGE ----------------------------------------------------------
   Two collections (Photography vs Travel & Memories), filter chips, and a
   lightbox with prev/next, arrow keys, Esc and swipe. */
function initGalleryPage() {
  const all = galleryImages.map((g, i) => ({ ...g, i }));
  const sets = {
    photography: all.filter(g => g.category === "Photography"),
    trips: all.filter(g => g.category !== "Photography"),
    all
  };
  const LOCKED = ["trips", "all"];
  function paintCounts() {
    const open = galUnlocked();
    Object.entries(sets).forEach(([k, v]) => {
      const locked = !open && LOCKED.includes(k);
      const n = $("#n-" + k), btn = $("#tab-" + (k === "photography" ? "photography" : k));
      n.textContent = locked ? "" : v.length;
      n.classList.toggle("lock", locked);
      if (locked) n.innerHTML = '<i class="fa-solid fa-lock" aria-hidden="true"></i>';
      btn.classList.toggle("is-locked", locked);
    });
    $("#g-total").textContent = open ? `${all.length} photos` : `${sets.photography.length} photos`;
  }
  paintCounts();

  let tab = "photography", filter = "All", shown = [];
  const grid = $("#g-grid"), chips = $("#g-filters");

  /* origin = {x, y}: screen point of the clicked chip/tab. Photos fly out of it into place. */
  const centerOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  function render(origin) {
    const pool = sets[tab];
    /* Photography filters by style (caption); the others by category */
    const keyOf = g => (tab === "photography" ? g.caption : g.category);
    const keys = ["All", ...new Set(pool.map(keyOf))];
    if (!keys.includes(filter)) filter = "All";
    chips.innerHTML = keys.map((k, c) => `<button type="button" class="chip-btn${k === filter ? " on" : ""}" style="--c:${c}" data-f="${esc(k)}" aria-pressed="${k === filter}">${esc(k)}</button>`).join("");
    shown = pool.filter(g => filter === "All" || keyOf(g) === filter);
    grid.innerHTML = shown.map((g, n) => `
      <button type="button" class="g-item" data-n="${n}" style="--n:${n}" aria-label="Open photo: ${esc(g.caption)}">
        <img src="${asset(thumbOf(g.src))}" alt="${esc(g.caption)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${asset(g.src)}'">
        <span class="g-cap"><strong>${esc(g.caption)}</strong><small>${esc(g.category)}</small></span>
      </button>`).join("");
    if (origin && !reduceMotion) {
      $$(".g-item", grid).forEach((el, n) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--fx", (origin.x - (r.left + r.width / 2)).toFixed(0) + "px");
        el.style.setProperty("--fy", (origin.y - (r.top + r.height / 2)).toFixed(0) + "px");
        el.style.setProperty("--fr", ((n % 2 ? 1 : -1) * (6 + (n % 5) * 3)) + "deg");
      });
    }
  }

  $$(".g-tabs [data-tab]").forEach(b => b.addEventListener("click", async () => {
    if (LOCKED.includes(b.dataset.tab) && !galUnlocked()) {
      if (!(await askGalleryPassword())) return;
      paintCounts();
    }
    tab = b.dataset.tab; filter = "All";
    $$(".g-tabs [data-tab]").forEach(x => x.setAttribute("aria-selected", x === b));
    render(centerOf(b));
  }));
  chips.addEventListener("click", e => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    const o = centerOf(b);
    filter = b.dataset.f; render(o);
  });

  /* ---- Lightbox ---- */
  const lb = $("#lightbox"), img = $("#lb-img");
  let cur = 0, opener = null;
  const show = n => {
    cur = (n + shown.length) % shown.length;
    const g = shown[cur];
    img.src = asset(g.src); img.alt = g.caption;
    img.classList.remove("pop"); void img.offsetWidth; img.classList.add("pop");
    $("#lb-cap").textContent = g.caption;
    $("#lb-meta").textContent = `${g.category} · ${cur + 1} / ${shown.length}`;
  };
  const open = (n, trigger) => {
    opener = trigger; show(n);
    lb.classList.add("open"); document.body.classList.add("no-scroll");
    $("[data-lb=close]", lb).focus();
  };
  const close = () => {
    if (!lb.classList.contains("open")) return;
    lb.classList.remove("open"); document.body.classList.remove("no-scroll");
    if (opener) opener.focus();
  };

  grid.addEventListener("click", e => {
    const b = e.target.closest(".g-item"); if (b) open(+b.dataset.n, b);
  });

  /* gentle tilt that follows the cursor (one transform write per frame) */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    let tiltEl = null, tx = 0, ty = 0, raf = 0;
    const paint = () => {
      raf = 0; if (!tiltEl) return;
      tiltEl.style.setProperty("--ry", (tx * 10).toFixed(1) + "deg");
      tiltEl.style.setProperty("--rx", (-ty * 10).toFixed(1) + "deg");
    };
    grid.addEventListener("pointermove", e => {
      const b = e.target.closest(".g-item"); if (!b) return;
      const r = b.getBoundingClientRect();
      tiltEl = b; tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(paint);
    });
    grid.addEventListener("pointerout", e => {
      const b = e.target.closest(".g-item"); if (!b || b.contains(e.relatedTarget)) return;
      b.style.removeProperty("--rx"); b.style.removeProperty("--ry");
      if (tiltEl === b) tiltEl = null;
    });
  }
  lb.addEventListener("click", e => {
    const a = e.target.closest("[data-lb]");
    if (a) { const k = a.dataset.lb; k === "close" ? close() : show(cur + (k === "next" ? 1 : -1)); }
    else if (e.target === lb) close();
  });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(cur + 1);
    if (e.key === "ArrowLeft") show(cur - 1);
  });
  let x0 = null;                                   /* swipe on touch screens */
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });

  render();
  if (location.hash === "#trips" || location.hash === "#all") $(`[data-tab="${location.hash.slice(1)}"]`).click();
}

/* 9d. INSPIRATIONS PAGE -----------------------------------------------------
   Large story cards built from inspirationsList (js/content.js). Clicking a
   card opens the detail modal, which links to the full story page. */
function initInspirationsPage() {
  ROWS = buildRows();
  initModal();
  initCardEvents();
  $("#rows").innerHTML = `
    <div class="insp-grid">
      ${ROWS.inspirations.map(it => `
      <article class="insp-card fx card" tabindex="0" data-key="${esc(it.key)}" aria-label="${esc(it.title)}">
        <div class="insp-img"><img src="${asset(it.image)}" alt="${esc(it.title)}" loading="lazy"></div>
        <div class="insp-body">
          <span class="match">${it.match}% Match</span>
          <h2>${esc(it.title)}</h2>
          <p>${esc(it.desc)}</p>
          <div class="chips">${it.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
          <a class="btn btn-play" href="${ROOT}${it.link}" onclick="event.stopPropagation()"><i class="fa-solid fa-play"></i> Read the story</a>
        </div>
      </article>`).join("")}
    </div>`;
  initFadeIn();
}

/* 9e. TREKKING PAGE ----------------------------------------------------------
   One card per trek (trekkingStories in data.js) with its key stats. */
function initTrekkingPage() {
  ROWS = buildRows();
  initModal();
  initCardEvents();
  $("#t-count").textContent = `${trekkingStories.length} treks`;
  const stat = (icon, label, val) => `<li><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span><strong>${esc(val)}</strong></li>`;
  $("#rows").innerHTML = `
    <div class="trek-grid">
      ${trekkingStories.map(t => {
        const it = ITEMS["tk-" + t.id];
        return `
      <article class="trek-card fx card" tabindex="0" data-key="${esc(it.key)}" aria-label="${esc(t.title)}">
        <div class="trek-img">${t.art ? lineArt(t.art, t.theme) : `<img src="${asset(t.image)}" alt="${esc(t.title)}" loading="lazy">`}
          <span class="diff">${esc(t.difficulty)}</span>${t.status ? `<span class="diff plan">${esc(t.status)}</span>` : ""}</div>
        <div class="trek-body">
          <div class="meta-line"><span class="match">${it.match}% Match</span><span>${esc(t.date)}</span><span>${esc(t.location)}</span></div>
          <h2>${esc(t.title)}</h2>
          <p>${esc(t.description)}</p>
          <ul class="trek-stats">
            ${stat("fa-ruler", "Distance", t.distance)}
            ${stat("fa-clock", "Duration", t.duration)}
            ${stat("fa-mountain", "Altitude", t.altitude)}
          </ul>
          <div class="chips">${t.tags.map(x => `<span class="chip">${esc(x)}</span>`).join("")}</div>
          <a class="btn btn-play" href="${ROOT}${t.storyPage}" onclick="event.stopPropagation()"><i class="fa-solid fa-play"></i> Read the trek diary</a>
        </div>
      </article>`;
      }).join("")}
    </div>`;
  initFadeIn();
}

/* BOOT ------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initChrome();
  initContactForm();
  if (PAGE === "home") initHome();
  else if (PAGE === "work") initRowsPage(["work"]);
  else if (PAGE === "gallery") initGalleryPage();
  else if (PAGE === "inspirations") initInspirationsPage();
  else if (PAGE === "trekking") initTrekkingPage();
  else initFadeIn();
});

/* 11. SITE-WIDE TRANSITIONS --------------------------------------------------
   page enter/leave fade, scroll-progress bar, and staggered scroll reveals
   for every page (cards, sections, story blocks, forms). */
(function () {
  const bar = document.createElement("div");
  bar.className = "pg-progress"; bar.setAttribute("aria-hidden", "true");
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(bar);
    const upd = () => {
      const m = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${m > 0 ? Math.min(1, scrollY / m) : 0})`;
    };
    addEventListener("scroll", upd, { passive: true }); upd();

    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const SEL = ["main > section", "main .section", ".story-body > h2", ".story-body > p", ".story-body .info-box", ".story-body .day-block", ".story-body .quick-facts",
      ".story-body .map-placeholder", ".story-nav", ".insp-card", ".season", ".info-card", ".glass-form", ".contact-side > *", ".split > *", ".v-section h2",
      ".about-wrap > h2", ".about-wrap .summary", ".cast", ".faq details", ".story-gallery img", ".band"].join(",");
    const els = Array.from(document.querySelectorAll(SEL)).filter(e => !e.closest(".fx, .dv-rv, .dv-sec, .dv-head, .dv-rm, .dv-pal") && !e.matches(".fx, .dv-rv, .reveal"));
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("pg-in"); io.unobserve(en.target); } }), { threshold: .08, rootMargin: "0px 0px -4% 0px" });
    els.forEach(e => {
      const sib = Array.from(e.parentElement.children).indexOf(e);
      e.style.setProperty("--pd", Math.min(sib, 6) * 70 + "ms");
      e.classList.add("pg-rv"); io.observe(e);
    });
  });

  /* fade out before following an internal link */
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || !/\.html$|\/$/.test(u.pathname) || reduceMotion || document.documentElement.classList.contains("cine-on")) return;  /* cinematic layer runs its own curtain */
    e.preventDefault();
    document.body.classList.add("pg-leave");
    setTimeout(() => { location.href = a.href; }, 240);
  });
  addEventListener("pageshow", e => { if (e.persisted) document.body.classList.remove("pg-leave"); });
})();

/* 12a. CINEMATIC LAYER (assets/cine): 3D scene, smooth scroll, page curtain. Falls back to the plain site if it fails to load. */
(function () {
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = ROOT + "assets/cine/cine.css?v=20261203"; document.head.appendChild(l);
  const s = document.createElement("script"); s.type = "module"; s.src = ROOT + "assets/cine/cine.js?v=20261203"; document.head.appendChild(s);
})();

/* 12. CHAT ASSISTANT (js/chat.js) */
(function () { const s = document.createElement("script"); s.src = ROOT + "js/chat.js?v=20261148"; s.defer = true; document.head.appendChild(s); })();
