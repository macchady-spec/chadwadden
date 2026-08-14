import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [home, resources, confirmation, pack, script, manifestText] = await Promise.all([
  read('index.html'),
  read('resources/index.html'),
  read('newsletter-confirmed.html'),
  read('resources/trace-teacher-pack/index.html'),
  read('js/main.js'),
  read('resources/trace-teacher-pack/manifest.json'),
]);
const manifest = JSON.parse(manifestText);

for (const page of [home, resources]) {
  assert.match(page, /The TRACE Teacher Pack/);
  assert.match(page, /70f50cb4b3/);
  assert.match(page, /newsletter_form_view/);
}

assert.doesNotMatch(
  [home, resources].join('\n'),
  /Digital Media Unit Plan|Practice Plan Templates|Season Planning Framework/,
  'The live funnel must not advertise placeholder resources.',
);

assert.match(confirmation, /generate_lead/);
assert.match(confirmation, /\/resources\/trace-teacher-pack\//);
assert.match(pack, /d9ec299d7af2d486fb27b2a87a26b1f3df47a65e7bb52af8006ab1e3b1b04969/);
assert.match(pack, /cda39c7f2d0b3179c90353e5e087e9d90e0a80550d7b80f934ba86c289b805a2/);

for (const required of [
  'Target the thinking',
  'Retrieve before AI',
  'Ask with boundaries',
  'Check the output',
  'Edit and explain',
  'Two ways to use TRACE',
  'Build your bounded AI job',
  'Student handout',
  'Quick example',
  'Exam Practice Studio',
  'Response Studio',
  'not a validated intervention',
  'See TRACE in a real classroom task',
  'Read the completed classroom example',
  'Why this is designed this way',
  'Help me make this better',
]) {
  assert.ok(pack.includes(required), `Missing required Pack content: ${required}`);
}

assert.ok(script.includes('Form values and email addresses'));
assert.ok(script.includes('are never read by this site script.'));
assert.doesNotMatch(script, /querySelector\([^)]*(email|input)/i);

const pdf = await stat(new URL('../resources/trace-teacher-pack/trace-teacher-pack.pdf', import.meta.url));
assert.ok(pdf.size > 20_000, 'The designed TRACE Pack PDF is missing or unexpectedly small.');
assert.equal(manifest.productId, 'trace_teacher_pack_v1');
assert.equal(manifest.privacy.browserWorksheetPersistence, 'none');
assert.equal(manifest.privacy.subscriberIdentityStoredInWebsite, false);
assert.equal(manifest.publicDerivatives.length, 2);
for (const derivative of manifest.publicDerivatives) {
  const bytes = await readFile(new URL(`../${derivative.path}`, import.meta.url));
  const digest = createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest, derivative.sha256, `Manifest hash mismatch: ${derivative.path}`);
}

console.log('TRACE website funnel validation passed.');
