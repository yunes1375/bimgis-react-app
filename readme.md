# BIM·GIS Platform — React App

Production React shell for the BIM·GIS Platform, deployed at
[**dev.bim-gis.com/v2/**](https://dev.bim-gis.com/v2/).

Static bundle — no build step. The browser loads JSX directly via
Babel-standalone, the design system via the precompiled
[`bimgis-design-system`](https://github.com/yunes1375/bimgis-design-system)
bundle (`_ds_bundle.js`), and auth via the shared `propos.auth`
localStorage key used by the legacy `/app/*.html` pages.

## Layout

```
ui_kits/atlas/             # the React app
  index.html               # entrypoint — loads everything in order
  App.jsx                  # hash router + auth gate + nav drawer
  LandingScreen.jsx        # marketing landing (public)
  LoginScreen.jsx          # POST /auth/login → propos.auth localStorage
  ProjectsScreen.jsx       # GET /projects → card grid
  ProjectScreen.jsx        # tabs: Overview / Models / Teams / WOs / GIS overlays
  ModelsScreen.jsx         # GET /models → DataTable
  AdminScreen.jsx          # /admin/users CRUD (invite / patch / reset / delete)
  AccountScreen.jsx        # /auth/me + /auth/change-password
  ARScreen.jsx             # mobile-first AR, model picker from /models
  MapWorkspace.jsx         # picker + iframe of /app/viewer.html (Cesium host)
_react-auth.js             # shared auth: localStorage propos.auth + fetch wrapper
_ds_bundle.js              # precompiled Blueprint DS components (from bimgis-design-system)
_ds_bundle.css             # compiled component styles
styles.css                 # token entrypoint (@imports tokens/*.css)
tokens/                    # colors, type, space, radius, shadow, grid
components/                # per-component .jsx + .d.ts + .prompt.md (from DS sync)
foundations/               # token specimens (HTML — open in browser)
assets/                    # logo svg
SKILL.md                   # Anthropic skill format (for claude.ai)
readme.md                  # the design-system readme (for the agent)
```

## Routes

Hash-based:

| Hash | Screen | Auth |
|---|---|---|
| `#landing` | marketing | public |
| `#login` | sign-in form | public |
| `#projects` | project list | required |
| `#project` | project hub (6 tabs) | required |
| `#map` | model picker → Cesium iframe | required |
| `#models` | global catalogue | required |
| `#admin` | users & roles | required (admin) |
| `#account` | profile + password change | required |
| `#ar` | AR field mode | required |

## Deploy

The dev deploy lives at `/home/ubuntu/propos_coding_dev/frontend/atlas-live/`
on the dev VPS, served via nginx at `dev.bim-gis.com/app/atlas-live/` with
a convenience redirect at `dev.bim-gis.com/v2`.

To push a fresh build from here:

```bash
tar cf - . --exclude .git --exclude .gitignore \
  | ssh ubuntu@dev-host \
      'tar xf - -C /home/ubuntu/propos_coding_dev/frontend/atlas-live/'
```

## Auth

The React app uses the same `localStorage["propos.auth"]` key as the
legacy `/app/*.html` pages, so a user signed in on either side stays
signed in on the other. The fetch wrapper in `_react-auth.js`
auto-attaches `Authorization: Bearer <token>` to every same-origin
request and bounces the user back to `#login` on a 401.

## The 3D viewer

`MapWorkspace.jsx` doesn't try to re-implement Cesium. Instead it hosts
the production-tested `/app/viewer.html` in a same-origin iframe and
injects CSS to hide the iframe's own topbar so the React shell stays
visible. Model selection lives in React state; the iframe receives
`?model=<id>` as its URL.

The picker queries `/models/{id}/project` per model to scope the list
to the currently-opened project. If no models in the project have a
tileset yet, the picker offers a "Show all models" fallback.

## License

Internal — BIM·GIS Platform.
