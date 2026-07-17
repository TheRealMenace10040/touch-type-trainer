---
name: firebase-pwa-app
description: Scaffold a small, private multi-person web app (React + Vite + TypeScript + Firebase Firestore), installable on iOS as a home-screen PWA, with a no-login named-user picker and manual `firebase deploy`. Use when asked to build a new personal/family/couple app "like the other ones," a simple shared tool for a small named group of people, or to keep a new Firebase app consistent with past ones in this account.
---

# Firebase PWA app (shared, no-login, iOS-installable)

This packages the pattern built for `literary_lumineers`: a tiny web app for
a small, fixed set of named people (e.g. two family members) to share data
live, with no login screen, installable on iOS, deployed to Firebase
Hosting. Follow these steps in order; copy files from `templates/` rather
than retyping them, so the result stays byte-for-byte consistent across
projects. Fill in `TODO`/`PLACEHOLDER`-style values as you go.

**Deploy default: manual `firebase deploy`, not CI.** Every app in this
account (including literary_lumineers, after an earlier attempt at GitHub
Actions auto-deploy was deliberately reverted — "no service account secret
set up; deploys are manual via firebase CLI, same pattern as other Firebase
apps") deploys by running `firebase deploy` from a terminal, not via a
GitHub Actions pipeline. Match that unless the user explicitly asks for CI
auto-deploy for this specific app — don't add it by default.

## 0. Confirm scope before building

If not already specified, ask (via AskUserQuestion, one round, don't stall
on it):
- Who are the named users, and how many (just a `USERS` array — arbitrary
  length, not hardcoded to two).
- User-switching: default to the simple name-picker below unless the user
  asks for real auth (Firebase Auth email/password or Google Sign-In).
- Whether a Firebase project already exists, or needs to be created by the
  user afterward (usually the latter — you cannot create Firebase projects
  yourself, and typically can't add GitHub secrets either).

## 1. Scaffold the project

`npm create vite@latest . -- --template react-ts` hangs/cancels non-
interactively if the target directory isn't empty (it will be — there's
usually already a README or .git). Work around it by scaffolding into a
scratch dir and copying in:

```bash
npm create vite@latest scaffold -- --template react-ts   # in a scratch dir
cp -r scaffold/. /path/to/real/project/.
```

Then: rename `package.json`'s `name`, delete the template's demo assets
(`src/assets/`, `src/App.css` boilerplate, `public/favicon.svg`,
`public/icons.svg`), and `npm install firebase`.

## 2. Data layer

- `templates/src/firebase.ts` → `src/firebase.ts` (verbatim — reads
  `VITE_FIREBASE_*` from env, exports `db`).
- `templates/src/vite-env.d.ts` → `src/vite-env.d.ts` (verbatim — types the
  env vars).
- `templates/src/users.ts` → `src/users.ts`, replace `PersonA`/`PersonB`
  with the real names. This is the single source of truth for who can be
  picked — reference it from `firestore.rules` too.
- Write one `src/lib/<domain>.ts` per top-level Firestore collection, with
  the pattern: a `subscribeToX(callback)` using `onSnapshot` for live reads,
  plain `async function` exports for writes (`addDoc`/`setDoc`/`deleteDoc`).
  Keep all Firestore calls in this layer — components never import
  `firebase/firestore` directly.
- If there's a per-user sub-resource (a rating, a vote, a checkbox), model
  it as a subcollection keyed by user name (`items/{id}/ratings/{user}`) —
  it makes "did PersonA rate this yet" and rules validation trivial.

## 3. No-login user picker

In `App.tsx`: keep a `currentUser` state seeded from
`localStorage.getItem(STORAGE_KEY)`. If null, render a `UserPicker` (buttons
for each name in `USERS`, `onClick` writes to localStorage and sets state)
instead of the app. Add a small "Not {name}?" button in the app header that
clears localStorage and resets state, for switching users on a shared
device. This is the entire "auth" system — no passwords, no backend check.

## 4. PWA + iOS installability

- Merge `templates/index-head-snippet.html` into `index.html`'s `<head>`
  (viewport-fit=cover, theme-color, manifest link, apple-touch-icon,
  apple-mobile-web-app-* meta tags). Fill `APP_NAME`/`APP_DESCRIPTION`.
- `templates/manifest.json` → `public/manifest.json`, fill in name/short_name/
  description/colors.
- Generate icons: check `which convert magick` and
  `python3 -c "import PIL"` first — use those if present. Otherwise copy
  `templates/generate_icons.py`, customize the `draw()` function for the
  project's actual glyph (keep it simple — this does per-pixel polygon
  fills), and run `OUT_DIR=public python3 generate_icons.py`. This produces
  `icon-512.png`, `icon-192.png`, `apple-touch-icon.png` (180),
  `favicon-32.png`. View the largest one with the Read tool before moving on
  to confirm it actually looks right.

