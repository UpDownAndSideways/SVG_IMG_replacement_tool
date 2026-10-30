/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSvgImages,
  replaceSvgImages,
  replaceAllSvgImages,
  validateSvg,
} from './svgImageParser.ts';

const SAMPLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <rect width="1050" height="600" fill="#1e1e24" />
  <!-- Profile Photo Slot -->
  <image id="portrait_avatar" x="80" y="80" width="160" height="160" clip-path="url(#circle-clip)" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" />
  <!-- Company Brand Logo Slot -->
  <image id="company_brand_logo" x="780" y="60" width="180" height="60" xlink:href="https://example.com/logo.svg" preserveAspectRatio="xMidYMid meet" />
  <text x="80" y="320" fill="#ffffff" font-size="32">Alexander Morgan</text>
  <text x="80" y="360" fill="#888888" font-size="18">Founder & Architect</text>
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

  const slot1 = result.slots[0];
  assert.equal(slot1.id, 'portrait_avatar');
  assert.equal(slot1.width, '160');
  assert.equal(slot1.height, '160');
  assert.equal(slot1.type, 'base64');
  assert.equal(slot1.label, 'Portrait avatar');

  const slot2 = result.slots[1];
  assert.equal(slot2.id, 'company_brand_logo');
  assert.equal(slot2.hasXlink, true);
  assert.equal(slot2.type, 'remote');
  assert.equal(slot2.label, 'Company brand logo');
});

test('replaceSvgImages replaces specific slots by index or id', () => {
  const newLogo = 'data:image/png;base64,NEW_LOGO_DATA';
  const updated = replaceSvgImages(SAMPLE_SVG, {
    company_brand_logo: newLogo,
  });

  const parsed = parseSvgImages(updated);
  assert.equal(parsed.slots[1].href, newLogo);
  // Slot 0 remains untouched
  assert.match(parsed.slots[0].href, /^data:image\/png;base64,iVBORw0/);
});

test('replaceAllSvgImages maps a single image to all placeholders', () => {
  const universalImage = 'data:image/jpeg;base64,UNIVERSAL_REPLACEMENT';
  const updated = replaceAllSvgImages(SAMPLE_SVG, universalImage, {
    preserveAspectRatio: 'cover',
  });

  const parsed = parseSvgImages(updated);
  assert.equal(parsed.slots.length, 2);
  assert.equal(parsed.slots[0].href, universalImage);
  assert.equal(parsed.slots[1].href, universalImage);
  assert.match(updated, /preserveAspectRatio="xMidYMid slice"/);
});
