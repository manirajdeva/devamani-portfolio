# Cinematic layer

Source for the 3D scene, smooth scrolling and page curtain that every page loads (`js/main.js` injects
`assets/cine/cine.js` + `cine.css`). The reference look comes from the `viharasetu` demo project.

```bash
cd cinematic
npm install
npm run build      # writes ../assets/cine/  (commit the output: GitHub Pages serves it as plain files)
npm run dev        # rebuild on change
```

- `src/cine.ts` – scene mounting, Lenis, GSAP scroll story (home) and calm waves (other pages), page curtain
- `src/cine.css` – layer, home sections, curtain
- `src/engine/` – Three.js particle engine (`capsuleData.ts` holds the floating tool labels)
- Home markup lives in `index.html` (`#cine-story`); `body[data-cine="home"]` turns the full story on.
