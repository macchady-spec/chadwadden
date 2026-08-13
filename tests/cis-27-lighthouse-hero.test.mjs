import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/style.css', import.meta.url), 'utf8');

test('homepage exposes the cinematic lighthouse hero through responsive public markup', () => {
  assert.match(html, /<picture class="hero-photo">/);
  assert.match(html, /type="image\/avif"/);
  assert.match(html, /type="image\/webp"/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /width="1672" height="941"/);
  assert.match(html, /<svg class="hero-atmosphere"/);
  assert.match(html, /class="hero-beam"/);

  assert.doesNotMatch(html, /class="scene-(?:ship|lobster|lightning|storm-fx)/);
  assert.doesNotMatch(css, /rotate\(360deg\)/);
});

test('hero preserves the approved copy, calls to action, and static no-JavaScript experience', () => {
  assert.match(
    html,
    /Practical AI and digital learning tools, built and tested in a real classroom/,
  );
  assert.match(html, /IB teacher \(Film, Psychology, Digital Society\)/);
  assert.match(html, /href="blog\/how-i-built-two-ib-exam-tools-with-ai\.html"[^>]*>Read the TRACE Article →<\/a>/);
  assert.match(html, /href="#newsletter"[^>]*>Join the AI Toolkit<\/a>/);

  assert.match(css, /\.hero-scene\s*\{[^}]*inset:\s*0;/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.hero-beam[^}]*animation:\s*none/s);
});

test('generated hero source has durable provenance without documentary ambiguity', async () => {
  const provenance = JSON.parse(
    await readFile(new URL('../images/cis-27-lighthouse-provenance.json', import.meta.url), 'utf8'),
  );

  assert.equal(provenance.classification, 'AI-generated editorial scene');
  assert.equal(provenance.createdAt, '2026-08-13');
  assert.match(provenance.prompt, /Nova Scotia lighthouse/i);
  assert.match(provenance.prompt, /left 45 percent/i);
  assert.equal(provenance.documentaryEvidence, false);
  assert.deepEqual(provenance.publicAssets.sort(), [
    'images/cis-27-lighthouse-hero-640.avif',
    'images/cis-27-lighthouse-hero-640.webp',
    'images/cis-27-lighthouse-hero-960.avif',
    'images/cis-27-lighthouse-hero-960.webp',
    'images/cis-27-lighthouse-hero-1600.avif',
    'images/cis-27-lighthouse-hero-1600.webp',
    'images/cis-27-lighthouse-hero.png',
  ].sort());

  for (const asset of provenance.publicAssets) {
    const assetStat = await stat(new URL(`../${asset}`, import.meta.url));
    assert.ok(assetStat.size > 0, `${asset} must be a non-empty public asset`);
  }
});
