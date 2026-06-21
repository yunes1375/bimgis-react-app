# Atlas — BIM·GIS product UI kit

Interactive, high-fidelity recreation of the **BIM·GIS Atlas** workspace, composed entirely from the
design-system components (no primitive is re-implemented here).

Open `index.html`. Flow:

1. **LoginScreen** — branded sign-in card on the blueprint backdrop. *Sign in* →
2. **ProjectsScreen** — sticky header, KPI row, `FilterSearch` (live filter + count), sortable
   `DataTable` of projects with status `Pill`s. *Open* a project →
3. **MapWorkspace** — the core view: an abstract dark basemap with the BIM model footprint (teal) over a
   GIS parcel (orange). Floating `Panel` layer list with `Toggle`s, `FabPill` map controls (toggle 3D,
   measure, zoom), `BasemapPicker`, `GpsAccuracyBadge`, an inspector `Panel` with `KpiTile`s, and
   `AdjustDialog` for alignment offsets. Actions raise `Toast`s.

`MobileDrawer` opens from the header hamburger on narrow widths.

## Files
- `index.html` — loads React + Babel + `_ds_bundle.js`, then the screen scripts.
- `App.jsx` — screen router (login / projects / map) + drawer.
- `LoginScreen.jsx`, `ProjectsScreen.jsx`, `MapWorkspace.jsx` — the three surfaces.

Each screen file exports its component to `window` so the others can read it (separate Babel scopes).
All DS components come from `window.BIMGISBlueprintDesignSystem_f8b0c8`.

The map canvas is an intentional **abstract** representation (CSS terrain glows + grid + footprint
outlines), not a copied screenshot — there is no real map tile source in the design system.
