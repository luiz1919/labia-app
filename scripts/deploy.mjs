// The full flow (checks, semver version and publishing) lives in firebase-app-kit.
import { deploy } from 'firebase-app-kit/deploy'

await deploy({
  appName: 'Labia',
  // The deploy stops if the compiled Firebase config (firebaseConfig) belongs to another project.
  projectId: 'labia-app-6636b',
  root: new URL('../', import.meta.url),
  // Each release adds its version to the changelog (docs(changelog): vX.Y.Z commit).
  changelog: 'Changelog.md',
})
