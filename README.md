# Culture

A fast, installable timetable planner for JIIT Biotechnology students — schedule, electives, and free-slot lookup by day and batch. Pure static site (HTML/CSS/JS), no framework, no backend.

## Project structure

```
index.html      Markup
style.css       Styling (dark theme, CSS variables)
script.js       Rendering logic, reads TT_DATA from data.js
data.js         Generated timetable data (do not hand-edit — see below)
build_data.py   Parses timetable.xlsx + faculty.xlsx into data.js
timetable.xlsx  Source timetable spreadsheet
faculty.xlsx    Source faculty-code lookup spreadsheet
manifest.json   PWA manifest (installable, home-screen icon)
sw.js           Service worker (offline caching of the app shell)
favicon.svg, icon-192.svg   Icons
```

## Regenerating the data

`data.js` is generated, not hand-written. Whenever `timetable.xlsx` or `faculty.xlsx` changes:

```bash
python3 build_data.py           # one-off build
python3 build_data.py --watch   # rebuild automatically on file changes
```

Requires `openpyxl`:

```bash
pip install openpyxl
```

## Running locally

No build step is needed for the site itself — it's static HTML/CSS/JS.

```bash
npm install -g serve   # or: npx serve .
npm start              # serves on http://localhost:5000
```

Any static file server works (`python3 -m http.server`, VS Code's Live Server, etc.).

## Deploying

Since this is a static site, it can be deployed as-is to any static host:

- **Vercel / Netlify / GitHub Pages / Cloudflare Pages**: point the host at the project root — no build command needed.
- Make sure `data.js` is committed/deployed alongside the other files (it's the app's only data source).
- Because of the service worker, deploying a data update requires bumping `CACHE_NAME` in `sw.js` so returning visitors pick up the new build promptly (the data file itself is fetched network-first, but the app shell is cache-first).

## Notes

- The app fails gracefully (shows a "couldn't load the timetable" message) if `data.js` is missing, empty, or malformed, instead of showing a blank screen.
- Works offline after first load via the service worker; the timetable data refreshes automatically when a connection is available.
- Tested primarily for the current Biotech (C-batch) timetable; `build_data.py`'s manual elective/legend tables (`MANUAL_ELECTIVES`, `SHORT_CODE_NAMES`) will need updating each semester when subject codes or elective options change.

## License

MIT — see [LICENSE](LICENSE).
