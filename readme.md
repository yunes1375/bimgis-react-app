# BIM·GIS Blueprint Design System

A dark, technical **"Blueprint"** design system for **BIM·GIS Atlas** — a workspace that overlays
**BIM** building models (IFC files, 3D structural data) onto **GIS** geographic basemaps so that
model and site live in one coordinate space. Think: drag a tower's IFC model onto a satellite map,
georeference it, inspect drift in centimetres, and re-snap alignment in the field.

The whole system is engineered around two domain colors — **teal = BIM**, **orange = GIS** — sitting
on near-black blueprint navy, with a faint masked grid behind everything. Type is compact and
dashboard-scale; mono uppercase micro-labels are everywhere.

---

## Sources

This system was reconstructed from the author's open design-system repository. Explore it for deeper
context (component source, Storybook stories, tokens):

- **GitHub:** https://github.com/yunes1375/bimgis-design-system (branch `master`)
  - `src/tokens/*.css` — the original token files (colors, type, space, radius, shadow, grid)
  - `src/components/**` — 25 React + CSS components grouped as data / display / inputs / layout / patterns / surfaces
  - Built with Vite (library mode) + Storybook 8; package name `bimgis-design-system`
- Related author repo referenced for product framing: https://github.com/yunes1375/flaskproject ("for bim&gis integration")

> The reader may not have access to these — everything needed is reproduced in this project. Links are
> kept so you can go to the source to do an even more faithful job.

---

## Content fundamentals

**Voice — terse, technical, engineering-room.** Copy reads like a CAD/GIS tool, not marketing.
Short noun phrases and imperatives; no exclamation, no fluff.

- **Casing:** Sentence case for headings and body. **UPPERCASE mono** for micro-labels, status pills,
  table headers, KPI labels, and footer links (with `0.08em` letter-spacing).
- **Person:** Mostly impersonal / object-labelled ("Adjust alignment", "No GIS layers linked"). Second
  person only in hints ("Align model to basemap"). Almost never "we".
- **Domain vocabulary is load-bearing.** Use the real terms: *georeference, drift, offset, re-snap,
  basemap, CRS / EPSG, IFC, IfcWallStandardCase, parcel, WFS, easting/northing, elevation, storey*.
- **Numbers are first-class.** Always unit-suffixed and mono: `±0.42 m`, `EPSG:3857`, `248 elements`,
  `1 : 1,200`. Tabular figures so columns line up.
- **Buttons** are verb-first and specific: "Upload IFC", "Inspect", "Apply & re-snap", "Adjust
  alignment…", "Open" — not "Submit" / "Click here".
- **Status language** is a small fixed set: `Aligned` (ok), `Drift` (warn), `Failed` (error),
  `Importing` (neutral), `Draft`.
- **Tone in empty/error states** is helpful and instructional, one sentence: *"Connect a basemap or WFS
  source to overlay this model on its site."*
- **Emoji:** none. The brand uses **geometric Unicode glyphs** as iconography instead (see Iconography).

---

## Visual foundations

**Mood.** Nocturnal control-room. Everything sits on near-black navy (`#090b11`) with a faint blueprint
grid masked into the top-right corner. Surfaces are barely-lifted dark slabs separated by 8–16% white
hairlines, not heavy borders or big shadows.

- **Color.** Backgrounds step `bg-3 → bg-1 → bg-2 → surface → surface-2` from `#070910` to `#161b27`.
  Two domain accents do almost all the talking: **teal `#36e0d4` (BIM)** and **orange `#ff9a52` (GIS)**.
  Status adds **ok `#5bd0a0`**, **warn `#f0c466`**, **error `#ff7373`**. Text ramps
  `#e8ecf1 → #9aa7bd → #828ea3`. Accent fills are always *low-alpha tints* of the accent (≈14–28%) with a
  slightly stronger same-hue border — never flat saturated blocks in UI.
- **Type.** Three families: **Space Grotesk** (headings, `-0.01em` tracking, weight 600), **Inter**
  (body/UI, 14/13px, line-height 1.55), **IBM Plex Mono** (labels, data, code; uppercase micro at 11px).
  Compact ramp: 32 / 22 / 16 / 14 / 13 / 11px.
- **Spacing.** 4px base (`--sp-1`=4 … `--sp-8`=64). Dense by default — buttons are 26–40px tall,
  inputs 8×12px padding.
- **Corners.** Tight and technical: 3 / 4 / 6px, plus full pills (`999px`) for status chips and FABs.
  Nothing is softly rounded.
- **Borders & lines** carry the structure: `1px solid rgba(255,255,255,0.08)` subtle,
  `0.16` strong. The blueprint feel comes from lines, not fills.
- **Shadows** are deep and soft, only on things that truly float: `--shadow-card` (modals/raised cards),
  `--shadow-pop` (toasts/menus), `--shadow-fab` (map controls). Flat surfaces get no shadow.
- **Backgrounds / imagery.** No photography in chrome. The signature is `.bp-grid-backdrop`: a 30px line
  grid, `z-index:-1`, radial-masked so it fades from the top-right. The map canvas is an abstract dark
  terrain (radial glows + faint contour hatching), never a stock photo.
- **Transparency & blur.** Floating UI over the map uses glassy fills: `rgba(15,25,45,0.92)` +
  `backdrop-filter: blur(6–8px)` on Panels, FABs, the basemap picker and GPS badge. Solid surfaces
  (cards, tables, dialogs) are opaque.
