# CLAUDE.md — PawClinic HubSpot CMS Theme

Guidance for Claude Code when working in this repository.

## What this project is

A **HubSpot CMS Hub classic theme** (the Local Development model — `theme.json` +
`modules/` + `templates/`, driven by the `hs` CLI — **not** the newer Developer
Projects / UI Extensions framework, which is for private apps, not marketing
website themes).

The site is **"PawClinic"**, a pet veterinary clinic marketing website. Original
design comes from a Figma Make prototype ("PawClinic — Pet Veterinary Clinic");
that prototype is a React/Tailwind/shadcn reference **only** — this repo hand-authors
the equivalent as HubL + compiled CSS. Do **not** port React/shadcn code directly.

## HubSpot portal / account

- Target portal: account **`245981171`** — named **`production`** ("production
  [test account]") in `~/.hscli/config.yml`. Despite the name, it is a safe test
  account, not a live business portal.
- This machine also has a `dev` portal (`39982897`) configured. `245981171` is the
  CLI default, but **always pass `--account=production` explicitly** so a command
  never lands on the wrong portal.

## Build & upload workflow

CSS is compiled with **PostCSS + Tailwind v4**: `src/css/main.css` (which
`@import`s `base.css`, `layout.css`, `components.css`) → `css/main.css`. Only the
compiled `css/` output is uploaded; `base.html` loads just `css/main.css`.

```bash
npm run build        # compile src/css/main.css -> css/main.css (run BEFORE every upload)
npm run watch        # recompile on change during local dev

# Push to HubSpot Design Manager (dest folder already exists as this name):
hs upload . alan-pets-clinic-hubspot-theme --account=production
hs watch  . alan-pets-clinic-hubspot-theme --account=production
```

`.hsignore` excludes `node_modules/`, `src/`, `package.json`, `package-lock.json`,
`postcss.config.js`, `tailwind.config.js`, `.gitignore`, `.hsignore` from the
upload — so the build toolchain lives in git but never ships to HubSpot. Always run
`npm run build` before `hs upload`, otherwise stale CSS ships.

## Module conventions

- Every module folder ends in `.module` and holds `meta.json` + `fields.json` +
  `module.html` (+ `module.css` / `module.js` only when the styling/behavior is
  truly module-specific; shared styles live in `src/css/components.css`).
- **Group-repeater fields** (see `trust-badges.module`, `highlights.module`) are the
  established pattern for editor-managed lists that are **not** HubDB-backed. Reuse
  this pattern for new list-style modules rather than inventing another.
- `link`-type fields use the nested `{ url: { href, type } }` format (a deliberate
  fix — don't regress to flat `{ href }`).
- Global `header.module` and `footer.module` live under `modules/global/` and are
  `is_available_for_new_content: false` (locked). They are placed as static
  `{% module %}` tags **outside** the `dnd_area` in `base.html`, so edit those two
  folders directly — they are not drag-and-drop.

## HubDB

Two tables in portal `245981171`; source-of-truth JSON lives in `hubdb/`:

| Table            | ID           | Source file                  |
|------------------|--------------|------------------------------|
| `clinic_services`| `3091965655` | `hubdb/clinic_services.json` |
| `clinic_doctors` | `3092647629` | `hubdb/clinic_doctors.json`  |

> ⚠️ `clinic_doctors` id `3092647629` is **pinned** in `templates/doctor-profile.html`
> (`dynamicPageHubDBTable`). Do NOT delete/recreate it — that changes the ID and breaks
> the dynamic pages. Edit rows in the HubSpot UI or via a future `hs hubdb` update path
> instead. `useForPages: true`; each row has a `path` (e.g. `emily-carter`) + `name`.

> HubDB BOOLEAN cell values in the seed JSON must be `1`/`0` integers, **not** JSON
> `true`/`false` — `hs hubdb create` silently coerces `true`/`false` to `0`, which had
> broken the "featured/popular" filters on both tables.

- The JSON files are authoritative for schema + seed rows. This CLI (v7.11.2) has no
  "import rows into an existing table" or `publish` command — only `create` / `clear`
  / `delete` / `fetch` / `list`. `hs hubdb create --path <file>` creates AND publishes
  rows in one step, but fails if the table name already exists. To re-seed an existing
  table, `hs hubdb delete <id>` first (safe only when it has no rows worth keeping),
  then `create`. This changes the table ID — fine here because modules reference tables
  by **name**, not ID (`hubdb_table_rows('clinic_services', ...)`); just update the ID
  in this file afterward.
- Seed with JSON (preserves SELECT/IMAGE/BOOLEAN/NUMBER typing), not plain CSV
  (which infers everything as TEXT). CSVs in `hubdb/` are human-readable artifacts only.
- There is intentionally **no** `clinic_settings` HubDB table — global header/footer
  content is plain module fields.

## Template model

A single flexible `templates/base.html`: locked static header/footer outside one
`dnd_area("main_content")`; every content page (home / services / doctors / booking)
is composed by dragging modules into that one area. New **page types** that need
their own layout (Doctor Profile dynamic page, Campaign landing page) are the
exception — they get their own dedicated templates.

### Doctor Profile dynamic pages (`templates/doctor-profile.html`)
- Backed by `clinic_doctors` (`useForPages: true`). One page instance serves both a
  **listing** (base URL, no matched row → `page-hero` + `doctors-hubdb` module) and a
  **detail** view (`dynamic_page_hubdb_row` set → `doctor-profile.module`).
- `doctors-hubdb.module` links each card to `<profile_base_url>/<row.hs_path>` when
  `link_to_profile` is on (default). On the dynamic page the base is `request.path`.
- **User action (HubSpot UI):** create ONE page from the "Doctor Profile (Dynamic)"
  template (e.g. slug `/doctors`), which auto-generates `/doctors/<path>` for every row.
  Set the homepage doctors teaser's `profile_base_url` to match that slug.

## Bilingual (EN / 繁體中文)

Target approach: HubSpot **native multi-language pages** (English primary, 繁體中文
secondary group) rather than a client-side DOM toggle. Module-field copy is authored
per language-variant page; HubDB-driven content keeps English columns as the base and
adds `_zh` columns (`name_zh`, `description_zh`, `duration_zh` on `clinic_services`;
`title_zh`, `specialty_zh`, `bio_zh` on `clinic_doctors`).

- HubL picks the language per row with:
  `{% set is_zh = content.language and 'zh' in content.language %}` then
  `{{ row.name_zh if is_zh and row.name_zh else row.name }}` (falls back to English).
  The `'zh' in content.language` test matches `zh-tw` / `zh-hk` / `zh-hant`.
- The category SELECT stays English (its lowercased slug drives JS filtering); ZH
  display labels come from a `cat_labels_zh` map inside `services-hubdb/module.html`.
- The header uses HubSpot's native `{% language_switcher %}` tag (styled under
  `.site-header__lang`), which only renders once a page has published translations.
- **User action (HubSpot UI, not CLI):** Settings → Website → Languages, add 繁體中文
  as a secondary language, then create the 繁體中文 variant of each page and translate
  the module-field copy. HubDB `_zh` columns render automatically on those variants.

## Current scope / in progress

Active work plan (see the approved plan file for full detail):

1. **Phase 1** — reconcile & publish HubDB rows (fix the services import gap).
2. **Phase 2** — bilingual EN/繁體中文 (native multi-language pages + `*_en`/`*_zh`
   HubDB columns + header language switcher).
3. **Phase 3** — Doctor Profile as a true HubDB **dynamic page** (one URL per doctor,
   `doctor-profile.module` + `templates/doctor-profile.html`).
4. **Phase 4** — `patient-testimonials.module` (group-repeater fields, **not** HubDB).
5. **Phase 5** — Campaign marketing landing page (own template + `campaign-*` modules).
6. **Phase 6** — wire a real HubSpot Form into `booking-form.module` (it currently
   only shows a client-side success message; `hubspot_form_id` is unset so no lead
   is captured).

## Git

- Repo pushes to `github.com/AlanChou890305/alan-pets-clinic-hubspot-theme`.
- Commit or push only when asked. Branch off `main` before starting non-trivial work.
