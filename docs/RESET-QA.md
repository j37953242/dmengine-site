# Password reset route QA

**Prepared:** 2026-08-19

**Scope:** `reset.html` recovery-intent hardening

## Repository conventions used

- The reset behavior and this QA record land in separate, small commits.
- Nothing is pushed by the implementation agent.
- The change was inspected against the current page and checked with
  `git diff --check` before commit.
- The page's inline script was syntax-checked with Node before commit.
- The old failure is the must-fail baseline: any established session, OAuth
  token pair, or bare PKCE code previously made `establishRecoverySession()`
  return true and expose the reset form. The checks below specifically exercise
  those two directions after the fix.

This repository has no `package.json`, Babel command, harness runner, Expo
project, or inline test suite. The dm-engine Babel/npm/export ritual therefore
does not apply here. Browser verification is the behavior gate.

## Required browser checks

Run these against the deployed commit, not a local file URL.

### 1. Genuine recovery still opens the form

1. In DM Engine, open **Forgot password?** and request a reset link.
2. Open the newest link from the recovery email in a private browser window.
3. Confirm the page shows **Choose a New Password**, with both password fields
   and **Update Password**.
4. Enter matching valid passwords and submit.
5. Confirm the success message appears and the form disappears.
6. Follow **Return to DM Engine** and sign in with the new password.

Pass: a genuine recovery link opens the form and updates the password. The
post-update sign-out occurs only on this confirmed recovery path.

### 2. OAuth return never opens the recovery form

Repeat once with Google and once with Facebook:

1. Start OAuth sign-in from the deployed DM Engine web app.
2. Complete provider consent.
3. If Supabase returns to `reset.html`, confirm the page shows **You're already
   signed in** and **does not** show either password field or **Update
   Password**.
4. Follow **Return to DM Engine**.
5. Confirm the OAuth session remains signed in; the reset page must not sign it
   out.

Pass: OAuth never exposes the reset form and never destroys the signed-in
session.

## Defensive spot checks

- While already signed in, open `reset.html` directly: the signed-in notice
  appears, the form stays hidden, and the session survives.
- Open `reset.html?code=not-a-recovery-code`: the recovery form stays hidden.
- Open an expired genuine recovery link: the page shows the reset-link guidance,
  not the password form.
- Request recovery for different email values in the app: the app continues to
  show its single non-enumerating success message. This page adds no account
  lookup or account-existence copy.
