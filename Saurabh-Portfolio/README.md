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
   points). **Hovering a word makes it breathe along its width** — see the
   particle layer section below. Reduced-motion visitors get the original
   static heading instead — see `ParticleTitle.jsx`'s early return.
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
7. **Interlude — the ∞ band** (`components/sections/Interlude`) — a held
   breath between the work and the offer. One moving object: a few thousand
   particles streaming around a figure-eight, which gather into
   "ARTIST · DESIGNER · DEVELOPER" as you scroll through the frame and let
   go again on the way out. Scrubbable — stop halfway and the sentence stays
   half-formed. No path is ever drawn; the ∞ exists only as particles.
8. **Connect** — Saurabh's real GitHub, LinkedIn and Instagram, with Feather
   (react-icons/fi) brand marks. Closes on the same three words as the
   opening, in the same dust, held still — cursor through them and they slip
   back into the ∞ stream.

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
    fx/           the particle + SVG motion layer (see below)
    sections/
      CharacterHero/  opening cover + ParticleTitle (the galaxy-to-text name)
      Hero/           "Interfaces that feel obvious..." — nav reveals here
      About/
      Stack/          "My Design Stack" orbit
      Work/           featured work, WorkPreview mockups, ProjectModal
      Gallery/        art & design grid + lightbox
      Interlude/      the ∞ particle band, mid-page
      Connect/
    lab/          TunnelType (used only by the /tunnel route)
  content/        static data that isn't project/gallery content (e.g. stack.js)
  data/           projects.json, gallery.json, README.md (schema + how-to)
  lib/            gsap setup, lenis helpers, i18n (English copy), theme, scene helper,
                  particles.js (shared canvas plumbing)
  pages/          Home, TunnelLab, NotFound
  App.jsx         route definitions
  main.jsx        app entry (ThemeProvider + LanguageProvider + router)
  index.css       design tokens, light/dark theme variables, glass-morphism utility
public/
  character/      the hero-sequence frames
  images/         icons + issuer logos
```

## The particle & SVG motion layer

Everything canvas-based shares one module, `src/lib/particles.js`: palette
reading, text sampling, the ∞ maths, and a frame loop. The components on top
of it stay about motion rather than bookkeeping.

**`fx/AmbientParticles`** — the dust over every page. Deliberately almost
invisible. One fixed instance per route, painted above the stacked scenes
(each scene has an opaque background, so a layer *behind* them would never be
seen) and below the nav; a denser instance lives inside the opening frame.
Dots drift on individual orbits rather than a shared direction, and **scroll
velocity smears them** into faint vertical streaks that settle when you stop
— the effect answers what the reader is doing instead of looping regardless.

**`sections/CharacterHero/ParticleTitle`** — the wordmark, in three states.

*Assembling*: particles fly in from a scattered shell across the first slice
of the hero scroll.

*Resting*: every dot travels. A wordmark parked on fixed pixels is a stencil
— legible but dead — so at rest each particle rides a conveyor along its own
row of the letterforms, left to right, wrapping at the end, with an orbital
wobble, a shimmer wave crossing the width, a few embers that wander out of
the strokes, and a slow 3D drift over the top. Two things about that flow
were only found by simulating ten minutes of playback (`buildFlowRows` and
`advanceFlow` in `lib/particles.js` carry the full notes): a random-walk
migration drains the dust into a pile — 58% left/right skew, the letters
visibly rotting — where beads on a per-row loop keep coverage even *by
construction*; and the gap between one letter's stem and the next must be
skipped rather than travelled, or the dots paint dust in the air between
letters. Budgeting particles by widening the sample stride, rather than
thinning a dense sample, is what keeps neighbouring slots actually
neighbouring so that gap test can work at all.

*Hovered*: the word breathes along its width —
the letterforms stretch past the edges of the screen, squash vertically as
they widen (a wide thing has to give somewhere), ripple outward from the
centre, split into two colour-offset copies, bank in 3D, and streak while
they travel — then collapse back and do it again. The warp is applied to the
*flowing* position, so the current keeps running underneath the stretch
rather than freezing during it. The warp is driven by each
particle's normalised position *inside its own word* (`u` = -1 at the left
edge, +1 at the right), so outer letters travel furthest and the middle
barely moves. That's what makes it read as one elastic object rather than a
few thousand unrelated dots drifting apart. Clicking fires a shockwave ring;
dragging still orbits the field.

**`fx/ParticleMorph`** — one field with two states and a blend between them.
At `0` the particles ride a lemniscate of Gerono as a continuous stream:
dense at the path, thinning outward, streaking along the direction of travel,
the whole ribbon tilted and swinging slowly so the two loops pass in front of
and behind each other. At `1` the same particles settle onto the pixels of a
line of type. Anything between reads as the sentence dissolving into the
stream. The mid-page band scrubs that value with scroll; the closing band
sits at `1` and scatters back to flow under the cursor.

**`fx/SvgFlourish`** — two pieces of vector motion, both reporting something
rather than decorating. `orbit` is a dial of rings turning at different rates
with a marker on each, used beside the ∞ band where the subject *is*
continuous motion; it's pure CSS rotation of grouped geometry, so it needs no
SMIL. `thread` is a divider that draws itself as you scroll past, with a
marker riding the curve it has drawn — the stroke's progress is the section
boundary being crossed.

**`fx/ScrollProgressRing`** — an SVG arc whose `stroke-dashoffset` tracks
document progress, with the percentage in the middle; the arc *is* the
reading position. Doubles as back-to-top through the site's existing anchor
handling. Hidden through the opening sequence, on the same rule as the nav.

### Cost control

- Every canvas parks its `requestAnimationFrame` loop when it scrolls off
  screen or the tab is hidden (`createVisibleLoop`) — a dozen idle fields on
  a page this long would quietly drain a laptop.
- `dt` is normalised to 60fps and clamped, so motion runs at the same speed
  on a 144Hz display and a backgrounded tab can't resume with one huge jump.
- Particle budgets and device-pixel-ratio are both capped, and roughly
  halved on phone widths. Sub-pixel dots draw as `fillRect` rather than
  `arc()`, and trails batch into a single stroked path per frame.
- Colours come from CSS custom properties as `r,g,b` triplets, so the fields
  re-tint themselves when the theme flips and every colour decision stays in
  the stylesheet. Type is re-sampled once `document.fonts.ready` resolves, so
  the particles trace Manrope rather than the fallback face.
- `prefers-reduced-motion` removes all of it: the ambient field returns
  `null`, and both morph bands and the wordmark fall back to real text.

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
