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
function reg(item) { item.match = matchFor(item.key); ITEMS[item.key] = item; return item; }

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
      key: "p-" + p.id, kind: "Project", title: p.title, image: p.image, tags: p.tags, dur: p.duration, year: p.duration.match(/\d{4}/)?.[0] || "",
      desc: `${p.problem} ${p.solution}`, cast: p.tags, episodes: p.responsibilities,
      result: res.startsWith("[") ? "[EDIT] Add a measurable result" : res,
      extra: `<p><b>Client</b><br>${esc(p.client)}</p><p><b>Role</b><br>${esc(p.role)}</p>`
    });
  });

  rows.top10 = topTen.map((t, i) => reg({
    key: t.id, kind: "Top 10", title: t.title, icon: t.icon, brand: t.brand, color: t.color, tags: t.tags,
    rank: i + 1, desc: t.desc, year: "Rank #" + (i + 1), dur: "Data Engineering", cast: t.tags, episodes: []
  }));

  rows.continue = continueWatching.map(c => reg({
    key: c.id, kind: "In progress", title: c.title, image: c.image, tags: c.tags, progress: c.progress,
    progressNote: `${c.progress}% watched`, year: "Now", dur: "Ongoing", desc: c.desc, cast: c.tags, episodes: []
  }));

  rows.vihara = viharaOriginals.map(v => reg({
    key: v.id, kind: "ViharaSetu", title: v.title, image: v.image, icon: v.icon, tags: v.tags, label: "VIHARASETU ORIGINAL",
    year: "2026", dur: "Since 20 Feb 2026", desc: v.desc, cast: ["T Devamani Raju", "Sateesh R", "Devi K"],
    link: "viharasetu.html", linkText: "Visit ViharaSetu"
  }));

  rows.travel = travelStories.map(t => reg({
    key: "tr-" + t.id, kind: "Travel", title: t.title, image: t.image, tags: t.tags, year: t.date, dur: t.location, desc: t.description,
    cast: ["Companions: [EDIT]"], episodes: ["Day 1 – [EDIT]", "Day 2 – [EDIT]", "Day 3 – [EDIT]"],
    link: t.storyPage, linkText: "Read the full story"
  }));

  rows.trek = trekkingStories.map(t => reg({
    key: "tk-" + t.id, kind: "Trekking", title: t.title, image: t.image, tags: t.tags, year: t.date, dur: t.duration, desc: t.description,
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

  rows.gallery = galleryImages.map((g, i) => reg({
    key: "g-" + i, kind: "Gallery", title: g.caption, image: g.src, tags: [g.category], year: "Photo", dur: g.category,
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
  continue:     { title: "Continue Watching", group: "work" },
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
    order: ["career", "projects", "skills", "top10", "continue", "vihara", "travel", "trek", "life", "inspirations", "gallery"] },
  engineer:  { name: "Data Engineer", sub: "Skills & Top 10 first", icon: "fa-database", cls: "av-engineer",
    order: ["skills", "top10", "projects", "career", "continue", "vihara", "travel", "trek", "life", "inspirations", "gallery"] },
  traveler:  { name: "Traveler", sub: "Travel & Trekking first", icon: "fa-mountain-sun", cls: "av-traveler",
    order: ["travel", "trek", "gallery", "life", "inspirations", "vihara", "continue", "skills", "career", "projects", "top10"] },
  vihara:    { name: "ViharaSetu", sub: "Originals first", icon: "fa-bridge", cls: "av-vihara",
    order: ["vihara", "travel", "trek", "gallery", "life", "inspirations", "projects", "career", "skills", "top10", "continue"] }
};
const getProfileId = () => { const p = store.get("dm.profile"); return PROFILES[p] ? p : null; };

/* 4. HEADER / FOOTER CHROME ----------------------------------------------- */
const SOCIAL = [
  { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "https://www.linkedin.com/in/tdevamani/" },
  { icon: "fa-brands fa-github", label: "GitHub", href: "https://github.com/manirajdeva" },
  { icon: "fa-brands fa-instagram", label: "Instagram", href: "https://instagram.com/maniraj_deva" },
  { icon: "fa-brands fa-youtube", label: "YouTube", href: "https://www.youtube.com/@Travel_with_devaratha" }
];

function headerHTML() {
  const p = PROFILES[getProfileId() || "engineer"];
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <nav class="site-nav" aria-label="Main">
    <a href="${ROOT}index.html" class="wordmark" aria-label="DEVAMANI — home">DEVAMANI</a>
    <div class="nav-links" id="nav-links">
      <a href="${ROOT}index.html" data-nav="home">Home</a>
      <a href="${ROOT}work.html" data-nav="work">Work</a>
      <a href="${ROOT}journal.html" data-nav="journal">Journal</a>
      <a href="${ROOT}gallery.html" data-nav="gallery">Gallery</a>
      <a href="${ROOT}trekking.html" data-nav="trekking">Trekking</a>
      <a href="${ROOT}inspirations.html" data-nav="inspirations">Inspirations</a>
      <a href="${ROOT}viharasetu.html" data-nav="vihara">ViharaSetu</a>
      <a href="${ROOT}contact.html" data-nav="contact">Contact</a>
    </div>
    <div class="nav-right">
      <div class="nav-search" id="nav-search" role="search">
        <button class="nav-icon" id="search-toggle" aria-label="Search" aria-expanded="false"><i class="fa-solid fa-magnifying-glass"></i></button>
        <input type="search" id="search-input" placeholder="Titles, tags, places" aria-label="Search titles or tags" autocomplete="off">
      </div>
      <div class="profile-menu" id="profile-menu">
        <button class="profile-btn" id="profile-btn" aria-haspopup="true" aria-expanded="false" aria-label="Profile menu">
          <span class="avatar-sm ${p.cls}" id="nav-avatar"><i class="fa-solid ${p.icon}"></i></span>
          <i class="fa-solid fa-caret-down caret"></i>
        </button>
        <div class="dropdown" id="profile-dropdown">
          <button type="button" id="switch-profile"><i class="fa-solid fa-repeat"></i> Switch profile</button>
          <a href="${ROOT}resume.html"><i class="fa-solid fa-file-lines"></i> Resume</a>
          <a href="${ROOT}contact.html"><i class="fa-solid fa-envelope"></i> Contact</a>
        </div>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><i class="fa-solid fa-bars"></i></button>
    </div>
  </nav>`;
}

function footerHTML() {
  const col = (title, links) => `<div><h4>${title}</h4><ul>${links.map(([t, h, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a></li>`).join("")}</ul></div>`;
  return `
  <footer class="site-footer">
    <div class="footer-in">
      <div class="footer-brand"><span class="wordmark">DEVAMANI</span></div>
      <div class="footer-social">${SOCIAL.map(s => `<a href="${s.href}" aria-label="${s.label}" target="_blank" rel="noopener"><i class="${s.icon}"></i></a>`).join("")}</div>
      <div class="footer-cols">
        ${col("Work", [["Career", ROOT + "work.html#career"], ["Projects", ROOT + "work.html#projects"], ["Skills", ROOT + "work.html#skills"], ["Resume", ROOT + "resume.html"]])}
        ${col("Journal", [["Travel", ROOT + "journal.html#travel"], ["Trekking", ROOT + "trekking.html"], ["Life Stories", ROOT + "journal.html#life"], ["My Inspirations", ROOT + "inspirations.html"], ["Gallery", ROOT + "gallery.html"]])}
        ${col("ViharaSetu", [["About ViharaSetu", ROOT + "viharasetu.html"], ["viharasetu.co.in", "https://viharasetu.co.in", true], ["info@viharasetu.co.in", "mailto:info@viharasetu.co.in"], ["Contact", ROOT + "contact.html"]])}
        ${col("Social", SOCIAL.map(s => [s.label, s.href, true]))}
      </div>
      <div class="footer-bottom">&copy; 2026 T Devamani Raju. All rights reserved.</div>
    </div>
  </footer>`;
}

let PAGE_NAV = "";
function initChrome() {
  const h = $("#site-header"), f = $("#site-footer");
  if (h) h.outerHTML = headerHTML();
  if (f) f.outerHTML = footerHTML();

  const nav = $(".site-nav");
  const onScroll = () => {
    nav.classList.toggle("solid", window.scrollY > 40);
    const hb = $(".hero-bg");
    if (hb && !reduceMotion && window.scrollY < window.innerHeight) hb.style.setProperty("--parallax", `${window.scrollY * 0.18}px`);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Highlight the current page in the nav */
  if (location.pathname.includes("/inspirations/")) PAGE_NAV = "inspirations";
  if (/-trek\.html$/.test(location.pathname)) PAGE_NAV = "trekking";
  const here = PAGE_NAV || { home: "home", work: "work", journal: "journal", gallery: "gallery", inspirations: "inspirations", trekking: "trekking", resume: "work", contact: "contact", vihara: "vihara", story: "journal" }[PAGE];
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

  /* Profile dropdown */
  const menu = $("#profile-menu"), btn = $("#profile-btn");
  const setDrop = open => { menu.classList.toggle("open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", e => { e.stopPropagation(); setDrop(!menu.classList.contains("open")); });
  document.addEventListener("click", e => { if (!menu.contains(e.target)) setDrop(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setDrop(false); setMenu(false); } });

  $("#switch-profile").addEventListener("click", () => {
    setDrop(false);
    if (PAGE === "home") showPicker(); else location.href = ROOT + "index.html?pick=1";
  });

  /* Search toggle (home filters in place; other pages redirect to home) */
  const box = $("#nav-search"), input = $("#search-input"), tgl = $("#search-toggle");
  const setSearch = open => {
    box.classList.toggle("open", open);
    tgl.setAttribute("aria-expanded", open);
    if (open) input.focus(); else { input.value = ""; if (PAGE === "home") runSearch(""); }
  };
  tgl.addEventListener("click", () => setSearch(!box.classList.contains("open")));
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") setSearch(false);
    if (e.key === "Enter" && PAGE !== "home") location.href = `${ROOT}index.html?q=${encodeURIComponent(input.value)}`;
  });
  if (PAGE === "home") input.addEventListener("input", () => runSearch(input.value));
}

/* Update avatar in the nav after a profile change */
function setNavAvatar(id) {
  const p = PROFILES[id]; const av = $("#nav-avatar");
  if (!p || !av) return;
  av.className = `avatar-sm ${p.cls}`;
  av.innerHTML = `<i class="fa-solid ${p.icon}"></i>`;
}

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

function thumbHTML(it) {
  if (it.image) return `<img src="${asset(it.image)}" alt="${esc(it.title)}" loading="lazy" decoding="async">`;
  return `<div class="tile-icon" style="background:linear-gradient(135deg, ${it.color || "#333"}, #111)">
            <i class="${it.brand ? "fa-brands" : "fa-solid"} ${it.icon || "fa-star"}" aria-hidden="true"></i><span>${esc(it.cap ? it.cap.split("·")[0] : it.title)}</span></div>`;
}

function cardHTML(it, opts = {}) {
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
      ${opts.top10 || !(it.image || it.cap) ? "" : `<div class="cap">${esc(it.cap || it.title)}</div>`}
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

  const banner = it.image
    ? `<img src="${asset(it.image)}" alt="${esc(it.title)}">`
    : `<div class="tile-icon" style="height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:linear-gradient(135deg, ${it.color || "#333"}, #111)"><i class="${it.brand ? "fa-brands" : "fa-solid"} ${it.icon || "fa-star"}"></i></div>`;

  if (it.galleryOnly) {
    m.innerHTML = `
      <button class="modal-close" aria-label="Close" data-close><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-img-only"><img src="${asset(it.image)}" alt="${esc(it.title)}"></div>
      <div class="modal-body"><div class="main full"><h2 id="modal-title" style="font-size:2rem">${esc(it.title)}</h2><div class="chips">${it.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div></div></div>`;
  } else {
    m.innerHTML = `
      <button class="modal-close" aria-label="Close" data-close><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-banner">${banner}
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
          <h3 class="sec">Episodes</h3>
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
  Object.entries(sets).forEach(([k, v]) => { $("#n-" + k).textContent = v.length; });
  $("#g-total").textContent = `${all.length} photos`;

  let tab = "photography", filter = "All", shown = [];
  const grid = $("#g-grid"), chips = $("#g-filters");

  function render() {
    const pool = sets[tab];
    /* Photography filters by style (caption); the others by category */
    const keyOf = g => (tab === "photography" ? g.caption : g.category);
    const keys = ["All", ...new Set(pool.map(keyOf))];
    if (!keys.includes(filter)) filter = "All";
    chips.innerHTML = keys.map(k => `<button type="button" class="chip-btn${k === filter ? " on" : ""}" data-f="${esc(k)}" aria-pressed="${k === filter}">${esc(k)}</button>`).join("");
    shown = pool.filter(g => filter === "All" || keyOf(g) === filter);
    grid.innerHTML = shown.map((g, n) => `
      <button type="button" class="g-item" data-n="${n}" aria-label="Open photo: ${esc(g.caption)}">
        <img src="${asset(g.src)}" alt="${esc(g.caption)}" loading="lazy" decoding="async">
        <span class="g-cap"><strong>${esc(g.caption)}</strong><small>${esc(g.category)}</small></span>
      </button>`).join("");
  }

  $$(".g-tabs [data-tab]").forEach(b => b.addEventListener("click", () => {
    tab = b.dataset.tab; filter = "All";
    $$(".g-tabs [data-tab]").forEach(x => x.setAttribute("aria-selected", x === b));
    render();
  }));
  chips.addEventListener("click", e => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    filter = b.dataset.f; render();
  });

  /* ---- Lightbox ---- */
  const lb = $("#lightbox"), img = $("#lb-img");
  let cur = 0, opener = null;
  const show = n => {
    cur = (n + shown.length) % shown.length;
    const g = shown[cur];
    img.src = asset(g.src); img.alt = g.caption;
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
        <div class="trek-img"><img src="${asset(t.image)}" alt="${esc(t.title)}" loading="lazy">
          <span class="diff">${esc(t.difficulty)}</span></div>
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
  else if (PAGE === "journal") initRowsPage(["journal"]);
  else if (PAGE === "gallery") initGalleryPage();
  else if (PAGE === "inspirations") initInspirationsPage();
  else if (PAGE === "trekking") initTrekkingPage();
  else initFadeIn();
});
