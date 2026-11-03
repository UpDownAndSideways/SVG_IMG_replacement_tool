/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PAPER_SIZES,
  getTargetDimensions,
  getSvgDimensions,
} from './exportHelpers.ts';

test('PAPER_SIZES defines accurate physical dimensions for Letter, Ledger, and A3', () => {
  assert.equal(PAPER_SIZES.letter.widthInInches, 8.5);
  assert.equal(PAPER_SIZES.letter.heightInInches, 11.0);

  assert.equal(PAPER_SIZES.ledger.widthInInches, 11.0);
  assert.equal(PAPER_SIZES.ledger.heightInInches, 17.0);

  assert.equal(PAPER_SIZES.a3.widthInMm, 297);
  assert.equal(PAPER_SIZES.a3.heightInMm, 420);
});

test('getTargetDimensions produces accurate 300 DPI pixel dimensions without distortion', () => {
  // Letter landscape (11" x 8.5")
  const letterLandscape = getTargetDimensions('letter', true, 300);
  assert.equal(letterLandscape.pageWidthInches, 11.0);
  assert.equal(letterLandscape.pageHeightInches, 8.5);
  assert.equal(letterLandscape.pixelWidth, 3300);
  assert.equal(letterLandscape.pixelHeight, 2550);

  // Ledger landscape (17" x 11")
  const ledgerLandscape = getTargetDimensions('ledger', true, 300);
  assert.equal(ledgerLandscape.pageWidthInches, 17.0);
  assert.equal(ledgerLandscape.pageHeightInches, 11.0);
  assert.equal(ledgerLandscape.pixelWidth, 5100);
  assert.equal(ledgerLandscape.pixelHeight, 3300);

  // A3 landscape (420mm x 297mm ~= 16.535" x 11.693")
  const a3Landscape = getTargetDimensions('a3', true, 300);
  assert.ok(a3Landscape.pageWidthInches > 16.5 && a3Landscape.pageWidthInches < 16.6);
  assert.ok(a3Landscape.pageHeightInches > 11.6 && a3Landscape.pageHeightInches < 11.7);
  assert.equal(a3Landscape.pixelWidth, 4961);
  assert.equal(a3Landscape.pixelHeight, 3508);
});

test('getSvgDimensions detects A3 sheet orientation correctly', () => {
  const a3Svg = `<svg viewBox="0 0 4200 2970" width="4200" height="2970"></svg>`;
  const dims = getSvgDimensions(a3Svg);
  assert.equal(dims.width, 4200);
  assert.equal(dims.height, 2970);
  assert.equal(dims.isLandscape, true);

  const portraitSvg = `<svg viewBox="0 0 2970 4200"></svg>`;
  const portraitDims = getSvgDimensions(portraitSvg);
  assert.equal(portraitDims.isLandscape, false);
});
