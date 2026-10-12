# DEVAMANI — Streaming-style Portfolio

A dark, cinematic, streaming-platform-style personal site (plain HTML, CSS and vanilla JS —
no build step, runs on GitHub Pages). The "DEVAMANI" wordmark and every visual are original;
no third-party logos or trademarks are used.

Anything marked **`[EDIT]`** is placeholder text waiting for your real details.

## Folder structure

```
index.html            Splash + "Who's watching?" picker + hero + all content rows
resume.html           Resume styled as a show's "About" page (Seasons, Cast & Crew)
contact.html          "Ready to watch? Let's connect." email form + FAQ accordion
viharasetu.html       ViharaSetu founder page
stories/              Travel / trekking story pages (+ blank templates)
inspirations/         My Family, Nims Dai story pages
css/style.css         The whole design system (numbered sections)
js/data.js            Career, travel, trekking, life, projects, gallery data
js/content.js         Skills, Top 10, Continue Watching, ViharaSetu Originals, bio
js/main.js            Header/footer, rows, cards, modal, search, profiles, splash
assets/               images/ (profile, travel, trekking, viharasetu, gallery…), documents/resume.pdf
```

## How it works

- **Rows** are built at load time from `data.js` + `content.js`. Add an object to an array and a
  new card appears — no HTML editing.
- **Profiles** (Recruiter / Data Engineer / Traveler / ViharaSetu) only reorder the rows. The
  choice is stored in `localStorage` (`dm.profile`); "Switch profile" is in the avatar menu.
- **My List** (+) and **Likes** (thumbs-up) are also stored in `localStorage`.
- **Splash** plays once per browser session (`sessionStorage`), is skippable, and is skipped
  automatically for `prefers-reduced-motion`.
- **Search** filters every card by title, type, description or tag.
- **Header and footer** are injected by `main.js` on every page, so edit them in one place
  (`headerHTML()` / `footerHTML()`).

## Common edits

| To change… | Edit |
|---|---|
| Hero text, title, buttons | `index.html` (`<header class="hero">`) |
| Hero image / optional video | `index.html` → `.hero-bg` |
| Skills, Top 10, Continue Watching, ViharaSetu cards | `js/content.js` |
| Jobs, trips, treks, projects, gallery | `js/data.js` |
| Profile row order | `PROFILES` in `js/main.js` |
| Colours / fonts | CSS variables at the top of `css/style.css` |
| Contact form target | `initContactForm()` in `js/main.js` (mailto by default; swap in Formspree) |

## Adding a new story page

Copy `stories/travel-story-template.html` (or the trekking one), fill it in, then add an entry
to `travelStories` / `trekkingStories` in `js/data.js` with `storyPage` pointing at the new file.

## Deploy (GitHub Pages)

Push to `main`; Pages serves the repo root. Preview locally with `python -m http.server 8000`
and open http://localhost:8000.
