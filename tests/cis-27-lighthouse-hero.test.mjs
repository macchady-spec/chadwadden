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
  assert.match(html, /Computer Science · Multimedia · IB Teacher/);
  assert.match(html, /href="blog\/how-i-built-two-ib-exam-tools-with-ai\.html"[^>]*>Read the TRACE Article →<\/a>/);
  assert.match(html, /href="#newsletter"[^>]*>Join the AI Toolkit<\/a>/);

  assert.match(css, /\.hero-scene\s*\{[^}]*inset:\s*0;/s);
  assert.match(css, /#hero\s*>\s*\.container\s*\{[^}]*z-index:\s*4;/s);
  assert.match(css, /\.hero-scene\s*\{[^}]*z-index:\s*0;/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.hero-beam[^}]*animation:\s*none/s);
});

test('hero invalidates cached presentation assets and defines desktop, tablet, and phone layouts', () => {
  assert.match(html, /href="css\/style\.css\?v=20260813-2"/);
  assert.match(html, /cis-27-lighthouse-hero-1600\.avif\?v=20260813-2/);
  assert.match(html, /src="js\/main\.js\?v=20260813-2"/);

  assert.match(css, /@media\s*\(max-width:\s*1024px\)[\s\S]*\.hero-scene--mobile\s*\{[^}]*display:\s*block;/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*\.nav-hamburger\s*\{[^}]*display:\s*flex;/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*\.hero-visual\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*\.hero-actions\s*\{[^}]*flex-direction:\s*column;/s);
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

  const desktopAvif = await stat(new URL('../images/cis-27-lighthouse-hero-1600.avif', import.meta.url));
  assert.ok(desktopAvif.size >= 40_000, 'desktop AVIF must retain enough photographic detail for a full-screen hero');
});
