# Alder Health

Astro site with a Keystatic CMS, deployed on Vercel.

```sh
npm run dev      # dev server at localhost:4321, CMS at localhost:4321/keystatic
npm run build    # build (static pages + the CMS as a function)
npm run preview  # preview the build
```

## Editing content

Once deployed, open `/keystatic` on the live site and sign in with GitHub.
Saving commits the changed JSON straight to this repository, which triggers a
deploy, so the edit is live a minute or so later. Nobody needs to run the
project to change copy.

Locally, `npm run dev` and <http://localhost:4321/keystatic> does the same
thing. If `PUBLIC_KEYSTATIC_GITHUB_REPO` is set it reads and writes GitHub; if
it is not, it falls back to editing the files in your working copy, so a fresh
clone is usable before the GitHub App exists.

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
image, commit the file to `public/images` and it becomes selectable.

Each clinician portrait also carries a **focal point** — an `object-position`
value such as `52% 20%` — because the portraits are cropped to several
different shapes across the site and this keeps the face in frame in all of them.

The schema lives in [`keystatic.config.ts`](keystatic.config.ts). Adding a field
there makes it editable; the page template then has to render it.

### What is not in the CMS

The booking, review, confirmation and patient account screens are a demo
built on the fictional appointment data in `src/data/appointment.ts`. Their text
is interface labelling rather than editorial copy, so it stays in the templates.

## First-time setup

### 1. Push to GitHub

Create an empty **private** repository, then:

```sh
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

### 2. Deploy to Vercel

Import the repository at <https://vercel.com/new>; Astro is detected
automatically. Before the first deploy, add one environment variable under
**Settings → Environment Variables**:

```
PUBLIC_KEYSTATIC_GITHUB_REPO=OWNER/REPO
```

The build fails without it by design, so that a CMS which writes nowhere never
reaches production. Deploy, and note the URL you get.

### 3. Create the GitHub App

```sh
npm run dev
```

Open <http://localhost:4321/keystatic/setup>. Enter the Vercel URL from the
previous step as the **Deployed App URL** — that is what lets the wizard
register the OAuth callback for you, so getting it right here saves fixing it
by hand later. The wizard creates a GitHub App on your account and prints four
values.

Copy `.env.example` to `.env` and paste them in, and add the same four to
Vercel, then redeploy:

```
PUBLIC_KEYSTATIC_GITHUB_REPO=OWNER/REPO
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=…
KEYSTATIC_GITHUB_CLIENT_ID=…
KEYSTATIC_GITHUB_CLIENT_SECRET=…
KEYSTATIC_SECRET=…
```

`.env` is gitignored. The client secret is a credential — treat it like a
password and never commit it.

If sign-in fails on the deployed site with a callback mismatch, open the App's
settings on GitHub and set the callback URL to
`https://YOUR-DOMAIN/api/keystatic/github/oauth/callback`.

### 4. Set the site URL

`site` in [`astro.config.mjs`](astro.config.mjs) is commented out. Set it to the
production origin to switch on canonical URLs, `og:url` and the absolute
`og:image` URL.

## What gets deployed

`output: 'static'` with an adapter means all 12 pages are prerendered to plain
HTML and served as files — they reference no JavaScript bundles at all, the
same as before the CMS existed. Only `/keystatic` and `/api/keystatic` run as a
function, and only that route loads the React admin bundle.

## Known advisories

`npm audit` reports 7 high-severity advisories (`path-to-regexp`, `zod`) coming
in through `@astrojs/vercel` → `@vercel/functions` → `@vercel/oidc`. They are
Vercel's own build and deploy tooling, not code served to visitors. The fix npm
suggests is `@astrojs/vercel@8`, which supports only Astro 5 and would break the
build, so it has been left alone pending an upstream release. Do not run
`npm audit fix --force` here.
