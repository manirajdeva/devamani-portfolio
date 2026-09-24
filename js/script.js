/* ==========================================================================
   script.js
   Site-wide behavior: navigation, scroll effects, reveal animations,
   dynamic card rendering, gallery filtering, and search.
   Loaded on every page (after js/data.js).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initMobileNav();
  initActiveNavLink();
  initHeroSlideshow();
  initPhotoMarquee();

  // Page-specific renderers — each checks for its container before running,
  // so it's safe to include this one script on every page. These must run
  // BEFORE initRevealAnimations() so it can find the .reveal elements they
  // inject (otherwise those cards stay permanently invisible).
  renderCareerTimeline();
  renderTravelCards();
  renderTrekkingCards();
  renderLifeCards();
  renderProjectCards();
  renderGallery();
  initGalleryFilter();
  initSiteSearch();
  initContactForm();

  initRevealAnimations();
});

/* -------------------------------------------------------------------------
   Header: shrink / shadow on scroll
   ------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const toggle = () => header.classList.toggle("scrolled", window.scrollY > 20);
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* -------------------------------------------------------------------------
   Mobile hamburger navigation
   ------------------------------------------------------------------------- */
function initMobileNav() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });
}

/* -------------------------------------------------------------------------
   Highlight the current page in the nav
   ------------------------------------------------------------------------- */
function initActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });
}

/* -------------------------------------------------------------------------
   Hero cover-photo slideshow — cross-fades between .hero-bg-slide images
   every 4 seconds. Add/remove <img class="hero-bg-slide"> elements (mark
   the first one "active") inside .hero-bg to control which photos rotate.
   ------------------------------------------------------------------------- */
function initHeroSlideshow() {
  const slides = document.querySelectorAll(".hero-bg-slide");
  if (slides.length < 2) return;

  let current = Math.max(0, [...slides].findIndex(s => s.classList.contains("active")));
  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 4000);
}

/* -------------------------------------------------------------------------
   Gallery page header: scrolling photo collage built from every photo in
   galleryImages. The list is rendered twice back-to-back so the CSS
   animation (translateX -50%) loops seamlessly.
   ------------------------------------------------------------------------- */
function initPhotoMarquee() {
  const track1 = document.getElementById("photo-marquee-track-1");
  const track2 = document.getElementById("photo-marquee-track-2");
  if (!track1 || !track2 || typeof galleryImages === "undefined" || !galleryImages.length) return;

  const toHTML = imgs => {
    const html = imgs.map(img => `<img src="${img.src}" alt="${img.caption}" loading="lazy">`).join("");
    return html + html; // duplicated so the scroll animation loops seamlessly
  };

  // Split into two interleaved rows so each row gets a mix of categories.
  const row1 = galleryImages.filter((_, i) => i % 2 === 0);
  const row2 = galleryImages.filter((_, i) => i % 2 !== 0);

  track1.innerHTML = toHTML(row1);
  track2.innerHTML = toHTML(row2);
}

/* -------------------------------------------------------------------------
   Scroll reveal animation using IntersectionObserver
   Add class="reveal" to any element to fade/slide it in on scroll.
   ------------------------------------------------------------------------- */
function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

/* -------------------------------------------------------------------------
   Card template helpers
   ------------------------------------------------------------------------- */
function tagsHTML(tags = []) {
  return tags.map(t => `<span class="pill">${t}</span>`).join("");
}

/* -------------------------------------------------------------------------
   Career timeline (career.html) — click a card to open the full-detail modal
   ------------------------------------------------------------------------- */
