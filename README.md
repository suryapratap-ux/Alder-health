# Alder Health

A static Astro site. Content is edited through [Pages CMS](https://pagescms.org),
a hosted service that reads and writes this repository on GitHub.

```sh
npm run dev      # dev server at localhost:4321
npm run build    # static build to ./dist
npm run preview  # preview the build
```

One dependency, `astro`. No admin routes, no adapter, no client-side framework
— the CMS runs on Pages CMS's servers, not here.

## Editing content

Editors go to <https://app.pagescms.org>, sign in with GitHub and pick this
repository. Saving commits the changed JSON to the repository; if the host is
set to deploy on push, the site rebuilds by itself.

The editing interface is defined by [`.pages.yml`](.pages.yml) at the
repository root.

| In the CMS | On disk |
| --- | --- |
| Pages → Home, About, Find a doctor, Resources, Help | `src/content/pages/*.json` |
| Content → Clinicians | `src/content/clinicians/<slug>.json` |
| Content → Questions | `src/content/faqs/<slug>.json` |
| Content → Guides | `src/content/guides/<slug>.json` |
| Header & footer | `src/content/settings.json` |
| Photographs | `public/images` |
| Icons | `public/icons` |

A clinician's file name is the web address, so `emma-reed.json` is
`/doctors/emma-reed`. Renaming the clinician renames the file and changes that
address, so any link pointing at the old one breaks.

Collections have an **Order** field setting the sequence on the page. The FAQ
accordion shows one answer at a time, so **Open by default** belongs on one
question only.

A few fields are marked read-only because other parts of the site point at
them — the anchor ids on the About clinics and the Help policy sections, which
the navigation and footer link to.

Each clinician portrait carries a **focal point**, two percentages such as
`52% 20%`. The portraits are cropped to several different shapes across the
site and this keeps the face in frame in all of them. It is validated, so a
malformed value is rejected in the editor rather than silently breaking a crop.

### Changing what is editable

Adding a field to `.pages.yml` makes it appear in the CMS, but the Astro
template still has to render it. Renaming or deleting one breaks the page that
reads it.

Field names must match the JSON keys exactly. Pages CMS writes back only the
fields it knows about, so a key present in the JSON but missing from
`.pages.yml` would be **dropped the first time an editor saves that file**.
There is a checker for this:

```sh
node scripts/check-pages-yml.mjs
```

### What is not in the CMS

The booking, review, confirmation and patient account screens are a demo built
on the fictional appointment data in `src/data/appointment.ts`. Their text is
interface labelling rather than editorial copy, so it stays in the templates.

## Setup — needs your action

These steps need accounts and cannot be done from the codebase.

### 1. Push to GitHub

Pages CMS is a front end for a GitHub repository, so one has to exist. Create
an empty **private** repository, add it as `origin`, and push `main`.

### 2. Authorise Pages CMS

Go to <https://app.pagescms.org> and sign in with GitHub. Grant it access to
this repository only, rather than to every repository on the account. It reads
`.pages.yml` from the default branch and builds the editing interface from it.

### 3. Invite the client

Invite them by email as a **collaborator** in Pages CMS. Collaborators do not
need a GitHub account — their saves are committed using the GitHub App's
installation token.

Collaborators can edit content and media but cannot change `.pages.yml` or
manage other collaborators, which is the right split: the client edits copy,
the schema stays with you.

By default those commits are attributed to the app rather than the person. To
record who made each change, set `settings.commit.identity: user` in
`.pages.yml`.

### 4. The host

The site is built and served by Netlify from this repository. A save in Pages
CMS commits to `main`, GitHub notifies Netlify, and Netlify runs the build and
publishes it — there is no manual step and nothing to press.

Build settings live in [`netlify.toml`](netlify.toml) rather than only in the
Netlify UI: `npm run build`, publish `dist`, and Node 24, which matters because
`package.json` requires >=22.23.4 and the build image default is older.

Two things are configured in the Netlify account rather than here, and the
chain is broken without either:

- **The repository is linked** under Project configuration → Developer settings
  → Continuous deployment. Netlify needs a GitHub account connected to the
  Netlify user for this; a user who signed up with Google has none until they
  add one under User settings → Profile → Connected accounts.
- **Auto-publishing is unlocked** on the Deploys page. A locked site builds
  every commit and publishes none, which looks exactly like nothing happening.

### 5. The site URL

`site` in [`astro.config.mjs`](astro.config.mjs) is the production origin, and
the layout builds `<link rel="canonical">`, `og:url` and the absolute
`og:image` from it. Change it when a custom domain is added.

## Committing from a local clone

Saves made in Pages CMS need nothing here. `settings.commit.identity: user` in
[`.pages.yml`](.pages.yml) attributes each commit to the signed-in editor, and
because the CMS writes through the GitHub API it can use that person's real
email — the address Netlify matches against its team members. Those commits
build straight away.

Pushing from a local clone is caught between two rules that disagree:

```sh
git config user.name "suryapratap-ux"
git config user.email "315748640+suryapratap-ux@users.noreply.github.com"
```

- GitHub's **email privacy** setting rejects a command-line push that exposes
  the account's real address, so the noreply form is the only one it accepts.
- Netlify matches a commit author's **email** against its team members, and the
  noreply address matches nobody, so the build stops with
  `Build blocked: Unrecognized Git contributor`.

Connecting a GitHub account to the Netlify user, under User settings → Profile
→ Connected accounts, resolves this: Netlify can then recognise the noreply
address as that member. Until then a local push reaches GitHub but does not
deploy, and the site quietly stays on the previous version.

## Images

Image fields upload into `public/images` (photographs) or `public/icons`
(icons) and store a served path such as `/images/hero-consultation.png`.
Uploads are slugified, so a file named `Clinic Photo.PNG` arrives as
`clinic-photo.png`.

Replacing a clinician portrait also means updating its **width** and **height**
fields, which are the pixel size of the file. They only hint the aspect ratio
to the browser — CSS fixes both dimensions — so a stale value will not break
the layout, but it is worth keeping accurate.
