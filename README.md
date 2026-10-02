# Sakura Moriyama – Researcher Portfolio

Static site (HTML/CSS/JS, no build step). All content lives in `data/*.js`.

## Local development
`python3 -m http.server 8000` then open http://localhost:8000

## Add content (one object per entry; copy an existing one)
- **Publication**: `data/publications.js` (`selected:true` shows on Home; `relatedResearch:["gpcr-trp"]`)
- **Award**: `data/awards.js` · **Funding**: `data/funding.js`
- **Activity**: `data/activities.js` (`category` must match a name in `activityCategories`)
- **News**: `data/news.js` (`links:[{type:"award",id:"lindau-2026"}]`)
- **Research theme**: `data/research.js`. Add `background`, `question`, `approach`, `findings`, `direction`; empty sections are hidden.
- **Photos**: put files in `assets/images/`, then use `photo:{src:"assets/images/x.jpg",alt:"description"}`
- **CV**: replace `assets/cv/cv.pdf`

## Researchmap sync (optional)
`node scripts/fetch_researchmap.mjs YOUR_PERMALINK` rewrites `data/researchmap.js` from the public API
(`https://api.researchmap.jp/<permalink>/published_papers`). Check the output once, since the field mapping is untested.
Papers in `publications.js` win over duplicates (same DOI), so put theme links there.

## Deploy to GitHub Pages
1. Create a repo, push this folder to `main`.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Replace `https://USERNAME.github.io/REPO/` in `index.html` (canonical, og:url, og:image).