function renderCareerTimeline() {
  const container = document.getElementById("career-timeline");
  if (!container || typeof careerTimeline === "undefined") return;

  container.innerHTML = careerTimeline.map((entry, i) => `
    <div class="timeline-item reveal">
      <span class="timeline-dot"></span>
      <div class="timeline-card clickable" data-career-id="${entry.id}" tabindex="0" role="button" aria-label="View full details for ${entry.title}">
        <span class="timeline-date">${entry.date}</span>
        <h3>${entry.title}</h3>
        ${entry.subtitle ? `<h4>${entry.subtitle}</h4>` : ""}
        <p>${entry.summary}</p>
        ${entry.tags.length ? `<div class="tech-tags">${tagsHTML(entry.tags)}</div>` : ""}
        <span class="card-link timeline-view-link">View Full Details <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".timeline-card[data-career-id]").forEach(card => {
    const open = () => openCareerModal(card.dataset.careerId);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  initCareerModal();
}

function openCareerModal(id) {
  const entry = careerTimeline.find(e => e.id === id);
  const modal = document.getElementById("career-modal");
  if (!entry || !modal) return;

  document.getElementById("modal-date").textContent = entry.date;
  document.getElementById("modal-title").innerHTML = entry.title;
  const subtitleEl = document.getElementById("modal-subtitle");
  subtitleEl.innerHTML = entry.subtitle || "";
  subtitleEl.style.display = entry.subtitle ? "block" : "none";
  document.getElementById("modal-tags").innerHTML = tagsHTML(entry.tags);
  document.getElementById("modal-body").innerHTML = entry.fullDetails;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCareerModal() {
  const modal = document.getElementById("career-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

function initCareerModal() {
  const modal = document.getElementById("career-modal");
  if (!modal || modal.dataset.bound) return;
  modal.dataset.bound = "true";

  document.getElementById("career-modal-close").addEventListener("click", closeCareerModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeCareerModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCareerModal(); });
}

/* -------------------------------------------------------------------------
   Travel cards (travel.html)
   ------------------------------------------------------------------------- */
function renderTravelCards() {
  const container = document.getElementById("travel-cards");
  if (!container) return;

  if (!travelStories.length) {
    container.innerHTML = `<p class="text-center">No travel stories yet — check back soon.</p>`;
    return;
  }

  container.innerHTML = travelStories.map((s, i) => `
    <article class="card reveal reveal-delay-${(i % 3) + 1}">
      <div class="card-media">
        <img src="${s.image}" alt="${s.title}" loading="lazy">
        <span class="card-tag">${s.category}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span><i class="fa-solid fa-location-dot"></i> ${s.location}</span>
          <span><i class="fa-regular fa-calendar"></i> ${s.date}</span>
        </div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <div class="card-tags">${tagsHTML(s.tags)}</div>
        <a class="card-link" href="${s.storyPage}">Read Story <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </article>
  `).join("");
}

/* -------------------------------------------------------------------------
   Trekking cards (trekking.html)
   ------------------------------------------------------------------------- */
function renderTrekkingCards() {
  const container = document.getElementById("trekking-cards");
  if (!container) return;

  if (!trekkingStories.length) {
    container.innerHTML = `<p class="text-center">No trekking stories yet — check back soon.</p>`;
    return;
  }

  container.innerHTML = trekkingStories.map((t, i) => `
    <article class="card reveal reveal-delay-${(i % 3) + 1}">
      <div class="card-media">
        <img src="${t.image}" alt="${t.title}" loading="lazy">
        <span class="card-tag">${t.difficulty}</span>
      </div>
      <div class="card-body">
        <h3>${t.title}</h3>
        <div class="card-meta">
          <span><i class="fa-solid fa-location-dot"></i> ${t.location}</span>
          <span><i class="fa-solid fa-mountain"></i> ${t.altitude}</span>
        </div>
        <div class="card-meta">
          <span><i class="fa-solid fa-ruler"></i> ${t.distance}</span>
          <span><i class="fa-regular fa-calendar"></i> ${t.date}</span>
          <span><i class="fa-regular fa-clock"></i> ${t.duration}</span>
        </div>
        <p>${t.description}</p>
        <div class="card-tags">${tagsHTML(t.tags)}</div>
        <a class="card-link" href="${t.storyPage}">Read Story <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </article>
  `).join("");
}

/* -------------------------------------------------------------------------
   Life story cards (life.html)
   ------------------------------------------------------------------------- */
function renderLifeCards() {
  const container = document.getElementById("life-cards");
  if (!container) return;

  if (!lifeStories.length) {
    container.innerHTML = `<p class="text-center">No stories yet — check back soon.</p>`;
    return;
  }

  container.innerHTML = lifeStories.map((s, i) => `
    <article class="card reveal reveal-delay-${(i % 3) + 1}" data-life-id="${s.id}">
      <div class="card-media">
        <img src="${s.image}" alt="${s.title}" loading="lazy">
        <span class="card-tag">${s.category}</span>
      </div>
      <div class="card-body">
        <div class="card-meta"><span><i class="fa-regular fa-calendar"></i> ${s.date}</span></div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <button class="card-link life-read-btn" data-id="${s.id}" style="background:none;border:none;padding:0;">
          Read Full Story <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </article>
  `).join("");

  // Simple inline expand: reveal full content below the card body.
  container.querySelectorAll(".life-read-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const story = lifeStories.find(s => s.id === btn.dataset.id);
      const card = btn.closest(".card");
      if (!story || !card) return;
      let full = card.querySelector(".life-full-content");
      if (full) { full.remove(); btn.innerHTML = 'Read Full Story <i class="fa-solid fa-arrow-right"></i>'; return; }
      full = document.createElement("div");
      full.className = "life-full-content";
      full.style.marginTop = "1rem";
      full.innerHTML = story.content;
      card.querySelector(".card-body").appendChild(full);
      btn.innerHTML = 'Hide Story <i class="fa-solid fa-arrow-up"></i>';
    });
  });
}

/* -------------------------------------------------------------------------
   Project cards (projects.html)
   ------------------------------------------------------------------------- */
function renderProjectCards() {
  const container = document.getElementById("project-cards");
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = `<p class="text-center">Projects coming soon.</p>`;
    return;
  }

  container.innerHTML = projects.map((p, i) => `
    <article class="card reveal reveal-delay-${(i % 3) + 1}">
      <div class="card-body">
        <div class="card-meta">
          <span><i class="fa-solid fa-building"></i> ${p.client}</span>
          <span><i class="fa-regular fa-calendar"></i> ${p.duration}</span>
        </div>
        <h3>${p.title}</h3>
        <p><strong>Role:</strong> ${p.role}</p>
        <p>${p.problem}</p>
        <div class="card-tags">${tagsHTML(p.tags)}</div>

        <div class="project-detail-grid">
          <div class="detail-block">
            <h4>Solution</h4>
            <p>${p.solution}</p>
          </div>
          <div class="detail-block">
            <h4>Architecture</h4>
            <p>${p.architecture}</p>
          </div>
          <div class="detail-block">
            <h4>Responsibilities</h4>
            <ul>${p.responsibilities.map(r => `<li>${r}</li>`).join("")}</ul>
          </div>
          <div class="detail-block">
            <h4>Results</h4>
            <ul>${p.results.map(r => `<li>${r}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    </article>
  `).join("");
}

/* -------------------------------------------------------------------------
   Gallery (gallery.html)
   ------------------------------------------------------------------------- */
function renderGallery() {
  const container = document.getElementById("gallery-grid");
  if (!container) return;

  container.innerHTML = galleryImages.map(img => `
    <div class="masonry-item" data-category="${img.category}">
      <img src="${img.src}" alt="${img.caption}" loading="lazy">
      <div class="masonry-caption">
        <h4>${img.caption}</h4>
        <span>${img.category}</span>
      </div>
    </div>
  `).join("");
}

function initGalleryFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".masonry-item");
  if (!buttons.length || !items.length) return;

  // "ALL" means all the travel/life categories — Photography is a separate,
  // dedicated set and only shows up when its own filter is selected.
  const applyFilter = (filter) => {
    document.querySelectorAll(".masonry-item").forEach(item => {
      const category = item.dataset.category;
      const match = filter === "ALL" ? category !== "Photography" : category === filter;
      item.classList.toggle("hidden", !match);
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    });
  });

  const activeBtn = document.querySelector(".filter-btn.active");
  applyFilter(activeBtn ? activeBtn.dataset.filter : "ALL");
}

