# Saurabh Maurya — Portfolio

Premium React + Vite portfolio combining the editorial layout with the scroll-driven 3D character sequence.

## Run

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Add more projects

Edit only:

`src/data/projects.js`

Add another object to the `projects` array. The Work section, count, tags and project modal update automatically.

## Character animation

The original animation uses 300 PNG frames. Because the supplied animation archive does not contain the 700+ MB image sequence, this package leaves the sequence folder ready for the original assets:

`public/character/male0001.png` … `public/character/male0300.png`

Once those files are copied in, the canvas automatically loads and maps the character to page scroll. The loader is designed to tolerate missing frames and progressively render as frames become available.

## Structure

- `src/main.jsx` — application composition
- `src/styles.css` — responsive light/dark visual system
- `src/components/CharacterSequence.jsx` — scroll-driven character renderer
- `src/components/Reveal.jsx` — reusable reveal animation
- `src/data/projects.js` — easy project management
- `public/icons/favicon.svg` — portfolio icon
- `site.webmanifest` — installable web app metadata
- `dist/` — production build

No Tailwind is used.

### About the included `dist/`

A standalone deployment-ready static version is included for quick hosting/testing. The normal React source remains the maintainable version; run `npm run build` on a machine with npm package access to regenerate the Vite production bundle.

## Error fix

Fixed the React runtime error `ReferenceError: React is not defined` in:
- `src/components/Reveal.jsx`
- `src/components/CharacterSequence.jsx`

Both JSX components now explicitly import React, so they work with the current Vite/React configuration.
