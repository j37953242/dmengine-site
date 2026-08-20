# DM Engine legal-site conventions

**Recorded:** 2026-08-19

This repository is a dependency-light static site. It carries the safety intent of the dm-engine conventions, but it does not pretend to have tooling that is absent.

## Conventions carried from dm-engine

- **Inspect the current tree first.** Specifications and remembered line numbers are proposals; `git status`, `git log`, and the current files are authoritative.
- **Small commits with one purpose.** Behavior, its static checker, and documentation may land separately so each change can be reviewed or reverted without dragging unrelated work with it.
- **Never push from an implementation-agent run.** Jerry reviews and pushes.
- **Must-fail reasoning remains required.** A new regression check must name the old behavior it rejects. `scripts/check-reset.js` is calibrated against the parent of `e96d5be`: that page had no recovery-only discriminator or signed-in branch, parsed OAuth tokens and PKCE codes directly, and signed out unconditionally. The checker would fail for those reasons. Future fixes add or tighten the assertion before changing behavior when a reproducible red intermediate exists; they do not weaken a pin merely to make a change green.
- **Boundaries fail loudly.** Static checks use exact occurrence and structural-order assertions. A missing route guard, extra token parser, or second sign-out exits nonzero instead of passing on an aggregate count.
- **Diff hygiene.** Run `git diff --check` before every commit, and keep generated or temporary artifacts out of the repository.
- **Browser QA uses deployed files.** Recovery behavior depends on Supabase URL handling and must be exercised through the deployed HTTPS page, following `docs/RESET-QA.md`.

## dm-engine ritual steps that do not apply

- There is no `package.json`, npm harness suite, Babel configuration, React Native bundle, or Expo project in this repository.
- Therefore `npm test`, Babel parsing through the app toolchain, and `npx expo export --platform ios` do not apply here. Adding empty commands to imitate those gates would create ceremony, not coverage.

## Site commit ritual

Run these in order before a commit that touches the reset page or its checker:

```powershell
node --check scripts/check-reset.js
node scripts/check-reset.js
git diff --check
```

Documentation-only commits run `node scripts/check-reset.js` to keep the site contract green, then `git diff --check`. Behavior closes only after the relevant checks in `docs/RESET-QA.md` pass against the deployed site.
