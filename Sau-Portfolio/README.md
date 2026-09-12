# Saurabh Maurya — Portfolio (Vite + React + CSS)

This started as a Vite/React conversion of a UX-designer portfolio template,
then merged with Saurabh's own portfolio (`Portfolio-SM`): his scroll-driven
character-study hero opens the page, and his real About copy, skills, 10
projects and social links replace the template's content throughout.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## What's on the page, and where its content comes from

1. **Opening character study** (`components/sections/CharacterHero`) — a
   100-frame scroll-scrubbed canvas sequence, ported from Saurabh's own
   Portfolio-SM. The original scaled its scroll progress off the whole
   document's height, which only worked on a short single-page site;
   embedded ahead of everything else here, it now reads its own local
   scroll range instead (same technique the rest of the site already uses).
2. **Hero** — "Interfaces that feel obvious. Code that just works." — kept
   the template's design, rewrote the copy and stats to be honest ones:
   10+ projects, 3 disciplines, 14 tools, all sourced from Saurabh's actual
   content rather than invented.
3. **About** — Saurabh's real bio, in the template's layout.
4. **My Design Stack** — Saurabh's real toolkit (React, Vite, Node.js,
   MongoDB, CorelDRAW, Git, etc.), in the orbiting-card visual.
5. **Work** — Saurabh's 10 real projects (`content/projects.js`). Cards
   link straight to each project's live site or GitHub repo — there's no
   in-app case-study page, since Saurabh's project data doesn't include
   the process/decisions/outcomes prose that page was designed to show for
   the original template's UX case studies.
6. **Connect** — Saurabh's real GitHub, LinkedIn and Instagram, with Feather
   (react-icons/fi) brand marks. No public email was available, so the
   primary CTA points to LinkedIn instead of a `mailto:` link.

## Deliberately left out

The original template also had **Experience**, **Certifications**, a
**Journey** (life-story) section and a **Gallery** — all either built around
specific facts belonging to that template's persona (named employers, a
credentialed certification, a personal timeline) or, in the Gallery's case,
never actually rendered on the page and pointing at photos that don't exist
in `public/`. None of that is Saurabh's own content, so rather than ship
dead code and broken images, these have been removed outright (not just
unused — deleted) along with their content files
(`content/journey.js`, `content/experience.js`, `content/certifications.js`,
`content/gallery.js`) and the old `LanguageToggle`. If real content for any
of them comes along later, they're straightforward to rebuild as a new
`Scene` in `pages/Home.jsx`, the same way Work or About are wired in.

The old tunnel-through-type intro (`Intro/TunnelIntro`) was already replaced
by the character-hero as the page's opening before this pass, and has been
removed for the same reason — it was never rendered.

## Project structure

```
src/
  components/
    layout/       Nav, Scene, ThemeToggle, SmoothScroll
    ui/           Button, VelocityMarquee
    sections/
      CharacterHero/  the opening character-sequence cover
      Hero/           "Interfaces that feel obvious..." — nav reveals here
      About/
      Stack/          "My Design Stack" orbit
      Work/           featured work + ProjectModal (iframe case-study preview)
      Connect/
    lab/          TunnelType (used only by the /tunnel route)
  content/        static data (projects, stack)
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

- **Language**: the site is English-only. The old EN | FR switch has been
  removed in favor of the light/dark theme toggle in the header; `lib/i18n.jsx`
  still exposes the same `t(key)` helper every component uses, just backed by
  a flat English dictionary now.
- **Theme**: a light theme and a GitHub-dark-inspired dark theme, toggled via
  the sun/moon control in the nav (persisted to `localStorage`, falls back to
  the OS preference on first visit, no flash-of-wrong-theme on load). Nearly
  every surface is driven by the CSS custom properties in `index.css` —
  `--bg`, `--surface`, `--ink`, `--line`, `--chrome`, plus a `--glass-*` set
  used by the `.glass-panel` utility for the frosted-glass elements (nav
  pill, hero stat cards, work-cover hover state, the project modal).
- **Nav reveal**: the header is invisible through the opening character-study
  cover and fades/slides in once the visitor reaches Hero ("Interfaces that
  feel…"); it hides again scrolling back above it. See the ScrollTrigger in
  `components/layout/Nav.jsx`.
- **Work → live preview**: each `work-cover` expands slightly on hover/focus
  and reveals a glass-morphism "View Live" affordance; clicking it (or the
  card's own open-case-study control) opens `ProjectModal`, which embeds the
  project's live site in an iframe via a `document.body` portal. Projects
  without a `site.url` fall back to a details panel with a GitHub link
  instead of a broken embed.
- **Icons**: react-icons' Feather set (`react-icons/fi`) is used throughout
  for the nav menu, theme toggle, social links, and work/modal actions.
- **Performance**: the hero-sequence frames preload eagerly on mount. Fine
  for a demo; worth revisiting (fewer frames, WebP, or progressive loading)
  before a real launch if load time matters.
