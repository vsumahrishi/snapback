# SnapBack — Web app (GitHub Pages)

**Build:** v258

## What to keep
Delete old SnapBack web folders on your laptop. Keep only the contents of **SNAPBACK-WEB-v258**.

Required files (all inside the zip):
- `index.html` — the full app
- `sw.js` — service worker (offline / updates)
- `manifest.json` — install as app
- icons (`icon-192.png`, `icon-512.png`, etc.)
- `README-WEB.md` (this file)

## Publish (GitHub Pages)
1. Open your repo: https://github.com/vsumahrishi/snapback
2. Upload / replace these files on the **main** branch (root of the repo, or the folder Pages is set to).
3. Settings → Pages → Deploy from **main** / root (or `/docs` if that is what you use).
4. Site URL: **https://vsumahrishi.github.io/snapback/**
5. Hard-refresh the browser (Ctrl+Shift+R) or open in a private window after deploy.

## Students
They open the GitHub Pages URL above. Sign in with Google or username. No Firebase paste required for them if config is already baked in.

## Tour
Settings → **Take a tour**. Works on phone and desktop.

## Tasks page
- **Open** / **Completed** / **Add task** — tap header to expand or collapse.
- Only one panel open at a time.
- Leaving **Add task** with typed text asks before discarding.

## Projects
- **Open projects** / **Closed projects** — collapsible.
- Tap a **title** to expand progress, Open, Download PDF, Delete.
- Delete asks for confirmation.
