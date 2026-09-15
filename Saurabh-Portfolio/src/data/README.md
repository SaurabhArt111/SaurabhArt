# `data/`

Content that's meant to be edited without touching component code.

## `projects.json` — Featured Work

To add a new project, append an object to the array. No other file needs to
change — `Work.jsx` reads this file directly and both the card and the
click-to-preview modal update automatically.

```jsonc
{
  "slug": "unique-url-safe-id",     // required, unique
  "title": "Display Name",          // required
  "tags": ["React", "Node.js"],     // required, shown under the title
  "contribution": "One sentence describing what you built.", // required
  "coverLabel": "DISPLAY NAME",     // required, shown if there's no preview/site
  "accent": "#7c9cff",              // optional, tints the mini HTML/CSS preview
  "preview": "dashboard",           // optional, see variants below
  "site": { "url": "https://...", "label": "Live" }, // optional — omit if no live demo
  "repo": "https://github.com/you/repo",             // optional
  "year": "2025"                    // optional, shown on the card
}
```

`preview` picks which pure CSS/HTML mini mockup renders on the card before
you have a real screenshot. Current variants (see
`src/components/sections/Work/WorkPreview.jsx`):

`editor` · `landing` · `dashboard` · `qr` · `uploader` · `chat` · `grid` ·
`calendar` · `quiz`

Leave `preview` out entirely for a plain label card instead. Add a new
variant by adding a case to `WorkPreview.jsx`'s switch.

## `gallery.json` — art & design pieces

Same idea — append an object per piece:

```jsonc
{
  "id": "unique-id",
  "title": "Piece title",
  "category": "Illustration",  // used for the filter tabs — reuse an existing
                                // category to group with it, or introduce a new one
  "medium": "Procreate",       // optional, small caption
  "year": "2025",              // optional
  "accent": "#ff6a4d",         // tints the placeholder tile until a real image exists
  "image": "/images/gallery/piece-01.jpg", // optional — omit until you have the file
  "span": "tall"                // optional layout hint: "wide" | "tall" | "square" (default)
}
```

Drop the actual image file in `public/images/gallery/` with the path you
referenced, and it replaces the generated placeholder automatically.
