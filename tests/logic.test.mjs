import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(relativePath) {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), sandbox, {
    filename: relativePath,
  });
  return sandbox;
}

const parser = load('../js/svgImageParser.js');
const exp = load('../js/exportHelpers.js');
const { parseSvgImages, replaceSvgImages, replaceAllSvgImages, validateSvg } = parser;
const { PAPER_SIZES, getTargetDimensions, getSvgDimensions } = exp;

const SAMPLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <rect width="1050" height="600" fill="#1e1e24" />
  <image id="portrait_avatar" x="80" y="80" width="160" height="160" clip-path="url(#circle-clip)" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" />
  <image id="company_brand_logo" x="780" y="60" width="180" height="60" xlink:href="https://example.com/logo.svg" preserveAspectRatio="xMidYMid meet" />
  <text x="80" y="320" fill="#ffffff" font-size="32">Alexander Morgan</text>
</svg>
`;

test('validateSvg correctly verifies SVG documents', () => {
  assert.equal(validateSvg(SAMPLE_SVG).valid, true);
  assert.equal(validateSvg('not an svg').valid, false);
  assert.equal(validateSvg('').valid, false);
});

test('parseSvgImages detects all embedded and linked images with attributes', () => {
  const result = parseSvgImages(SAMPLE_SVG);
  assert.equal(result.slots.length, 2);
  assert.equal(result.viewBox, '0 0 1050 600');
  assert.equal(result.width, '1050');
  assert.equal(result.height, '600');
  assert.equal(result.hasPlaceholders, true);
  assert.equal(result.slots[0].id, 'portrait_avatar');
  assert.equal(result.slots[0].type, 'base64');
  assert.equal(result.slots[0].label, 'Portrait avatar');
  assert.equal(result.slots[1].id, 'company_brand_logo');
  assert.equal(result.slots[1].hasXlink, true);
  assert.equal(result.slots[1].type, 'remote');
  assert.equal(result.slots[1].label, 'Company brand logo');
});

test('replaceSvgImages replaces specific slots by index or id', () => {
  const newLogo = 'data:image/png;base64,NEW_LOGO_DATA';
  const updated = replaceSvgImages(SAMPLE_SVG, { company_brand_logo: newLogo });
  const parsed = parseSvgImages(updated);
  assert.equal(parsed.slots[1].href, newLogo);
  assert.match(parsed.slots[0].href, /^data:image\/png;base64,iVBORw0/);
});

test('replaceAllSvgImages maps a single image to all placeholders', () => {
  const universalImage = 'data:image/jpeg;base64,UNIVERSAL_REPLACEMENT';
  const updated = replaceAllSvgImages(SAMPLE_SVG, universalImage, { preserveAspectRatio: 'cover' });
  const parsed = parseSvgImages(updated);
  assert.equal(parsed.slots.length, 2);
  assert.equal(parsed.slots[0].href, universalImage);
  assert.equal(parsed.slots[1].href, universalImage);
  assert.match(updated, /preserveAspectRatio="xMidYMid slice"/);
});

test('paper sizes and 300 DPI pixel math', () => {
  assert.equal(PAPER_SIZES.letter.widthInInches, 8.5);
  assert.equal(PAPER_SIZES.letter.heightInInches, 11.0);
  assert.equal(PAPER_SIZES.ledger.widthInInches, 11.0);
  assert.equal(PAPER_SIZES.ledger.heightInInches, 17.0);
  assert.equal(PAPER_SIZES.a3.widthInMm, 297);
  assert.equal(PAPER_SIZES.a3.heightInMm, 420);

  const letterLandscape = getTargetDimensions('letter', true, 300);
  assert.equal(letterLandscape.pageWidthInches, 11.0);
  assert.equal(letterLandscape.pageHeightInches, 8.5);
  assert.equal(letterLandscape.pixelWidth, 3300);
  assert.equal(letterLandscape.pixelHeight, 2550);

  const ledgerLandscape = getTargetDimensions('ledger', true, 300);
  assert.equal(ledgerLandscape.pixelWidth, 5100);
  assert.equal(ledgerLandscape.pixelHeight, 3300);

  const a3Landscape = getTargetDimensions('a3', true, 300);
  assert.equal(a3Landscape.pixelWidth, 4961);
  assert.equal(a3Landscape.pixelHeight, 3508);
});

test('getSvgDimensions detects orientation from the viewBox', () => {
  const landscape = getSvgDimensions('<svg viewBox="0 0 4200 2970" width="4200" height="2970"></svg>');
  assert.equal(landscape.width, 4200);
  assert.equal(landscape.height, 2970);
  assert.equal(landscape.isLandscape, true);
  const portrait = getSvgDimensions('<svg viewBox="0 0 2970 4200"></svg>');
  assert.equal(portrait.isLandscape, false);
});
