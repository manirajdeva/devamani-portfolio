/* chat.js - on-page assistant. Runs fully in the browser (no server, no API key):
   it searches this site's own content (career, projects, tools, treks, travel, ViharaSetu, contact)
   plus the text of the page you are on, and answers with the best matching passages. */
(function () {
  "use strict";
  var ROOT = document.body.dataset.root || "";
  var PAGE = document.body.dataset.page || "";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var txt = function (h) { var d = document.createElement("div"); d.innerHTML = String(h || ""); return (d.textContent || "").replace(/\s+/g, " ").trim(); };

  function loadScript(src) {
    return new Promise(function (res) { var s = document.createElement("script"); s.src = ROOT + src + "?v=20261148"; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  }
  var ready = (function () {
    var p = Promise.resolve();
    if (typeof careerTimeline === "undefined") p = p.then(function () { return loadScript("js/data.js"); });
    if (typeof topTen === "undefined") p = p.then(function () { return loadScript("js/content.js"); });
    return p;
  })();

  /* ---------- knowledge base ---------- */
  var KB = [];
  function add(title, text, url, tag) { text = txt(text); if (text.length > 20) KB.push({ t: title, x: text, u: url, g: tag || "site" }); }
  function build() {
    add("About me", "T Devamani Raju is a senior software engineer and data engineer with 5+ years of experience across modern data platforms: Snowflake, SQL, Talend, Informatica and Airflow. Snowflake SnowPro Core certified. Currently at Ibexlabs working on Truist's Artemis-CPE platform. Co-founder of ViharaSetu, a travel venture, and a trekker and photographer. Based in Bengaluru, India. Best Employee Award 2025-2026 at Ibexlabs.", ROOT + "index.html", "about");
    add("Contact", "Personal email: tmaniraj1111@gmail.com. Work email: devamaniraju.talabhatla@ibexlabs.com. Phone: +91 87220 21295. ViharaSetu email: info@viharasetu.co.in. LinkedIn linkedin.com/in/tdevamani, GitHub github.com/manirajdeva, Instagram maniraj_deva, YouTube Travel_with_devaratha. You can also use the contact form.", ROOT + "contact.html", "contact");
    add("Resume", "The full resume can be downloaded as a PDF from the resume page. It covers 5+ years of data engineering: Ibexlabs (Truist Artemis-CPE), ATMECS (Intuitive Surgicals), Vizag Amogh (Western Asset Management) and Symbiosys Technologies (Cisco devices). SnowPro Core certified.", ROOT + "resume.html", "resume");
    if (typeof careerTimeline !== "undefined") careerTimeline.forEach(function (c) {
      add(txt(c.title) + " at " + txt(c.subtitle) + " (" + txt(c.date) + ")", c.summary + " " + (c.tags || []).join(", ") + ". " + c.fullDetails, ROOT + "work.html#experience", "career");
    });
    if (typeof projects !== "undefined") projects.forEach(function (p) {
      add("Project: " + p.title, p.client + ". Role: " + p.role + ". " + p.duration + ". Problem: " + p.problem + " Solution: " + p.solution + " Architecture: " + p.architecture + " Work done: " + (p.responsibilities || []).join("; ") + ". Tech: " + (p.tags || []).join(", ") + ". " + (p.results || []).filter(function (r) { return r.charAt(0) !== "["; }).join(" "), ROOT + "work.html#projects", "project");
    });
    if (typeof topTen !== "undefined") topTen.forEach(function (t) {
      add("Tool: " + t.title, t.desc + " " + (t.paragraphs || []).join(" ") + " " + (t.points || []).join("; "), ROOT + "work.html#toolbox", "tool");
    });
    if (typeof skills !== "undefined") skills.forEach(function (s) { add("Skill: " + s.title, s.level + ". " + s.desc, ROOT + "work.html#toolbox", "tool"); });
    if (typeof trekkingStories !== "undefined") trekkingStories.forEach(function (t) {
      add("Trek: " + t.title, t.location + ", " + t.date + ". Difficulty " + t.difficulty + ", distance " + t.distance + ", duration " + t.duration + ", altitude " + t.altitude + ". " + t.description, ROOT + t.storyPage, "trek");
    });
    if (typeof travelStories !== "undefined") travelStories.forEach(function (t) {
      add("Travel: " + t.title, t.location + ", " + t.date + ". " + t.description, ROOT + t.storyPage, "travel");
    });
    if (typeof viharaOriginals !== "undefined") viharaOriginals.forEach(function (v) { add("ViharaSetu: " + v.title, v.desc, ROOT + "viharasetu.html", "vihara"); });
    add("ViharaSetu", "ViharaSetu is a travel venture co-founded by T Devamani Raju, Sateesh R and Devi K on 20 February 2026: a bridge between travelers and meaningful destinations. It offers travel packages, spiritual journeys, cultural experiences, trekking and adventure, customized trips, heritage travel and destination experiences. Website: viharasetu.co.in.", "https://www.viharasetu.co.in", "vihara");
    add("Gallery", "The gallery has a public Photography collection (street, candid portrait, landscape, macro, astrophotography and more). The Travel & Memories and All collections are private and need a password.", ROOT + "gallery.html", "gallery");
    if (typeof inspirationsList !== "undefined") inspirationsList.forEach(function (i) { add("Inspiration: " + i.title, i.desc, ROOT + i.page, "inspiration"); });
    pageChunks();
  }
  function pageChunks() {
    var main = $("#main"); if (!main) return;
    var head = "", here = location.pathname.split("/").pop() || "index.html";
    [].forEach.call(main.querySelectorAll("h1, h2, h3, p, li, .quick-fact"), function (e) {
      if (e.closest(".pq, .dv-rm, .dv-pal, #cb-root")) return;
      var tx = txt(e.textContent);
      if (/^H[123]$/.test(e.tagName)) { head = tx; return; }
      if (tx.length > 30) KB.push({ t: head || document.title, x: tx, u: location.pathname + (e.id ? "#" + e.id : ""), g: "page" });
    });
  }

  /* ---------- search ---------- */
  var STOP = "a an and are as at be by can do does for from has have how i in is it its me my of on or tell that the this to was what when where which who why with you your about please give show know".split(" ");
  var stem = function (w) { return w.replace(/(ing|ed|es|s)$/, function (m, a, off, str) { return str.length - m.length > 3 ? "" : m; }); };
  var tok = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9+#\s]/g, " ").split(/\s+/).filter(function (w) { return w && STOP.indexOf(w) < 0; }).map(stem); };
  /* synonyms: words people use -> words the site uses (applied to the question only) */
  var SYN = {
    organization: "company employer ibexlabs", organisation: "company employer ibexlabs", firm: "company employer", workplace: "company employer ibexlabs", employer: "company ibexlabs", office: "company ibexlabs",
    tech: "tool snowflake sql skill", technology: "tool snowflake sql skill", technologies: "tool snowflake sql skill", stack: "tool snowflake sql skill", skill: "tool snowflake sql", language: "sql python", programming: "sql python", software: "tool snowflake sql",
    education: "academic degree diploma university", degree: "academic b.sc diploma university", college: "academic diploma university", study: "academic diploma university", studied: "academic diploma university", qualification: "academic degree diploma", university: "annamalai academic",
    hobby: "trekking travel photography", hobbies: "trekking travel photography", interest: "trekking travel photography", passion: "trekking travel photography", freetime: "trekking travel photography",
    trip: "travel rajasthan", vacation: "travel", holiday: "travel", tour: "travel", journey: "travel", place: "travel trek", destination: "travel vihara",
    hike: "trek", hiking: "trek", mountain: "trek himalaya", trail: "trek", peak: "trek", himalayas: "trek",
    photo: "photography gallery", picture: "photography gallery", image: "photography gallery", camera: "photography gallery", photograph: "photography gallery",
    startup: "vihara venture", business: "vihara venture", venture: "vihara", founder: "vihara co-founder", cofounder: "vihara co-founder", company2: "vihara",
    package: "vihara travel", booking: "vihara travel", book: "vihara travel", price: "vihara travel", spiritual: "vihara", heritage: "vihara",
    mentor: "inspiration", idol: "inspiration", hero: "inspiration", motivation: "inspiration", family: "inspiration mother", mother: "inspiration family vijaya", mom: "inspiration family vijaya",
    future: "goal", goal: "future", plan: "future goal", upcoming: "planned future", next: "planned future abc",
    bank: "truist banking", banking: "truist banking artemis", finance: "truist banking western", financial: "truist banking",
    cloud: "aws s3", database: "snowflake sql", warehouse: "snowflake", pipeline: "snowflake etl", etl: "talend informatica", orchestration: "airflow",
    current: "ibexlabs present", present: "ibexlabs", latest: "ibexlabs present", recent: "ibexlabs present", now: "ibexlabs present", today: "ibexlabs present",
    internship: "trainee symbiosys", fresher: "trainee symbiosys", network: "cisco symbiosys", 
    cert: "snowpro certified", certified: "snowpro", certificate: "snowpro", exam: "snowpro",
    name: "devamani raju", age: "about", dob: "about", birthday: "about"
  };
  var expand = function (words) { var out = words.slice(); words.forEach(function (w) { if (SYN[w]) SYN[w].split(" ").forEach(function (x) { out.push(stem(x)); }); }); return out; };
  function search(q) {
    var qt = expand(tok(q)); if (!qt.length) return [];
    var df = {}; KB.forEach(function (k) { if (!k._t) { k._t = tok(k.t + " " + k.x); k._s = {}; k._t.forEach(function (w) { k._s[w] = (k._s[w] || 0) + 1; }); k._ts = tok(k.t); } });
    KB.forEach(function (k) { Object.keys(k._s).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
    var N = KB.length;
    var res = KB.map(function (k) {
      var sc = 0, hit = 0;
      qt.forEach(function (w) {
        var tf = k._s[w] || 0, inT = k._ts.indexOf(w) >= 0;
        if (tf || inT) { hit++; sc += (Math.log(1 + tf) + (inT ? 2.2 : 0)) * Math.log(1 + N / (df[w] || 1)); }
      });
      if (k.g === "page") sc *= 1.35;
      return { k: k, s: sc * (0.6 + 0.4 * hit / qt.length) };
    }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    return res;
  }
  function snippet(k, q) {
    var qt = tok(q), sents = k.x.split(/(?<=[.!?])\s+/), best = [], scored = sents.map(function (s, i) { var t = tok(s), sc = 0; qt.forEach(function (w) { if (t.indexOf(w) >= 0) sc++; }); return { s: s, i: i, sc: sc }; });
    scored.sort(function (a, b) { return b.sc - a.sc || a.i - b.i; });
    best = scored.slice(0, 2).sort(function (a, b) { return a.i - b.i; }).map(function (x) { return x.s; });
    var out = best.join(" "); return out.length > 360 ? out.slice(0, 357) + "…" : out;
  }

  /* ---------- answers ---------- */
  var INTENTS = [
    [/^(hi|hello|hey|hola|good (morning|afternoon|evening))\b/i, function () { return { a: "Hi! I'm the assistant for this site. Ask me about Devamani's experience, projects, tools, treks, travel or ViharaSetu." }; }],
    [/\b(thanks|thank you|thx)\b/i, function () { return { a: "You're welcome! Anything else you'd like to know?" }; }],
    [/\b(who (is|are)|about (him|devamani|you)|introduce)/i, function () { return top("about"); }],
    [/\b(previous|past|earlier|former|prior|old)\b.*\b(compan|employer|job|role|work)|\b(compan|employer)(y|ies)?\b.*\b(previous|past|earlier|former|prior)/i, function () { return jobs(true); }],
    [/\b(compan(y|ies)|employer|worked|work history|experience|career|jobs?|roles?)\b/i, function (q) { return /ibexlabs|atmecs|vizag|amogh|symbiosys|truist|western|intuitive|cisco/i.test(q) ? null : jobs(false); }],
    [/\b(tools?|skills?|tech(nolog(y|ies))?|stack|toolbox|languages?|programming)\b/i, function (q) { return /what is|explain|how (does|do)|snowflake|snowpipe|airflow|talend|informatica|dbt|tableau|aws|sql|python/i.test(q) ? null : toolList(); }],
    [/\b(treks?|trekking|hik(e|es|ing)|mountains?)\b/i, function (q) { return /kedarnath|sivagange|netravathi|z point|annapurna|abc/i.test(q) ? null : trekList(); }],
    [/\b(hobb(y|ies)|interests?|passions?|free time|off duty|outside (of )?work)\b/i, function () { return { a: "Outside work, Devamani loves trekking, travel and photography, and he co-founded the travel venture ViharaSetu.", l: [["Trekking", ROOT + "trekking.html"], ["Gallery", ROOT + "gallery.html"]] }; }],
    [/\b(educat|degree|qualification|college|universit|studied|study|diploma|academic|school)/i, function () { var k = KB.filter(function (x) { return x.g === "career" && /academic/i.test(x.t); })[0]; return k ? { a: k.x.replace(/^.*?(B\.Sc \(Computer Science\))/, "$1").replace(/\s*\.\s*\./g, "."), l: [["Experience", ROOT + "work.html#experience"]] } : { a: "B.Sc (Computer Science) from Annamalai University (2018) and a Diploma in Electronics & Communication Engineering from SBTET (2014)." }; }],
    [/\b(future|goals?|plans?|upcoming|next)\b/i, function () { return { a: "Upcoming: the Annapurna Base Camp trek in April 2027, growing ViharaSetu, and going deeper into Snowflake and data engineering.", l: [["ABC trek", ROOT + "stories/annapurna-base-camp-trek.html"], ["Experience", ROOT + "work.html#experience"]] }; }],
    [/\b(startup|start-up|venture|co-?found(er|ed)?)\b|^\W*(what is |tell me about )?viharasetu\W*$/i, function (q) { return /website|site/i.test(q) ? null : top("vihara"); }],
    [/\bprojects?\b/i, function (q) { return /artemis|western|viharasetu|website|truist/i.test(q) ? null : projectList(); }],
    [/\b(phone|mobile|cell|whatsapp|call|number)\b/i, function () { return { a: "Phone: +91 87220 21295", l: [["Contact page", ROOT + "contact.html"]] }; }],
    [/\b(work|office|professional|ibexlabs|company)\b.*\b(e-?mail|mail)\b|\b(e-?mail|mail)\b.*\b(work|office|professional|ibexlabs|company)\b/i, function () { return { a: "Work email: devamaniraju.talabhatla@ibexlabs.com", l: [["Contact page", ROOT + "contact.html"]] }; }],
    [/\bviharasetu\b.*\b(e-?mail|mail)\b|\b(e-?mail|mail)\b.*\bviharasetu\b/i, function () { return { a: "ViharaSetu email: info@viharasetu.co.in", l: [["viharasetu.co.in", "https://www.viharasetu.co.in"]] }; }],
    [/\blinkedin\b/i, function () { return { a: "LinkedIn: linkedin.com/in/tdevamani", l: [["Open LinkedIn", "https://www.linkedin.com/in/tdevamani/"]] }; }],
    [/\bgithub\b/i, function () { return { a: "GitHub: github.com/manirajdeva", l: [["Open GitHub", "https://github.com/manirajdeva"]] }; }],
    [/\binstagram\b/i, function () { return { a: "Instagram: @maniraj_deva", l: [["Open Instagram", "https://instagram.com/maniraj_deva"]] }; }],
    [/\byoutube\b/i, function () { return { a: "YouTube channel: Travel_with_devaratha", l: [["Open YouTube", "https://www.youtube.com/@Travel_with_devaratha"]] }; }],
    [/\b(e-?mail|mail)\b/i, function () { return { a: "Personal email: tmaniraj1111@gmail.com. For work, his work email is devamaniraju.talabhatla@ibexlabs.com.", l: [["Contact page", ROOT + "contact.html"]] }; }],
    [/\b(contact|reach|hire|connect)\b/i, function () { return top("contact"); }],
    [/\b(resume|cv|download)\b/i, function () { return top("resume"); }],
    [/\b(open to work|available|looking for (a )?job|hiring)\b/i, function () { return { a: "For roles, collaborations or ViharaSetu enquiries, the best way is to email tmaniraj1111@gmail.com or use the contact form.", l: [["Contact page", ROOT + "contact.html"]] }; }],
    [/\b(where|location|based|live|city)\b.*\b(he|devamani|you|based|live)\b|\bwhere (is|are|does)\b.*\b(he|devamani|you)\b/i, function () { return { a: "Devamani is based in Bengaluru, India." }; }],
    [/\b(award|best employee|recognition|achievement)s?\b/i, function () { return { a: "Best Employee Award 2025-2026 at Ibexlabs, for his work on the Truist Artemis-CPE platform.", l: [["Experience", ROOT + "work.html#experience"]] }; }],
    [/\b(certif|snowpro)/i, function () { return { a: "Devamani is Snowflake SnowPro Core certified.", l: [["Resume", ROOT + "resume.html"]] }; }]
  ];
  function jobs(previousOnly) {
    if (typeof careerTimeline === "undefined") return null;
    var list = careerTimeline.filter(function (c) { return c.id !== "future-goals"; }).slice().reverse();
    if (previousOnly) list = list.filter(function (c) { return !/present/i.test(c.date); });
    var lines = list.map(function (c) {
      var proj = c.fullDetails ? (txt(c.fullDetails).match(/Project:\s*([^.]*?)(?=\s{2,}|Client:|Department:|Transforming|Western|Responsible|Maintain|$)/) || [])[1] : "";
      return "<b>" + esc(txt(c.title)) + "</b><br>" + esc(txt(c.subtitle)) + " · " + esc(txt(c.date)) + (proj ? "<br>Project: " + esc(proj.trim().split(/\s{2,}| Client/)[0]) : "");
    });
    return { html: (previousOnly ? "Previous companies:<br><br>" : "Roles so far, newest first:<br><br>") + lines.join("<br><br>"), l: [["Experience", ROOT + "work.html#experience"], ["Resume", ROOT + "resume.html"]] };
  }
  function toolList() {
    if (typeof topTen === "undefined") return null;
    return { html: "Core toolbox:<br><br>" + topTen.map(function (t) { return "<b>" + esc(t.title) + "</b> – " + esc(t.tags.join(", ")); }).join("<br>") + "<br><br>Ask about any tool for how he uses it.", l: [["Toolbox", ROOT + "work.html#toolbox"]] };
  }
  function trekList() {
    if (typeof trekkingStories === "undefined") return null;
    return { html: "Treks:<br><br>" + trekkingStories.map(function (t) { return "<b>" + esc(t.title) + "</b><br>" + esc(t.location) + " · " + esc(t.date) + " · " + esc(t.duration); }).join("<br><br>"), l: [["Trekking diaries", ROOT + "trekking.html"]] };
  }
  function projectList() {
    if (typeof projects === "undefined") return null;
    var lines = projects.map(function (p) { return "<b>" + esc(p.title) + "</b><br>" + esc(p.client) + " · " + esc(p.duration) + "<br>" + esc(p.role); });
    return { html: "Projects:<br><br>" + lines.join("<br><br>") + "<br><br>Ask about any one for details.", l: [["Projects", ROOT + "work.html#projects"]] };
  }
  function top(tag) { var k = KB.filter(function (x) { return x.g === tag && (tag !== "vihara" || x.t === "ViharaSetu"); })[0]; return k ? { a: k.x, l: [[k.t, k.u]] } : null; }

  function answer(q) {
    for (var i = 0; i < INTENTS.length; i++) if (INTENTS[i][0].test(q)) { var r = INTENTS[i][1](q); if (r) return r; }
    var res = search(q);
    if (!res.length || res[0].s < 1.2) return { a: "I couldn't find that on this site. Try asking about experience, projects, tools like Snowflake or Airflow, treks, the Rajasthan trip, or ViharaSetu.", chips: true };
    var picks = [], seen = {};
    res.sort(function (a, b) { return (b.s * (b.k.g === "page" ? 0.8 : 1)) - (a.s * (a.k.g === "page" ? 0.8 : 1)); });
    res.slice(0, 6).forEach(function (r) { var key = r.k.t.replace(/^[A-Za-z ]+: /, ""); if (!seen[key] && picks.length < 2 && r.s > res[0].s * 0.55) { seen[key] = 1; picks.push(r.k); } });
    var a = picks.map(function (k) { return "<b>" + esc(k.t) + "</b><br>" + esc(snippet(k, q)); }).join("<br><br>");
    return { html: a, l: picks.map(function (k) { return [k.g === "page" ? "On this page" : "Open: " + k.t.replace(/^[A-Za-z ]+: /, ""), k.u]; }).slice(0, 2) };
  }

  var SUGGEST = {
    devhome: ["What does Devamani do?", "Which tools does he use?", "Tell me about ViharaSetu", "How can I contact him?"],
    devwork: ["Tell me about Artemis-CPE", "What did he do at Ibexlabs?", "What is Snowpipe?", "Is he certified?"],
    gallery: ["What is in the gallery?", "Is any collection private?"],
    trekking: ["Which treks has he done?", "Tell me about the Kedarnath trek", "What is the ABC trek plan?"],
    inspirations: ["Who inspires Devamani?", "Tell me about Nims Purja"],
    vihara: ["What does ViharaSetu offer?", "Who founded ViharaSetu?", "What is the website?"],
    contact: ["What is the email address?", "Phone number?"],
    resume: ["Where has he worked?", "Is he SnowPro certified?"],
    story: ["Summarize this page", "How hard is this trek?"]
  };

  /* ---------- UI ---------- */
  function ui() {
    var root = document.createElement("div"); root.id = "cb-root";
    root.innerHTML = '<button type="button" id="cb-fab" aria-label="Open chat assistant" aria-expanded="false"><i class="fa-solid fa-comments"></i><span class="cb-dot"></span></button>' +
      '<section id="cb-panel" role="dialog" aria-label="Site assistant" aria-hidden="true"><header><div><b>Ask about this site</b><small><i></i> answers from the pages, no sign-in</small></div><button type="button" id="cb-x" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button></header>' +
      '<div id="cb-log" aria-live="polite"></div><div id="cb-chips"></div>' +
      '<form id="cb-form" autocomplete="off"><input id="cb-in" type="text" maxlength="200" placeholder="Ask a question…" aria-label="Your question"><button type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form></section>';
    document.body.appendChild(root);
    var fab = $("#cb-fab"), panel = $("#cb-panel"), log = $("#cb-log"), chips = $("#cb-chips"), input = $("#cb-in");
    function msg(cls, html) { var m = document.createElement("div"); m.className = "cb-m " + cls; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
    function chipRow() {
      var list = SUGGEST[PAGE] || (/-trek|journey|trip/.test(location.pathname) ? SUGGEST.story : SUGGEST.devhome);
      chips.innerHTML = list.map(function (s) { return '<button type="button">' + esc(s) + "</button>"; }).join("");
    }
    function ask(q) {
      q = q.trim(); if (!q) return;
      msg("me", esc(q)); input.value = "";
      var typing = msg("bot typing", "<i></i><i></i><i></i>");
      ready.then(function () {
        if (!KB.length) build();
        setTimeout(function () {
          typing.remove();
          var r = answer(q) || { a: "Hmm, I'm not sure." };
          var h = r.html || esc(r.a || "");
          if (r.l && r.l.length) h += '<div class="cb-links">' + r.l.map(function (x) { return '<a href="' + esc(x[1]) + '">' + esc(x[0]) + ' <i class="fa-solid fa-arrow-right"></i></a>'; }).join("") + "</div>";
          msg("bot", h);
        }, 380);
      });
    }
    function open(o) {
      panel.classList.toggle("open", o); fab.classList.toggle("on", o); fab.setAttribute("aria-expanded", o); panel.setAttribute("aria-hidden", !o);
      if (o) { if (!log.children.length) { msg("bot", "Hi! I answer from the content of this site and the page you're on. What would you like to know?"); chipRow(); } setTimeout(function () { input.focus(); }, 250); }
    }
    fab.addEventListener("click", function () { open(!panel.classList.contains("open")); });
    $("#cb-x").addEventListener("click", function () { open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) open(false); });
    $("#cb-form").addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
    chips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) ask(b.textContent); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(ui, 400); }); else setTimeout(ui, 400);
})();
