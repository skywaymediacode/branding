# Aquability - Brand Guide

A self-contained static site. Version 1.0, draft for client review.
Prepared by Skyway Media.

## Files

```
index.html                                  the guide (single page)
css/style.css                               all styles + design tokens
js/main.js                                  scrollspy, copy-to-clipboard, live WCAG engine
assets/favicon.png
assets/logo/aquability-logo-full-color.png  primary lockup, transparent
assets/logo/aquability-logo-white.png       white knockout, transparent
assets/logo/aquability-logo-navy.png        single colour #204279, transparent
assets/logo/aquability-mark.png             standalone mark, full colour
assets/logo/aquability-mark-white.png       standalone mark, white
assets/logo/aquability-mark-navy.png        standalone mark, navy
assets/logo/aquability-mark-navy.png        standalone mark, navy
aq logo.png                                 original client supply (unmodified)
info.txt                                    original client notes
```

The logo variants were derived from the supplied PNG. Solid brand areas are fully
opaque at exactly `#204279` and `#3896C6`; edges carry true antialiased alpha.

## Uploading

Drop the whole folder onto any static host - the paths are all relative and there
is no build step. `index.html` must sit at the root of whatever you upload.

Works on Netlify Drop, Cloudflare Pages, Vercel, S3, or plain FTP into a
subdirectory (e.g. `yourdomain.com/aquability-brand/`).

The page is marked `noindex, nofollow` so it will not show up in search while it
is a client draft. Remove that meta tag if you ever want it public.

## Fonts

Loaded from Google Fonts over CDN:

- **Newsreader** - display and headlines
- **Schibsted Grotesk** - interface and body
- **JetBrains Mono** - labels and technical detail

All three are SIL Open Font License: free for commercial use with no fee to the
client. Before the production site launches, download the woff2 files and
self-host them - faster, and it drops the third-party request.

## Local preview

Any static server works. From this folder:

```
npx serve .
```

Opening `index.html` directly from disk also works; only clipboard copy needs a
real origin, and it falls back gracefully.

## Notes for the build

- Design tokens live in `:root` at the top of `css/style.css` - the site can
  import that block verbatim.
- Contrast ratios in section 04 are computed live in the browser to WCAG 2.1, so
  the numbers are always accurate to the swatches. Change a swatch's `data-hex`
  in the HTML and the tool and matrix follow automatically.
- Section 12 contains seven website sections rendered at full size with real,
  usable copy. They are the intended starting point for the site build rather
  than illustrations, so the markup can be lifted directly.
- The supplied logo artwork is raster only. Commission a vector redraw (SVG and
  EPS) before anything goes to print or large format.