- **Gradients** are used sparingly and purposefully: the brand mark and `accent` card top-rule run
  **teal→orange** (the literal BIM→GIS handshake); the primary button is a subtle teal→teal
  `145deg` gradient. No purple, no rainbow, no decorative blurred blobs.
- **Animation.** Fast and mechanical — `80–220ms`, mostly `linear` or `cubic-bezier(0.4,0,0.2,1)`.
  Spinners rotate at `0.7s linear`. Drawers slide with `cubic-bezier(0.22,1,0.36,1)`. No bounce, no
  infinite decorative loops.
- **Hover** = brighten (`filter: brightness(1.12)`) or a faint white wash (`rgba(255,255,255,0.04)`) +
  shift muted text to full/accent. **Press** = `translateY(1px)`. **Focus** = `2px` teal outline.
  Disabled = `opacity: 0.5`.
- **Cards** = `--brand-surface` fill, `1px` subtle border, `6px` radius, `overflow:hidden`; optional
  `raised` (shadow) or `accent` (teal→orange 2px top hairline). Header/footer divided by hairlines;
  footer sits on a slightly darker `rgba(0,0,0,0.18)` bar.
- **Layout.** Sticky blurred top bar; content max-width ~1080px on marketing/list screens; the map
  workspace is full-bleed with absolutely-positioned floating panels (layers left, inspector right,
  FAB controls bottom-left, KPI strip bottom-right).

---

## Iconography

The brand deliberately **avoids an icon font or large SVG icon set**. Instead it uses **geometric
Unicode glyphs** as lightweight, monochrome icons that inherit `currentColor` — keeping the technical,
low-chrome feel and zero asset weight.

- **Glyphs in use:** `◎` locate · `⊞` 3D model · `↥` upload/layers · `◰ / ◳` basemap / empty ·
  `⌕ / ⌖` search · `⌃⌄ ▲▼ ↕` sort/expand · `± △ ▽` deltas · `× − +` close / nudge · `☰` menu ·
  `• ✓ ! ×` toast tones · `–` flat trend. Bars in `GpsAccuracyBadge` are drawn with `<span>` divs, not glyphs.
- **No emoji.** Color emoji would break the monochrome, currentColor-driven system.
- **Brand mark.** A rounded-square **gradient (teal→orange) "B"** — provided as SVG in `assets/`:
  - `assets/brandmark.svg` — 48×48 app mark
  - `assets/logo-lockup.svg` — horizontal `B  BIM·GIS  ATLAS` lockup
  In code the mark is also reproducible with `.bp-topbar__brand-mark` (CSS gradient).
- **When you need richer icons** (production work), substitute a thin-stroke, geometric outline set —
  e.g. **Lucide** (`https://unpkg.com/lucide-static`) at `1.5px` stroke, currentColor — which matches the
  hairline weight. *Flag this as a substitution; the source system ships no such set.*

> ⚠️ **Substitution flag:** Fonts (Space Grotesk, Inter, IBM Plex Mono) load from **Google Fonts** via
> `@import` in `tokens/typography.css` — these are the project's real fonts, not stand-ins, but they
> require network access. If you need them offline, ask for the `.woff2` files. There is **no bundled
> icon set**; the system relies on the Unicode glyphs above by design.

---

## Index / manifest

Root files:

| Path | What |
|------|------|
| `styles.css` | **Global entry** — `@import` manifest only. Consumers link this one file. |
| `tokens/` | `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `shadow.css`, `grid.css` |
| `styles/` | `base.css` (element resets), `components.css` (all `bp-*` component classes) |
| `components/` | 25 React components in 6 groups (see below). Each `Name.jsx` + `Name.d.ts`. |
| `foundations/` | Specimen cards for the Design System tab (Colors / Type / Spacing / Brand) |
| `ui_kits/atlas/` | The Atlas product UI kit (login → projects → map workspace) |
| `assets/` | `brandmark.svg`, `logo-lockup.svg` |
| `SKILL.md` | Agent Skill manifest (for Claude Code download) |

**Components** (`window.BIMGISBlueprintDesignSystem_f8b0c8.<Name>`):

- **inputs/** — `Button`, `Input`, `PasswordInput`, `Select`, `Textarea`, `Toggle`
- **display/** — `Pill`, `Spinner`, `Tabs`, `Toast` (+`ToastStack`)
- **surfaces/** — `Card`, `Panel`, `KpiTile`, `EmptyState`
- **layout/** — `SiteHeader`, `Footer`, `MobileDrawer`
- **data/** — `DataTable`, `FilterSearch`, `StackedCardTable`
- **patterns/** — `FabPill`, `BasemapPicker`, `GpsAccuracyBadge`, `AdjustDialog`

**UI kit** — `ui_kits/atlas/index.html`: an interactive click-through. Sign in → browse/sort/search
projects → open one → the map workspace (toggle layers, flip 3D, change basemap, adjust alignment,
see toasts). All screens compose the components above; nothing is re-implemented.

### Using the system

Link the stylesheet and read components off the global namespace:

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script>
  const { Button, Card, Pill } = window.BIMGISBlueprintDesignSystem_f8b0c8;
</script>
```

Drop `<div class="bp-grid-backdrop"></div>` as the first child of `<body>` for the signature backdrop.
