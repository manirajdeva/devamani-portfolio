/* dev.js - home + work pages for the developer-style portfolio.
   Reads the same content as before (data.js / content.js) and renders:
   hero with live "editor", toolbox, experience as a git log, projects as repos,
   side quests, contact. A README-style panel opens for projects and tools. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var decode = function (s) { var d = document.createElement("textarea"); d.innerHTML = s; return d.value; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ROOT = document.body.dataset.root || "";
  var PAGE = document.body.dataset.page;
  if (PAGE !== "devhome" && PAGE !== "devwork") return;

  var hash = function (s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0").slice(0, 7); };
  var sec = function (id, path, title, sub, body) {
    return '<section class="dv-sec" id="' + id + '"><div class="dv-wrap"><header class="dv-sh dv-rv"><span class="dv-path">' + path + '</span><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : "") + '</header>' + body + '</section>'.replace("</section>", "</div></section>");
  };

  /* ---------- hero ---------- */
  var CODE = [
    [["k", "const "], ["v", "engineer"], ["p", " = {"]],
    [["i", "  name"], ["p", ": "], ["s", '"T Devamani Raju"'], ["p", ","]],
    [["i", "  role"], ["p", ": "], ["s", '"Senior Software Engineer"'], ["p", ","]],
    [["i", "  focus"], ["p", ": ["], ["s", '"Data Engineering"'], ["p", ", "], ["s", '"Snowflake"'], ["p", ", "], ["s", '"ETL"'], ["p", "],"]],
    [["i", "  stack"], ["p", ": ["], ["s", '"SQL"'], ["p", ", "], ["s", '"Talend"'], ["p", ", "], ["s", '"Airflow"'], ["p", ", "], ["s", '"dbt"'], ["p", ", "], ["s", '"AWS S3"'], ["p", "],"]],
    [["i", "  certified"], ["p", ": "], ["s", '"Snowflake SnowPro Core"'], ["p", ","]],
    [["i", "  award"], ["p", ": "], ["s", '"Best Employee 2025–26"'], ["p", ","]],
    [["i", "  location"], ["p", ": "], ["s", '"Bengaluru, India"'], ["p", ","]],
    [["i", "  building"], ["p", ": ["], ["s", '"ViharaSetu"'], ["p", "],"]],
    [["i", "  offDuty"], ["p", ": ["], ["s", '"trekking"'], ["p", ", "], ["s", '"travel"'], ["p", ", "], ["s", '"photography"'], ["p", "],"]],
    [["i", "  openToWork"], ["p", ": "], ["b", "false"], ["p", ","]],
    [["p", "};"]]
  ];
  var codeLine = function (parts, n) { return '<div class="cl" style="--n:' + n + '"><span class="ln">' + (n + 1) + '</span><span class="tx">' + parts.map(function (p) { return '<span class="t-' + p[0] + '">' + esc(p[1]) + "</span>"; }).join("") + "</span></div>"; };

  var jl = function (key, list, last) { var parts = [["p", "  "], ["i", '"' + key + '"'], ["p", ": ["]]; list.forEach(function (x, i) { parts.push(["s", '"' + x + '"']); if (i < list.length - 1) parts.push(["p", ", "]); }); parts.push(["p", "]" + (last ? "" : ",")]); return parts; };
  var STACK = [
    [["p", "{"]],
    jl("languages", ["SQL", "Python", "JavaScript"]),
    jl("warehouse", ["Snowflake"]),
    jl("ingestion", ["Snowpipe", "COPY", "AWS S3"]),
    jl("transform", ["SQL procs", "Tasks", "dbt"]),
    jl("etl", ["Talend", "Informatica"]),
    jl("orchestration", ["Airflow"]),
    jl("reporting", ["Tableau"]),
    jl("practices", ["CDC", "validation", "tuning"], true),
    [["p", "}"]]
  ];
  var README = [
    [["k", "# "], ["v", "T Devamani Raju"]],
    [["t", " "]],
    [["p", "> "], ["s", "Senior software engineer, data platforms."]],
    [["t", " "]],
    [["k", "## "], ["v", "What I do"]],
    [["p", "- "], ["t", "Build Snowflake pipelines for banking data"]],
    [["p", "- "], ["t", "Write SQL, stored procedures and Talend jobs"]],
    [["p", "- "], ["t", "Monitor and support Airflow workflows"]],
    [["t", " "]],
    [["k", "## "], ["v", "Beyond work"]],
    [["p", "- "], ["t", "Co-founder of ViharaSetu (travel venture)"]],
    [["p", "- "], ["t", "Trekker: next up, Annapurna Base Camp"]],
    [["p", "- "], ["t", "Photography and storytelling"]],
    [["t", " "]],
    [["k", "## "], ["v", "Say hello"]],
    [["p", "mail: "], ["s", "tmaniraj1111@gmail.com"], ["p", "]"]]
  ];
  var pane = function (rows, name, cursorText) { return '<div class="ide-pane' + (name === "profile.ts" ? " on" : "") + '" data-pane="' + name + '">' + rows.map(codeLine).join("") + '<div class="cl cur"><span class="ln">' + (rows.length + 1) + '</span><span class="tx"><span class="t-c">' + cursorText + '</span><span class="caret"></span></span></div></div>'; };
  function heroHTML() {
    var b = typeof bio !== "undefined" ? bio : null;
    return '<section class="dh-hero"><div class="dv-wrap dh-grid">' +
      '<div class="dh-copy">' +
        '<span class="dv-pill"><i></i> Based in Bengaluru, India</span>' +
        '<h1>Hi, I’m <span class="grad">T Devamani Raju</span>.<br>I build <span class="dh-type" id="dh-type" aria-live="off">data platforms</span><span class="dh-caret"></span></h1>' +
        '<p class="dh-lead">Senior software engineer with 5+ years across modern data platforms &mdash; Snowflake, SQL, Talend and Airflow. Right now I’m turning banking data into reliable pipelines at Ibexlabs, and co-founding <a href="https://www.viharasetu.co.in" target="_blank" rel="noopener">ViharaSetu</a> on the side. Weekends belong to the mountains.</p>' +
        '<div class="dh-cta"><a class="dv-btn pri" href="' + ROOT + 'work.html#projects"><i class="fa-solid fa-code-branch"></i> View projects</a><a class="dv-btn" href="' + ROOT + 'resume.html"><i class="fa-solid fa-file-arrow-down"></i> Resume</a><a class="dv-btn ghost" href="' + ROOT + 'contact.html"><i class="fa-solid fa-paper-plane"></i> Let’s talk</a></div>' +
        '<div class="dh-soc">' + SOCIAL.map(function (s) { return '<a href="' + s.href + '" aria-label="' + s.label + '" target="_blank" rel="noopener"><i class="' + s.icon + '"></i></a>'; }).join("") + "</div>" +
      "</div>" +
      '<div class="dh-ide" id="dh-ide" role="img" aria-label="A code editor showing a profile object: name, role, stack, location and what I am building">' +
        '<div class="ide-top"><i></i><i></i><i></i><button type="button" class="ide-tab on" data-tab="profile.ts">profile.ts</button><button type="button" class="ide-tab" data-tab="stack.json">stack.json</button><button type="button" class="ide-tab" data-tab="README.md">README.md</button></div>' +
        '<div class="ide-body">' + pane(CODE, "profile.ts", "// ready to build something together") + pane(STACK, "stack.json", "// 10+ tools, one warehouse") + pane(README, "README.md", "<!-- thanks for reading -->") + '</div>' +
        '<div class="ide-status"><span><i class="fa-solid fa-code-branch"></i> main</span><span>TypeScript</span><span class="ok"><i></i> 0 errors</span></div>' +
      "</div></div>" +
      '<div class="dv-wrap"><div class="dh-stats dv-rv">' +
        '<div><b data-n="5" data-s="+">0</b><span>years in data &amp; software</span></div>' +
        '<div><b data-n="4" data-s="">0</b><span>companies &amp; teams</span></div>' +
        '<div><b data-n="10" data-s="+">0</b><span>core tools in daily use</span></div>' +
        '<div><b class="txt">SnowPro Core</b><span>Snowflake certified</span></div>' +
      "</div></div></section>";
  }

  /* ---------- toolbox ---------- */
  var iconCls = function (t) { return (t.brand ? "fa-brands " : "fa-solid ") + (t.icon || "fa-star"); };
  function toolboxHTML() {
    return sec("toolbox", "~/toolbox", "The toolbox", "What I reach for every day. Click a tool for how I use it.",
      '<div class="dv-tools">' + topTen.map(function (t, i) {
        return '<button type="button" class="dv-tool dv-rv" data-tool="' + t.id + '" style="--c:' + t.color + ';--i:' + (i % 5) + '"><span class="ti"><i class="' + iconCls(t) + '"></i></span><span class="tn"><b>' + esc(t.title) + '</b><small>' + esc(t.tags.join(" · ")) + '</small></span><span class="tr">' + String(i + 1).padStart(2, "0") + '</span><p>' + esc(t.desc) + '</p></button>';
      }).join("") + "</div>");
  }

  /* ---------- experience as a git log ---------- */
  function experienceHTML(limit) {
    var jobs = careerTimeline.filter(function (c) { return c.id !== "future-goals"; }).slice().reverse();
    if (limit) jobs = jobs.slice(0, limit);
    return sec("experience", "~/experience", "Experience, as a git log", "Newest commit first. Open an entry for the full diff.",
      '<ol class="dv-log">' + jobs.map(function (c, i) {
        var cur = /present/i.test(c.date), tags = (c.tags || []).filter(function (t) { return !/best employee/i.test(t); });
        var award = (c.tags || []).some(function (t) { return /best employee/i.test(t); });
        return '<li class="dv-commit dv-rv' + (cur ? " head" : "") + '"><span class="node"></span><div class="cm">' +
          '<div class="meta"><code class="sha">' + hash(c.id) + "</code>" + (cur ? '<span class="ref">HEAD &rarr; main</span>' : "") + (award ? '<span class="ref award"><i class="fa-solid fa-trophy"></i> Best Employee 2025&ndash;26</span>' : "") + '<time>' + esc(decode(c.date)) + "</time></div>" +
          '<h3>' + c.title + '</h3><p class="co">' + c.subtitle + "</p><p>" + esc(decode(c.summary)) + "</p>" +
          (tags.length ? '<div class="dv-tags">' + tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" : "") +
          '<button type="button" class="more" aria-expanded="false" data-more><i class="fa-solid fa-chevron-down"></i> git show ' + hash(c.id) + '</button><div class="det"><div class="det-in">' + c.fullDetails + "</div></div></div></li>";
      }).join("") + "</ol>");
  }

  /* ---------- projects as repos ---------- */
  function projectsHTML() {
    return sec("projects", "~/projects", "Projects", "Production work and things I built myself. Open one for its README.",
      '<div class="dv-repos">' + projects.map(function (p, i) {
        return '<article class="dv-repo dv-rv" style="--i:' + i + '"><div class="rh"><i class="fa-regular fa-folder-open"></i><h3>' + esc(p.title) + '</h3><span class="vis">' + (p.id === "viharasetu-website" ? "public" : "private") + '</span></div>' +
          '<p class="rc">' + esc(p.client) + '</p><p class="rd">' + esc(p.problem.length > 190 ? p.problem.slice(0, 187) + "…" : p.problem) + '</p>' +
          '<div class="dv-tags">' + p.tags.slice(0, 5).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + '</div>' +
          '<div class="rf"><span><i class="fa-solid fa-user-gear"></i> ' + esc(p.role) + '</span><span><i class="fa-regular fa-calendar"></i> ' + esc(p.duration) + '</span></div>' +
          '<button type="button" class="dv-btn sm" data-readme="' + p.id + '"><i class="fa-brands fa-readme"></i> Read README</button></article>';
      }).join("") + "</div>");
  }

  /* ---------- side quests ---------- */
  function questsHTML() {
    var cards = [
      { art: "abc", theme: "travel", title: "Trekking diaries", text: trekkingStories.length + " treks from the Western Ghats to the Himalayas, with Annapurna Base Camp planned for April 2027.", href: "trekking.html", cta: "Open the diaries" },
      { art: "rajasthan", theme: "rajasthan", title: "Travel stories", text: "Latest: ten days across Udaipur, Jodhpur and Jaipur in Rajasthan.", href: "stories/rajasthan-trip.html", cta: "Read the trip" },
      { art: "web", theme: "vihara", title: "ViharaSetu", text: "The travel venture I co-founded: a bridge between travelers and meaningful destinations.", href: "viharasetu.html", cta: "Meet ViharaSetu" },
      { art: "journey", theme: "trek", title: "Photography", text: "Street, candid and landscape frames. Plus a private collection of trip memories.", href: "gallery.html", cta: "Open the gallery" }
    ];
    return sec("quests", "~/side-quests", "Side quests", "Engineer by day. The rest of the time I’m outside, building ViharaSetu or behind a camera.",
      '<div class="dv-quests">' + cards.map(function (c, i) {
        return '<a class="dv-quest dv-rv" href="' + ROOT + c.href + '" style="--i:' + i + '"><div class="qa">' + lineArt(c.art, c.theme) + '</div><div class="qb"><h3>' + c.title + '</h3><p>' + c.text + '</p><span class="go">' + c.cta + ' <i class="fa-solid fa-arrow-right"></i></span></div></a>';
      }).join("") + "</div>");
  }

  /* ---------- contact ---------- */
  function contactHTML() {
    return '<section class="dv-sec dv-last" id="contact"><div class="dv-wrap"><div class="dv-term dv-rv">' +
      '<div class="ide-top"><i></i><i></i><i></i><span class="ide-tab on">~/contact</span></div>' +
      '<div class="tb"><p><span class="pr">$</span> git commit -m <span class="t-s">"let’s build something together"</span></p>' +
      '<p class="out">[main ' + hash("contact") + '] new conversation started</p>' +
      '<h2>Have a role, a project or a trail in mind?</h2><p class="out">Data engineering roles, collaborations and ViharaSetu enquiries are all welcome.</p>' +
      '<div class="dh-cta"><a class="dv-btn pri" href="mailto:tmaniraj1111@gmail.com"><i class="fa-solid fa-envelope"></i> tmaniraj1111@gmail.com</a><a class="dv-btn" href="' + ROOT + 'contact.html"><i class="fa-solid fa-message"></i> Contact form</a><a class="dv-btn ghost" href="https://www.linkedin.com/in/tdevamani/" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin-in"></i> LinkedIn</a></div></div></div></div></section>';
  }

  /* ---------- work page header / about ---------- */
  function workHeadHTML() {
    return '<section class="dv-head"><div class="dv-wrap"><span class="dv-path">~/work</span><h1>Work</h1><p>Five-plus years of Snowflake-centred data engineering &mdash; the roles, the projects, the toolbox and what I’m learning next. <a class="inl" href="' + ROOT + 'resume.html">Full resume &rarr;</a></p>' +
      '<div class="dv-chips"><a href="#experience">experience</a><a href="#projects">projects</a><a href="#toolbox">toolbox</a><a href="' + ROOT + 'resume.html">resume</a></div></div></section>';
  }

  /* ---------- README panel ---------- */
  var panel;
  function listHTML(a) { return a && a.length ? "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; }
  function openPanel(title, path, body) {
    if (!panel) {
      panel = document.createElement("div"); panel.className = "dv-rm";
      panel.innerHTML = '<div class="dv-rm-box" role="dialog" aria-modal="true" aria-labelledby="dv-rm-t"><div class="ide-top"><i></i><i></i><i></i><span class="ide-tab on" id="dv-rm-p"></span><button type="button" class="x" aria-label="Close" data-x><i class="fa-solid fa-xmark"></i></button></div><div class="dv-rm-body" id="dv-rm-b"></div></div>';
      document.body.appendChild(panel);
      panel.addEventListener("click", function (e) { if (e.target === panel || e.target.closest("[data-x]")) closePanel(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });
    }
    $("#dv-rm-p", panel).textContent = path; $("#dv-rm-b", panel).innerHTML = body; $("#dv-rm-b", panel).scrollTop = 0;
    requestAnimationFrame(function () { panel.classList.add("open"); });
    document.body.classList.add("no-scroll"); $("[data-x]", panel).focus();
  }
  function closePanel() { if (panel) { panel.classList.remove("open"); document.body.classList.remove("no-scroll"); } }
  function readmeProject(p) {
    var res = (p.results || []).filter(function (r) { return r.charAt(0) !== "["; });
    openPanel(p.title, p.id + "/README.md",
      "<h2 id=\"dv-rm-t\">" + esc(p.title) + '</h2><p class="sub">' + esc(p.client) + " &middot; " + esc(p.role) + " &middot; " + esc(p.duration) + '</p><div class="dv-tags">' + p.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" +
      "<h3># Problem</h3><p>" + esc(p.problem) + "</p><h3># Solution</h3><p>" + esc(p.solution) + "</p><h3># Architecture</h3><pre>" + esc(p.architecture) + "</pre><h3># What I did</h3>" + listHTML(p.responsibilities) + (res.length ? "<h3># Results</h3>" + listHTML(res) : "") +
      (p.id === "viharasetu-website" ? '<p><a class="dv-btn sm" href="https://viharasetu.co.in" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> viharasetu.co.in</a></p>' : ""));
  }
  function readmeTool(t) {
    openPanel(t.title, "toolbox/" + t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".md",
      '<h2 id="dv-rm-t"><i class="' + iconCls(t) + '" style="color:' + t.color + '"></i> ' + esc(t.title) + '</h2><p class="sub">' + esc(t.tags.join(" · ")) + "</p>" +
      (t.paragraphs || [t.desc]).map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("") + (t.points ? "<h3># What I do with it</h3>" + listHTML(t.points) : "") +
      (t.related ? '<h3># Works with</h3><div class="dv-tags">' + t.related.map(function (r) { return "<span>" + esc(r) + "</span>"; }).join("") + "</div>" : ""));
  }

  /* ---------- behaviours ---------- */
  function typeLoop() {
    var el = $("#dh-type"); if (!el) return;
    var words = ["data platforms", "Snowflake pipelines", "reliable ETL", "travel startups", "things that last"], w = 0, c = 0, del = false;
    if (reduce) { el.textContent = words[0]; return; }
    (function tick() {
      var full = words[w];
      c += del ? -1 : 1; el.textContent = full.slice(0, c);
      var t = del ? 38 : 80;
      if (!del && c === full.length) { del = true; t = 1500; } else if (del && c === 0) { del = false; w = (w + 1) % words.length; t = 350; }
      setTimeout(tick, t);
    })();
  }
  function counters() {
    $$("[data-n]").forEach(function (el) {
      var to = +el.dataset.n, s = el.dataset.s || "", io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        var t0 = performance.now();
        (function step(t) { var k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = k < 1 ? String(v).replace(/\d/g, function (d, i) { return k < .6 && Math.random() < .5 ? "0123456789#<>/_"[Math.floor(Math.random() * 15)] : d; }) : to + s; if (k < 1) requestAnimationFrame(step); })(t0);
      }, { threshold: .6 });
      if (reduce) el.textContent = to + s; else io.observe(el);
    });
  }
  function reveals() {
    var els = $$(".dv-rv");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: "0px 0px -5% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }
  function spotlight() {
    document.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(".dv-tool, .dv-repo, .dv-quest, .dv-commit .cm");
      if (!c) return; var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  function init() {
    var main = $("#main");
    var cine = document.body.dataset.cine === "home";
    var profile = heroHTML();
    if (cine) profile = profile.replace('<section class="dh-hero"><div class="dv-wrap dh-grid">', '<section class="dh-hero dh-cine"><div class="dv-wrap"><header class="dv-sh dv-rv"><span class="dv-path">~/profile.ts</span><h2>The profile</h2><p>The same person, written as code. Click the tabs.</p></header></div><div class="dv-wrap dh-grid">').replace('<div class="dh-copy">', '<div class="dh-copy" hidden>');
    var html = PAGE === "devhome"
      ? profile + toolboxHTML() + experienceHTML(3) + projectsHTML() + questsHTML() + contactHTML()
      : workHeadHTML() + experienceHTML() + projectsHTML() + toolboxHTML() + contactHTML();
    main.innerHTML = html;

    document.addEventListener("click", function (e) {
      var r = e.target.closest("[data-readme]"), t = e.target.closest("[data-tool]"), m = e.target.closest("[data-more]");
      if (r) { var p = projects.filter(function (x) { return x.id === r.dataset.readme; })[0]; if (p) readmeProject(p); }
      else if (t) { var tl = topTen.filter(function (x) { return x.id === t.dataset.tool; })[0]; if (tl) readmeTool(tl); }
      else if (m) { var card = m.closest(".cm"), open = !card.classList.contains("open"); card.classList.toggle("open", open); m.setAttribute("aria-expanded", open); }
    });

    /* hero editor types itself line by line */
    var ide = $("#dh-ide");
    if (ide) { if (reduce) ide.classList.add("typed"); else requestAnimationFrame(function () { setTimeout(function () { ide.classList.add("typed"); }, 350); }); }
    $$(".ide-tab[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".ide-tab[data-tab]").forEach(function (x) { x.classList.toggle("on", x === b); });
        $$(".ide-pane").forEach(function (p) { var on = p.dataset.pane === b.dataset.tab; p.classList.toggle("on", on); if (on) { p.classList.remove("re"); void p.offsetWidth; p.classList.add("re"); } });
        var st = $(".ide-status span:nth-child(2)"); if (st) st.textContent = b.dataset.tab === "stack.json" ? "JSON" : b.dataset.tab === "README.md" ? "Markdown" : "TypeScript";
      });
    });
    typeLoop(); counters(); reveals(); spotlight();
    if (location.hash) { var h = $(location.hash); if (h) setTimeout(function () { h.scrollIntoView(); }, 60); }
  }
  document.addEventListener("DOMContentLoaded", init);
})();

/* toolbox: stagger index + cursor-follow 3D tilt */
document.addEventListener("DOMContentLoaded", function () {
  var tools = Array.prototype.slice.call(document.querySelectorAll(".dv-tool"));
  tools.forEach(function (t, i) { t.style.setProperty("--idx", i % 8); });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) return;
  tools.forEach(function (t) {
    var raf = 0;
    t.addEventListener("pointermove", function (e) {
      var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; t.style.setProperty("--ry", (x * 7).toFixed(1) + "deg"); t.style.setProperty("--rx", (-y * 7).toFixed(1) + "deg"); });
    });
    t.addEventListener("pointerleave", function () { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); });
  });
});
