# [YOUR NAME] — Personal Portfolio, Life & Travel Journal

A static, framework-free (HTML/CSS/JavaScript) personal website combining a professional
portfolio, resume, travel journal, trekking journal, life stories, photography gallery and
the ViharaSetu founder project into one site.

No personal information has been invented. Anywhere you see `[BRACKETED PLACEHOLDER TEXT]`
or `YOUR_..._URL`, replace it with your real information.

---

## 1. Folder Structure

```
/
├── index.html              Home
├── about.html               About Me
├── career.html               Career timeline
├── resume.html                Resume
├── projects.html               Projects (rendered from js/data.js)
├── viharasetu.html              ViharaSetu founder page
├── travel.html                   Travel journal (rendered from js/data.js)
├── trekking.html                  Trekking journal (rendered from js/data.js)
├── life.html                       Life stories (rendered from js/data.js)
├── gallery.html                     Photo gallery + filters
├── contact.html                      Contact form
│
├── stories/
│   ├── travel-story-template.html    Blank reusable travel story template
│   ├── trekking-story-template.html  Blank reusable trekking story template
│   ├── sikkim-journey.html           Sample travel story (built from the template)
│   └── himalayan-trek.html           Sample trekking story (built from the template)
│
├── assets/
│   ├── images/
│   │   ├── profile/     Hero + profile photos
│   │   ├── travel/      Travel story images
│   │   ├── trekking/    Trekking story images
│   │   ├── viharasetu/  ViharaSetu brand + gallery images
│   │   └── gallery/     Main gallery + project/life images
│   ├── icons/           favicon.png
│   └── documents/       resume.pdf
│
├── css/
│   └── style.css         All site styling (design tokens at the top)
│
└── js/
    ├── data.js            Content arrays: travelStories, trekkingStories, lifeStories,
    │                      projects, galleryImages — edit this file to add new content
    └── script.js          Site behavior: nav, animations, rendering, filters, search
```

All current images are **auto-generated placeholder graphics** (colored gradients with a
label) so the site opens correctly with no broken images. Replace them with real photos
whenever you're ready — same filenames, same folders.

---

## 2. How to Run It in VS Code

1. Open the `DEVAMANI_BLOG` folder in VS Code (`File → Open Folder…`).
2. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions
   marketplace, if you don't already have it.
3. Right-click `index.html` → **"Open with Live Server"**.
4. The site opens at `http://127.0.0.1:5500/index.html` and auto-refreshes as you edit.

Alternatively, you can simply double-click `index.html` to open it directly in a browser
(everything works via relative paths — no server required), though Live Server is
recommended for the best editing experience.

---

## 3. Where to Add Your Photos

| What | Where |
|---|---|
| Hero background (homepage) | `assets/images/profile/hero-mountains.jpg` |
| Your profile photo | `assets/images/profile/profile.jpg` |
| Travel story cover/gallery photos | `assets/images/travel/` |
| Trekking story cover/gallery photos | `assets/images/trekking/` |
| ViharaSetu brand & gallery photos | `assets/images/viharasetu/` |
| General gallery / life / project photos | `assets/images/gallery/` |
| Your resume PDF | `assets/documents/resume.pdf` |
| Browser tab icon | `assets/icons/favicon.png` |

Just replace the file at the same path and filename — no HTML changes required. Keep
photos reasonably sized (under ~500KB each) for fast loading.

---

## 4. How to Add a New Travel Story

1. Copy `stories/travel-story-template.html` into `stories/` and rename it, e.g.
   `stories/goa-trip.html`.
2. Fill in the placeholders inside that file (title, location, day-by-day story, tips,
   gallery images, etc.).
3. Open `js/data.js` and add a new entry to the `travelStories` array:

```javascript
{
  id: "goa-trip",
  title: "Goa Getaway",
  location: "Goa, India",
  date: "2026",
  category: "Travel",
  tags: ["Travel", "Beach"],
  image: "assets/images/travel/goa-cover.jpg",
  description: "A short description shown on the travel journal card.",
  storyPage: "stories/goa-trip.html"
},
```

4. Save — the new story card appears automatically on `travel.html` and in site search.

---

## 5. How to Add a New Trekking Story

Same process as above, using `stories/trekking-story-template.html` and adding an entry
to the `trekkingStories` array in `js/data.js` (it has extra fields: `difficulty`,
`distance`, `altitude`, `duration`).

---

## 6. How to Update Your Professional Experience

- **Career timeline:** edit `career.html` directly — duplicate a `.timeline-item` block
  for each new role and fill in company, title, dates, responsibilities and technologies.
- **Resume:** edit `resume.html` directly (Professional Summary, Experience, Education,
  Certifications sections are all plain HTML you can edit in place).
- **Projects:** edit the `projects` array in `js/data.js` — add a new object with
  `problem`, `solution`, `architecture`, `responsibilities` and `results`; it renders
  automatically on `projects.html`.

---

## 7. How to Add Gallery Photos

Drop the image into `assets/images/gallery/` and add a matching entry to the
`galleryImages` array in `js/data.js`:

```javascript
{ src: "assets/images/gallery/new-photo.jpg", category: "Trekking", caption: "Trek Name" }
```

Valid `category` values (used by the filter buttons): `Travel`, `Trekking`, `Mountains`,
`Nature`, `Heritage`, `ViharaSetu`, `Professional`, `Memories`.

---

## 8. Updating Placeholders

Search the project for these tokens and replace them with your real information:

- `[YOUR NAME]`, `[YOUR PHOTO]`, `[YOUR LOCATION]`, `[YOUR EDUCATION]`
- `[COMPANY NAME]`, `[JOB TITLE]`, `[START DATE]`, `[END DATE]`, `[CLIENT NAME]`
- `YOUR_LINKEDIN_URL`, `YOUR_GITHUB_URL`, `YOUR_INSTAGRAM_URL`, `YOUR_YOUTUBE_URL`
- `[PHONE NUMBER]`, `[MOBILE NUMBER]`, `[YOUR PERSONAL EMAIL]`

VS Code tip: use **Ctrl+Shift+F** (Find in Files) to search the whole project for
`[YOUR NAME]` or any other placeholder and replace them one by one.

---

## 9. Contact Form

The contact form in `contact.html` is currently front-end only (no emails are actually
sent). To make it functional without building a backend, connect it to a free service
such as [Formspree](https://formspree.io) or [EmailJS](https://www.emailjs.com/) by
updating the `<form>` action or the `initContactForm()` function in `js/script.js`.

---

## 10. Deploying to GitHub Pages

1. Initialize git and push this folder to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. On GitHub, go to your repository → **Settings → Pages**.
3. Under **Source**, select the `main` branch and `/ (root)` folder → **Save**.
4. GitHub Pages will publish the site at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`
5. Any future `git push` to `main` automatically updates the live site.

---

## 11. Future Backend / CMS Options

The site currently has no backend — content lives in `js/data.js`. When you're ready to
manage content without editing code, this structure is ready to connect to:

- **Firebase / Supabase** — replace the static arrays in `data.js` with a `fetch()`
  call to your database, or fetch documents at page load and render the same way.
- **A REST API / small CMS** — same approach: the render functions in `script.js`
  (`renderTravelCards`, `renderTrekkingCards`, etc.) already accept plain JavaScript
  arrays, so you just need to populate those arrays from an API response instead of a
  hardcoded file.

No redesign is required — only the data source changes.
