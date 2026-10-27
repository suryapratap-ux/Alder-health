# Alder Health

Astro site with a Keystatic CMS.

```sh
npm run dev      # dev server at localhost:4321, CMS at localhost:4321/keystatic
npm run build    # static build to ./dist
npm run preview  # preview the build
```

## Editing content

Run `npm run dev` and open <http://localhost:4321/keystatic>.

The CMS edits files in this repository — there is no database and no account to
sign in to. Saving writes JSON to `src/content/` and the dev server reloads the
page immediately. Commit those files like any other change.

| In the CMS | On disk |
| --- | --- |
| Pages → Home, About, Find a doctor, Resources, Help | `src/content/pages/*.json` |
| Content → Clinicians | `src/content/clinicians/<slug>.json` |
| Content → Questions | `src/content/faqs/<slug>.json` |
| Content → Guides | `src/content/guides/<slug>.json` |
| Site-wide → Header & footer | `src/content/settings.json` |

A clinician's file name is its URL, so `emma-reed.json` is `/doctors/emma-reed`.
Collections have an **Order** field that sets the sequence on the page; the FAQ
accordion shows one answer at a time, so tick **Open by default** on one
question only.

Image fields **pick** from the files already in `public/images` and
`public/icons` rather than uploading. That is deliberate: an upload field in
Keystatic takes ownership of the file and renames it after the field it sits in,
which moves assets out from under the other pages that share them —
`clinic-exterior.png` appears on both the home and about pages. To add a new
image, drop the file into `public/images` and it becomes selectable.

Each clinician portrait also carries a **focal point** — an `object-position`
value such as `52% 20%` — because the portraits are cropped to several
different shapes across the site and this keeps the face in frame in all of them.

The schema lives in [`keystatic.config.ts`](keystatic.config.ts). Adding a field
there makes it editable; the page template then has to render it.

### What is not in the CMS

The booking, review, confirmation and patient account screens are a demo
built on the fictional appointment data in `src/data/appointment.ts`. Their text
is interface labelling rather than editorial copy, so it stays in the templates.

## How the build stays static

The Keystatic admin is a React app on two server-rendered routes, so it is only
mounted while `astro dev` runs. `npm run build` produces a plain static site
with no adapter, no React and no CMS code in the output — the pages read their
content from the JSON files as ordinary imports. Set `KEYSTATIC=1` before a
build to include the admin, once the site is hosted somewhere that can run a
server.

## Before going live

`site` in [`astro.config.mjs`](astro.config.mjs) is commented out. Set it to the
production origin to switch on canonical URLs, `og:url` and the absolute
`og:image` URL.

To let people edit without running the project locally, point Keystatic's
`storage` at GitHub instead of `local` — that needs this directory to be a git
repository pushed to GitHub, and a host that can run the admin routes.