/* -------------------------------------------------------------------------
   Site-wide search (used on gallery-search / dedicated search boxes)
   Expects an <input id="site-search"> and a <div id="search-results">
   ------------------------------------------------------------------------- */
function initSiteSearch() {
  const input = document.getElementById("site-search");
  const results = document.getElementById("search-results");
  const noResults = document.getElementById("search-no-results");
  if (!input || !results) return;

  const index = buildSearchIndex();

  const render = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) { results.innerHTML = ""; if (noResults) noResults.classList.remove("show"); return; }

    const matches = index.filter(item => {
      const haystack = (item.title + " " + item.type + " " + item.tags.join(" ")).toLowerCase();
      return haystack.includes(q);
    });

    if (!matches.length) {
      results.innerHTML = "";
      if (noResults) noResults.classList.add("show");
      return;
    }
    if (noResults) noResults.classList.remove("show");

    results.innerHTML = matches.map(m => `
      <a class="card-link" style="display:block; padding: 0.9rem 0; border-bottom:1px solid var(--color-border);" href="${m.url}">
        <strong>${m.title}</strong> <span class="pill" style="margin-left:0.5rem;">${m.type}</span>
      </a>
    `).join("");
  };

  input.addEventListener("input", (e) => render(e.target.value));
}

/* -------------------------------------------------------------------------
   Contact form (front-end only — no backend yet)
   ------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = document.getElementById("form-status");
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const message = form.querySelector("#message").value.trim();

    if (!name || !email || !message) {
      status.textContent = "Please fill in all required fields.";
      status.className = "form-status error";
      return;
    }

    // No backend is connected yet. This is where a future API/Firebase/
    // Formspree/EmailJS integration would send the form data.
    status.textContent = "Thanks for reaching out! (Form is not yet connected to a backend — see README for setup instructions.)";
    status.className = "form-status success";
    form.reset();
  });
}
