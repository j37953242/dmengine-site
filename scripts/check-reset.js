// Static contract checks for reset.html. This repository intentionally has no
// package/test runner; run directly with `node scripts/check-reset.js`.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resetPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'reset.html');
const source = fs.readFileSync(resetPath, 'utf8');

function occurrences(needle) {
  return source.split(needle).length - 1;
}

function sectionFrom(startNeedle, endNeedle, label) {
  const start = source.indexOf(startNeedle);
  assert.notEqual(start, -1, `${label}: start exists`);
  const end = source.indexOf(endNeedle, start);
  assert.notEqual(end, -1, `${label}: end exists`);
  return source.slice(start, end + endNeedle.length);
}

// Recovery intent has exactly two URL spellings, both reading only `type`.
const discriminator = [
  "  const queryType = new URLSearchParams(window.location.search).get('type');",
  "  const hashType = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');",
  "  const urlDeclaresRecovery = queryType === 'recovery' || hashType === 'recovery';",
].join('\n');
assert.equal(occurrences(discriminator), 1, 'type=recovery is the sole hand-read URL discriminator');
assert.equal(
  occurrences("    if (event === 'PASSWORD_RECOVERY') recoveryEventSession = session;"),
  1,
  'Supabase PASSWORD_RECOVERY is the event discriminator'
);
assert.equal(
  occurrences([
    '    const recovery = Boolean(recoveryEventSession)',
    '      || (urlDeclaresRecovery && Boolean(session));',
  ].join('\n')),
  1,
  'the form gate requires a genuine recovery discriminator'
);

// Ordinary sessions get their own branch and no destructive action.
const signedInSection = sectionFrom('<section id="signed-in"', '</section>', 'signed-in notice');
assert.match(signedInSection, /You're already signed in/);
assert.match(signedInSection, /Return to DM Engine/);
assert.doesNotMatch(signedInSection, /signOut/);
assert.equal(
  occurrences("      show(route.recovery ? 'reset-form' : route.signedIn ? 'signed-in' : 'no-token');"),
  1,
  'non-recovery authenticated routes render signed-in, never the form'
);

// The submit handler exits before reading fields or mutating auth unless the
// route was classified as recovery. Its one sign-out is after that guard.
const submitHandler = sectionFrom(
  "  $('form').addEventListener('submit', async (event) => {",
  '\n  init();',
  'reset submit handler'
);
const recoveryGuard = [
  '    if (!recoverySessionActive) {',
  "      show('signed-in');",
  '      return;',
  '    }',
].join('\n');
assert.equal(submitHandler.split(recoveryGuard).length - 1, 1, 'submit has one recovery-active early guard');
assert.ok(
  submitHandler.indexOf(recoveryGuard) < submitHandler.indexOf('client.auth.updateUser'),
  'the recovery guard precedes password mutation'
);
assert.ok(
  submitHandler.indexOf(recoveryGuard) < submitHandler.indexOf('client.auth.signOut()'),
  'the recovery guard precedes sign-out'
);
assert.equal(occurrences('client.auth.signOut()'), 1, 'the page has one sign-out call');
assert.equal(
  submitHandler.split('client.auth.signOut()').length - 1,
  1,
  'the sole sign-out lives in the recovery-guarded submit path'
);

// Supabase-js consumes callback credentials. The page may hand-read only the
// recovery `type`; adding any token/code parser here reopens the OAuth collision.
for (const forbidden of [
  "get('access_token')",
  "get('refresh_token')",
  "get('token_hash')",
  "get('code')",
  'setSession(',
  'exchangeCodeForSession(',
  'verifyOtp(',
]) {
  assert.equal(occurrences(forbidden), 0, `reset.html does not parse or exchange ${forbidden}`);
}
assert.equal(occurrences('new URLSearchParams('), 2, 'only query/hash recovery-type parsers exist');
assert.equal(occurrences(".get('type')"), 2, 'both manual URL reads are discriminator-only');
const clientStart = source.indexOf('window.supabase.createClient');
assert.ok(clientStart > source.indexOf(discriminator), 'the discriminator is read before Supabase initializes');
assert.doesNotMatch(source.slice(clientStart), /window\.location/, 'no handler reads callback URL data');

console.log('Reset checker passed: recovery-only form, safe signed-in branch, scoped sign-out, no credential parsing.');
