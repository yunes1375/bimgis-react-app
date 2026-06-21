---
name: bimgis-design
description: Use this skill to generate well-branded interfaces and assets for BIM·GIS Atlas (the "Blueprint" design system), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping a dark, technical BIM (3D building model) × GIS (geographic map) product.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create
static HTML files for the user to view. If working on production code, you can copy assets and read the
rules here to become an expert in designing with this brand.

Key facts to load fast:
- **Theme:** dark "Blueprint" — near-black navy backgrounds, faint masked grid (`.bp-grid-backdrop`).
- **Domain colors:** teal `#36e0d4` = BIM (building models), orange `#ff9a52` = GIS (geography).
- **Type:** Space Grotesk (headings) / Inter (body) / IBM Plex Mono (labels, data, uppercase micro).
- **Entry point:** link `styles.css`, load `_ds_bundle.js`, read components from
  `window.BIMGISBlueprintDesignSystem_f8b0c8`.
- **Voice:** terse, technical, unit-suffixed numbers, UPPERCASE mono micro-labels, no emoji.
- **Components:** Button, Input, Select, Textarea, Toggle, Pill, Spinner, Tabs, Toast, Card, Panel,
  KpiTile, EmptyState, SiteHeader, Footer, MobileDrawer, DataTable, FilterSearch, StackedCardTable,
  FabPill, BasemapPicker, GpsAccuracyBadge, AdjustDialog.
- **Reference UI kit:** `ui_kits/atlas/` shows the components composed into a real product flow.
- **Tokens & specimens:** `tokens/*.css` and `foundations/*.html`.

If the user invokes this skill without any other guidance, ask them what they want to build or design,
ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code,
depending on the need.
