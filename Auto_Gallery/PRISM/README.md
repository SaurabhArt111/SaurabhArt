# PRISM — JERN Stack

PRISM is a personal media vault rebuilt from the supplied Cinema Edition HTML into **JERN: JSON + Express + React + Node.js**, using **Normal CSS** only. The original cinematic UI/UX is preserved while persistence and media discovery move to the Node/Express backend.

## Structure

```
PRISM/
├── frontend/   React + Vite + Normal CSS
├── backend/    Node.js + Express + JSON + media scanner
├── data/       config.json, users.json, media.json, activity.json, images/, videos/
└── package.json
```

## Run

1. Install Node.js 20+
2. From the project root: `npm install`
3. Install both apps: `npm run install:all`
4. Start development: `npm run dev`
5. Open `http://localhost:5173`

For a production build: `npm run build` then `npm start`.

## Media

Put image files in `data/images/` and video files in `data/videos/`. The backend scans supported formats and writes the index to `data/media.json`. Settings can trigger a rescan.

## Performance

Large collections use a responsive **flex-column Pinterest-style masonry layout** for both images and videos. Image cards keep a fixed column width while height follows the source aspect ratio; there is no forced thumbnail height. Images use native lazy loading/async decoding. Video cards do **not** mount/play the actual video file in the gallery, so scrolling through a large library does not fill the browser cache; the real video is loaded only when its modal is opened. Progress uses a 5-second throttle with immediate saves on pause/end/close. Progress events are not added to `activity.json`, preventing unnecessary disk writes. The backend serves videos with explicit HTTP byte-range support and `Cache-Control: private, no-store` so large videos do not accumulate in browser cache. A one-time startup cleanup also removes stale service-worker/cache data left by older PRISM builds.

No Tailwind, Bootstrap, Three.js, WebGL or Canvas dependency is used.
