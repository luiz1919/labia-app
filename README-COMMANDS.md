# Labia: commands and publishing

Standalone guide, separate from the main README, for working and publishing from the terminal.

- Folder: `/Users/santaml2/Documents/labs/LabiaApp`
- Repository: https://github.com/luiz1919/labia-app
- Firebase project: `labia-app-6636b`
- Published app: https://labia-app-6636b.web.app
- Console: https://console.firebase.google.com/project/labia-app-6636b/overview

The quotas and possible costs of Firebase Hosting and Firestore still apply. The lookups open
WordReference, Reverso Context and Google Translate through regular links: no paid API or key.

## Before the first release (once)

1. Firebase: enable Email/Password, add your user and publish the rules (see "Firebase" in the
   README and "Publish Firestore rules" below).
2. Commit everything and link `main` to GitHub (the repo is empty until then):

   ```sh
   cd /Users/santaml2/Documents/labs/LabiaApp
   git add -A
   git commit -m "Labia: search, idioms, false friends, differences and phrasal verbs"
   git push -u origin main
   ```

   The deploy refuses to run while `main` is not linked to `origin/main`.
3. Run the deploy (below) and choose MINOR: the first published version is v0.1.0.

## Publish the latest changes

```sh
npm --prefix /Users/santaml2/Documents/labs/LabiaApp run deploy
```

Commit your changes first: the script refuses to start with uncommitted changes. Use
descriptive commit messages: they become the `Changelog.md` entries (unless you write them by
hand under "Unreleased"). Each publish creates a new semver version, the same in Firebase, in
`package.json` and in the git tag `vX.Y.Z`. Without arguments the script asks for the change
type; to skip the question:

```sh
npm --prefix /Users/santaml2/Documents/labs/LabiaApp run deploy -- --patch   # 1.2.3 -> 1.2.4
npm --prefix /Users/santaml2/Documents/labs/LabiaApp run deploy -- --minor   # 1.2.3 -> 1.3.0
npm --prefix /Users/santaml2/Documents/labs/LabiaApp run deploy -- --major   # 1.2.3 -> 2.0.0
```

| Type | When to use it |
|------|----------------|
| **PATCH** | Bugs, visual tweaks, optimizations |
| **MINOR** | New features, new screens, new fields |
| **MAJOR** | Breaking changes, data migration |

`scripts/deploy.mjs` uses the shared deploy from firebase-app-kit, which stops at the first
step that fails:

1. Checks the Firebase CLI and git: on `main`, nothing uncommitted, not behind GitHub.
2. Asks for the change type (or uses the one given) and checks that the new tag is free. It
   shows the entries the new version will get in `Changelog.md`.
3. Runs `npm ci`, checks that the production Firebase config belongs to the project, and runs
   `npm run lint` and `npm test`.
4. Commits `Changelog.md` (`docs(changelog): vX.Y.Z`), then the new version in `package.json`
   and `package-lock.json` (`chore(release): vX.Y.Z`), and creates the tag `vX.Y.Z` locally.
5. Runs `npm run build` (the version and commit appear in "Acerca de", About) and publishes
   **Firebase Hosting only**, to the explicitly given project.
6. Pushes both commits and the tag to GitHub (`git push --atomic`).

If the build or the publish fails, the commits, the tag, the version and the changelog are
undone: nothing is published and nothing reaches GitHub. If only the final push fails, the app
is already published: run the `git push --atomic ...` command the script prints.

It does not change users, data or Firestore rules.

## Validate without publishing

```sh
npm --prefix /Users/santaml2/Documents/labs/LabiaApp run deploy:check
```

Installs dependencies, checks the config and runs lint, tests and build, without publishing or
changing the version. "Validation passed. Nothing was published." does not mean the website
was updated.

## Initial setup or new machine

Use Node 22.18 or later (for example Node 24 LTS) and the Firebase CLI:

```sh
node --version
npm install -g firebase-tools
firebase login
```

The CLI login is separate from the user login inside the app. The machine also needs the local
Firebase config (the `firebaseConfig` file or `.env.local`, see the README). It is not
versioned: do not commit it.

## Local development

```sh
cd /Users/santaml2/Documents/labs/LabiaApp
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the URL Vite prints, usually http://127.0.0.1:5173/. Ctrl+C stops the server. Developing
locally does not publish anything, but the app connected to Firebase uses the project's real
data.

To test from your phone on the same Wi-Fi, use `--host 0.0.0.0` and open the network URL Vite
prints (the service worker is only registered in production builds).

## Standalone checks

```sh
npm run lint
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

`test` runs the unit tests without Firebase. A warning about the bundle size is not a build
error. The preview also connects to the configured Firebase.

## Test the rules without touching real Firebase

With Java and the Firebase CLI installed:

```sh
npm run test:rules
```

Starts the Firestore emulator on `127.0.0.1:8087` with the fake project `demo-labia` and checks
that each user can only read and write their own preferences, and that malformed data is
rejected. `PERMISSION_DENIED` messages are expected in the tests of forbidden access: look at
the final summary. It does not publish rules or use real accounts. Port 8087 is used so it does
not clash with TripPlanner (8085) or CommunityAssistant (8086).

## Continuous integration

`.github/workflows/checks.yml` runs on every push to `main` and every pull request: lint,
`npm test`, the build and `npm run test:rules` in the emulator. It never deploys.

While **firebase-app-kit is private**, GitHub needs a token to download it:

1. GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens >
   Generate new token. Repository access: only `firebase-app-kit`; permissions:
   *Contents: Read-only*.
2. In this repo: Settings > Secrets and variables > **Actions** > New repository secret, name
   `FIREBASE_APP_KIT_TOKEN`, value: the token. You can reuse the token of the other apps.

## Publish Firestore rules: only when appropriate

**This changes the database's real permissions.** Run it only after reviewing an intentional
change to `firestore.rules` (and after `npm run test:rules` passes):

```sh
firebase deploy --config /Users/santaml2/Documents/labs/LabiaApp/firebase.json --only firestore:rules --project labia-app-6636b --non-interactive
```

Avoid `firebase deploy` without `--only`, so other resources are not deployed by accident.

## Update firebase-app-kit

```sh
npm install github:luiz1919/firebase-app-kit#vX.Y.Z
```

The tag must be in the command: editing it in `package.json` and running `npm install` keeps
the previous version (npm does not re-resolve a git dependency already in the lockfile).

## Common problems

- "Firebase no está configurado" (Firebase is not configured) on the login: the
  `firebaseConfig` file or `.env.local` is missing; restart Vite after adding it.
- `PERMISSION_DENIED` / "Firestore ha denegado el acceso" (Firestore denied access): the rules
  are not published in the project; see the section above.
- "The production Firebase config belongs to project ...": `projectId` in
  `scripts/deploy.mjs` does not match the config.
- "There are uncommitted changes": commit (or discard) them and run the deploy again.
- "No interactive terminal": add `-- --patch`, `-- --minor` or `-- --major`.
- You do not see the changes on your phone: reconnect and reload; an open PWA must be
  reloaded to download the new version.
