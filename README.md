# Crave — Chennai (local static site)

A single-page, self-contained restaurant site for **Crave, Chennai**. The layout,
scroll choreography, intro loader, cursor, marquees, vector map and the WebGL 3D
scenes (hero, "build", drinks, rain) are a pixel-faithful clone of
<https://bar-topas.ch/> with all copy replaced by the Crave content.

All assets are local: the page makes no network requests of its own, and no
analytics or tracking is included.

## Run it

The page uses ES modules and an import map, so it must be served over HTTP
(opening `index.html` directly with `file://` will not work).

```powershell
cd C:\Users\syeda\OneDrive\Desktop\crave
python -m http.server 8123 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8123/>.

Any static server works; no build step, no npm install.

## Layout

```
index.html            full page markup (import map, inline map data at the end)
assets/css/main.css   all styles
assets/fonts/         self-hosted woff2 files
assets/img/           photos, wordmarks, dish lettering, map, textures
assets/js/app.js      boot sequence
assets/js/modules/    intro, scroll, sections, cursor, preload, map, credit, status
assets/js/gl/         WebGL stage, scenes, food/dishes, textures, noise
assets/vendor/        three.js r186, GSAP 3.15, Lenis 1.26
.preview/             screenshot scratch output from the fidelity checks (safe to delete)
```

## Content notes

- Copy is English (en-IN). The decorative Spanish/French phrases of the original
  were replaced with English equivalents of the same length so the typography
  and line breaks still work.
- The CRAVE wordmarks (header badge, hero, intro, footer lockup, 3D flag) are
  generated as real vector outlines from the Archivo variable font, so they do
  not depend on a webfont being available at runtime.
- Dish names use one canonical mapping per file: Masterpiece Burger, Texas
  Fillet, Double Patty Beef, Ocean Delight, Deep Sea, Nashville Chicken,
  Hot & Honey Tender, Chicken Pops, Crunch Mania Fries, Sashimi Loaded Fries,
  Chicken Loaded Fries, Classic Fish & Chips, Mexican Salsa, Dynamite Pops,
  Watermelon Mojito, Spicy Chicken Wings.
- Hours come from the brief: Mount Road, near LIC Metro (B3) — 5 PM to 2 AM
  Sun–Fri, 5 PM to 3 AM Sat; Anna Nagar, C37 2nd Avenue — from about 6:30 PM to
  2 AM. The live open/closed badge uses `Asia/Kolkata` and handles the overnight
  window (including carry-over from the previous night).
- No prices, phone numbers, promotions or delivery claims are shown; none were
  in the supplied copy.
- The map is a stylised plan: an abstract aerial backdrop plus OpenStreetMap
  derived line geometry and attribution. It is not a survey-accurate map.

## Artwork still from the original clone

The copy is Crave's, but a few visual assets are still the originals and would
need replacing before this could go live:

- **Photography** (`assets/img/photos/`) — hero, gallery, "build" and "amigos"
  shots are the Topaze restaurant photos. No Crave photography was supplied.
- **Hand-drawn illustrations** (`assets/img/illu/`) — the pinchos, cazuela and
  amigos line drawings, plus the hero motif.
- **3D art direction** (`assets/js/gl/`) — the burger, chicken, fries and drink
  scenes are procedural, but their shapes, colours and lighting were matched to
  the original artwork.

Everything else — wordmarks, dish lettering, section signs and the map base —
has been regenerated for this build.

## Rights

The layout, code and animation system belong to the original site's authors
(Piqo, e-medias). The Topaze photography and illustrations belong to Bar Le
Topaze. This copy is for local inspection/development only — clear the rights
and swap the remaining artwork before publishing.