## 5. Firebase config

Copy into the project root:
- `templates/firebase.json` (verbatim)
- `templates/firebaserc` → `.firebaserc` (placeholder project ID — the user
  fills this in once they've created the real project)
- `templates/firestore.indexes.json` (verbatim, starts empty)
- `templates/firestore.rules` → customize the collection name(s), schema
  validation, and the `isKnownUser` list to match `src/users.ts`. Keep the
  top comment explaining the no-auth tradeoff — it's accurate for every app
  in this pattern, not boilerplate to delete.

## 6. Environment variables

- `templates/env.example` → `.env.example` (verbatim).
- Add to `.gitignore`: `.env`, `.firebase`, `firebase-debug.log`.

## 7. GitHub Actions auto-deploy — optional, off by default

Don't add this unless the user explicitly asks for CI auto-deploy on this
app. Default is manual `firebase deploy` (see step 8), matching every other
app in this account. If asked, copy both workflow files verbatim into
`.github/workflows/`:
- `templates/workflows/firebase-hosting-merge.yml` — deploys on push to
  `main`.
- `templates/workflows/firebase-hosting-pull-request.yml` — preview deploy
  per PR, gated to same-repo PRs (`github.event.pull_request.head.repo.full_name
  == github.repository`) so secrets never reach a fork.

Both read the six `VITE_FIREBASE_*` secrets plus `FIREBASE_SERVICE_ACCOUNT`.
**These will fail** (`Input required and not supplied: firebaseServiceAccount`)
until the user adds those repo secrets — that failure is expected and not a
bug to chase; it just means the manual one-time setup hasn't happened yet.
You cannot create the Firebase project or add GitHub secrets yourself — tell
the user what's needed (see `templates/README.md.template`'s optional
auto-deploy section for the exact steps to relay) rather than trying to
work around it.

## 8. README

`templates/README.md.template` → `README.md`, filling in the placeholders
(app name/description, feature list, person names). Keep the manual deploy
steps and the "no login system" framing intact; only include the CI
auto-deploy subsection if step 7 was actually done for this app.

## 9. Verify before calling it done

- `npm run build` (tsc + vite build) and `npm run lint` (oxlint) must both
  pass clean.
- Actually look at the UI: `npm run dev`, then screenshot with Playwright.
  If `playwright` isn't in this project's `node_modules`, it's usually
  installed globally already — use `$(npm root -g)/playwright` as the
  require path, and launch with
  `executablePath: '/opt/pw-browsers/chromium'` (pre-installed; don't run
  `playwright install`). Check the user-picker screen, the main app view,
  dark mode (`colorScheme: 'dark'`), and a phone-sized viewport (~390px
  wide) before reporting success.

## 10. Ship it

Commit and push per the repo's actual branch instructions. Only open a PR
if asked. After merge, if this is a new Firebase project, proactively tell
the user the exact manual steps left (create project in the Firebase
console → fill in `.env` and `.firebaserc` → `npm run build && firebase
deploy`) using the same walkthrough style as `templates/README.md.template`'s
deploy section — don't assume they remember it from a previous app.
