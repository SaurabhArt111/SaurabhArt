# Saurabh Maurya — Portfolio (Vite + React + CSS)

This started as a Vite/React conversion of a UX-designer portfolio template,
then merged with Saurabh's own portfolio (`Portfolio-SM`), then substantially
reworked into its own thing: a particle-based hero title, a light/GitHub-dark
theme with a reveal-wipe transition, glass-morphism surfaces, an interactive
work section, and a data-driven content system so new projects or art pieces
don't require touching component code.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## What's on the page

1. **Opening character study** (`components/sections/CharacterHero`) — a
   100-frame scroll-scrubbed canvas sequence. The name and tagline over it
   are `ParticleTitle`: a few thousand canvas particles that start scattered
   like a star field and converge into "SAURABH / MAURYA" and
   "ARTIST · DESIGNER · DEVELOPER" over the first slice of the scroll.
   Hovering repels nearby particles; pressing and dragging orbits the whole
   field in a hand-rolled 3D projection (no WebGL needed for a few thousand
   points). Reduced-motion visitors get the original static heading instead
   — see `ParticleTitle.jsx`'s early return.
2. **Hero** — "Interfaces that feel obvious. Code that just works." The nav
   is invisible until this section is reached (see Nav below).
3. **About** — Saurabh's real bio.
4. **My Design Stack** — Saurabh's real toolkit, in the orbiting-card visual.
5. **Work** — reads `data/projects.json` directly; see "Adding content"
   below. Each card's cover is either a real screenshot (if you add one), a
   `WorkPreview` — a small live-rendered HTML+CSS mockup standing in for a
   screenshot — or a plain label, and clicking it opens `ProjectModal` with
   the live site embedded in an iframe (or a details fallback if there's no
   live URL).
6. **Gallery** — art and design work, separate from the dev projects above.
   Reads `data/gallery.json`. Filterable by category; pieces without an
   `image` yet render as a tinted placeholder with a small animated SVG
   doodle rather than a broken image, so the section still looks intentional
   before real art is dropped in.
7. **Connect** — Saurabh's real GitHub, LinkedIn and Instagram, with Feather
   (react-icons/fi) brand marks.

## Adding content — no code changes needed

- **New project** → append an object to `src/data/projects.json`.
- **New art/design piece** → append an object to `src/data/gallery.json`.

Full field reference for both files: `src/data/README.md`.

## Project structure

```
src/
  components/
    layout/       Nav, Scene, ThemeToggle, SmoothScroll
    ui/           Button, VelocityMarquee
    sections/
      CharacterHero/  opening cover + ParticleTitle (the galaxy-to-text name)
      Hero/           "Interfaces that feel obvious..." — nav reveals here
      About/
      Stack/          "My Design Stack" orbit
      Work/           featured work, WorkPreview mockups, ProjectModal
      Gallery/        art & design grid + lightbox
      Connect/
    lab/          TunnelType (used only by the /tunnel route)
  content/        static data that isn't project/gallery content (e.g. stack.js)
  data/           projects.json, gallery.json, README.md (schema + how-to)
  lib/            gsap setup, lenis helpers, i18n (English copy), theme, scene helper
  pages/          Home, TunnelLab, NotFound
  App.jsx         route definitions
  main.jsx        app entry (ThemeProvider + LanguageProvider + router)
  index.css       design tokens, light/dark theme variables, glass-morphism utility
public/
  character/      the hero-sequence frames
  images/         icons + issuer logos
```

## Notes

- **Language**: the site is English-only. `lib/i18n.jsx` exposes a `t(key)`
  helper backed by a flat English dictionary — the old EN | FR switch has
  been replaced by the theme toggle.
- **Theme + reveal wipe**: light and a GitHub-dark-inspired dark theme,
  toggled via the sun/moon control in the nav. Switching plays a fast
  diagonal wipe — sourced from a reference video — that sweeps from the
  toggle's top-right corner down to bottom-left: a same-color curtain covers
  the screen, the theme flips underneath (invisible, since the curtain
  already matches), then it retracts along the diagonal to reveal the new
  theme. No DOM snapshotting, so it's cheap and works in every browser; see
  `lib/theme.jsx`. Choice persists to `localStorage`, falls back to the OS
  preference on first visit, no flash-of-wrong-theme on load. Nearly every
  surface runs on the CSS custom properties in `index.css` — `--bg`,
  `--surface`, `--ink`, `--line`, `--chrome`, plus a `--glass-*` set used by
  the `.glass-panel` utility for the frosted-glass elements (nav pill, hero
  stat cards, work-cover hover state, both modals).
- **Nav reveal**: hidden through the opening character-study cover, fades in
  once Hero is reached, hides again scrolling back above it — see the
  ScrollTrigger in `components/layout/Nav.jsx`.
- **Work → live preview**: each cover expands slightly on hover/focus and
  reveals a "View Live" affordance; clicking it opens `ProjectModal`, which
  embeds the project's live site in an iframe via a `document.body` portal.
- **Icons**: react-icons' Feather set (`react-icons/fi`) throughout.
- **Performance**: the hero-sequence frames preload eagerly on mount; the
  particle title caps itself at ~3,000 points and skips entirely for
  reduced-motion visitors. Both are fine for a demo but worth a second look
  (fewer frames/WebP for the sequence, a lower particle cap on low-end
  devices) before a high-traffic launch.

## Deliberately left out

The original UX-template also had **Experience**, **Certifications** and a
**Journey** (life-story) section — all built around specific facts belonging
to that template's persona (named employers, a credentialed certification, a
personal timeline) that aren't Saurabh's own. Removed outright rather than
relabeled, along with their content files and the old `Intro/TunnelIntro`
(already unused before this pass — the character-hero had already replaced
it as the page's opening).
