# Alder Health

Astro site with a Keystatic CMS, deployed on Vercel.

```sh
npm run dev      # dev server at localhost:4321, CMS at localhost:4321/keystatic
npm run build    # build (static pages + the CMS as a function)
npm run preview  # preview the build
```

## Editing content

Once deployed, editors open `/keystatic` on the live site and sign in through
Keystatic Cloud. **They do not need a GitHub account** — that is the reason
this uses Cloud rather than Keystatic's GitHub mode, where every editor needs
write access to the repository.

Saving commits the changed JSON to this repository, which triggers a deploy, so
the edit is live a minute or so later.

Locally, `npm run dev` and <http://localhost:4321/keystatic> does the same
thing. If `PUBLIC_KEYSTATIC_CLOUD_PROJECT` is set it reads and writes through
Cloud; if it is not, it falls back to editing the files in your working copy,
so a fresh clone is usable before the Cloud project exists.

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
image, commit the file to `public/images` and it becomes selectable. (Keystatic
Cloud also offers **Cloud Images**, a paid upload-and-optimise service that
would let editors add images without touching the repository.)

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

Create an empty **private** repository, then set the remote and push `main`.
Keystatic Cloud stores nothing itself — it handles sign-in and commits to this
repository on the editor's behalf — so the repo has to exist first.

### 2. Create the Keystatic Cloud project

Sign up at <https://keystatic.cloud>, create a team, then a project inside it
pointed at the GitHub repository from step 1. The project's settings page shows
its `team/project` name.

Copy `.env.example` to `.env` and fill it in:

```
PUBLIC_KEYSTATIC_CLOUD_PROJECT=team/project
```

The free plan covers **3 users per team**, which is enough for you plus two at
the client. Beyond that, Pro starts at $10/month plus $5/month per extra user.

### 3. Deploy to Vercel

Import the repository at <https://vercel.com/new>; Astro is detected
automatically. Add the same variable under **Settings → Environment
Variables**, then deploy. The build fails without it by design, so that a CMS
which writes nowhere never reaches production.

### 4. Invite the client

Add them to the Cloud team. They sign in at `yourdomain.com/keystatic` — no
GitHub account, no repository access.

### 5. Set the site URL

`site` in [`astro.config.mjs`](astro.config.mjs) is commented out. Set it to the
production origin to switch on canonical URLs, `og:url` and the absolute
`og:image` URL.

## Optional: review edits before they go live

By default an editor's save commits straight to `main` and deploys. Adding
`branchPrefix` to the `storage` block in `keystatic.config.ts` makes the admin
work on branches instead, so changes arrive as pull requests for you to approve.
Worth switching on before handing the CMS to someone else.

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
