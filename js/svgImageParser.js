/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses all <image ...> tags from an SVG string.
 * Works isomorphically in both Browser and Node.js test environments.
 */
function parseSvgImages(svgText) {
  if (!svgText || typeof svgText !== 'string') {
    return { slots: [], aspectRatioDisplay: 'Unknown', hasPlaceholders: false };
  }

  // Extract root SVG attributes for dimensions
  const svgMatch = svgText.match(/<svg\b([^>]*)>/i);
  let viewBox;
  let width;
  let height;

  if (svgMatch && svgMatch[1]) {
    const attrString = svgMatch[1];
    const vbMatch = attrString.match(/viewBox=["']([^"']+)["']/i);
    if (vbMatch) viewBox = vbMatch[1];
    const wMatch = attrString.match(/width=["']([^"']+)["']/i);
    if (wMatch) width = wMatch[1];
    const hMatch = attrString.match(/height=["']([^"']+)["']/i);
    if (hMatch) height = hMatch[1];
  }

  // Determine aspect ratio display
  let aspectRatioDisplay = 'Standard';
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      const w = parts[2];
      const h = parts[3];
      const ratio = w / h;
      const longSide = Math.max(w, h);
      const shortSide = Math.min(w, h);
      const sheetRatio = longSide / shortSide;

      if (Math.abs(sheetRatio - (420 / 297)) < 0.05) {
        aspectRatioDisplay = 'A3 Sheet (297 × 420 mm)';
      } else if (Math.abs(sheetRatio - (17 / 11)) < 0.05) {
        aspectRatioDisplay = 'Ledger / Tabloid (11" × 17")';
      } else if (Math.abs(sheetRatio - (11 / 8.5)) < 0.05) {
        aspectRatioDisplay = 'Letter Sheet (8.5" × 11")';
      } else if (Math.abs(ratio - 1.75) < 0.1 || Math.abs(ratio - 3.5 / 2) < 0.1) {
        aspectRatioDisplay = '3.5" × 2" (Standard Business Card)';
      } else if (Math.abs(ratio - 1.64) < 0.1) {
        aspectRatioDisplay = '85mm × 55mm (European Card)';
      } else if (Math.abs(ratio - 1) < 0.05) {
        aspectRatioDisplay = 'Square (1:1)';
      } else {
        aspectRatioDisplay = `${Math.round(w)} × ${Math.round(h)} px (${ratio.toFixed(2)}:1)`;
      }
    }
  }

  // Match all <image .../> tags (including multiline and self-closing or paired)
  const imageTagRegex = /<image\b([^>]*)(?:\/>|>([\s\S]*?)<\/image>)/gi;
  const slots = [];
  let match;
  let index = 0;

  while ((match = imageTagRegex.exec(svgText)) !== null) {
    const fullTag = match[0];
    const attrs = match[1];

    const getAttr = (name) => {
      const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
      return m ? m[1] : undefined;
    };

    const idAttr = getAttr('id');
    const hrefAttr = getAttr('href');
    const xlinkHrefAttr = getAttr('xlink:href');
    const currentHref = hrefAttr ?? xlinkHrefAttr ?? '';
    const hasXlink = !!xlinkHrefAttr;

    const widthAttr = getAttr('width');
    const heightAttr = getAttr('height');
    const xAttr = getAttr('x');
    const yAttr = getAttr('y');
    const preserveAspectRatio = getAttr('preserveAspectRatio');
    const clipPath = getAttr('clip-path') || getAttr('clipPath');

    let type = 'empty';
    let mimeType;

    if (currentHref.startsWith('data:image/')) {
      type = 'base64';
      const mimeMatch = currentHref.match(/^data:(image\/[a-zA-Z0-9+.-]+);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    } else if (/^https?:\/\//i.test(currentHref)) {
      type = 'remote';
    } else if (currentHref.length > 0) {
      type = 'relative';
    }

    // Determine intuitive user-facing label
    let label = `Image Placeholder #${index + 1}`;
    if (idAttr) {
      // Clean up common id naming conventions (e.g. "portrait-photo", "Logo_Main")
      const clean = idAttr
        .replace(/[-_]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
      label = clean.charAt(0).toUpperCase() + clean.slice(1);
    } else if (clipPath && /avatar|circle|portrait/i.test(clipPath)) {
      label = `Profile Portrait (${index + 1})`;
    } else if (widthAttr && heightAttr) {
      label = `Slot ${index + 1} (${widthAttr}×${heightAttr})`;
    }

    slots.push({
      id: idAttr || `svg-slot-${index + 1}`,
      originalId: idAttr,
      index,
      href: currentHref,
      hasXlink,
      width: widthAttr,
      height: heightAttr,
      x: xAttr,
      y: yAttr,
      preserveAspectRatio,
      clipPath,
      type,
      mimeType,
      label,
      rawTag: fullTag,
    });

    index++;
  }

  return {
    slots,
    viewBox,
    width,
    height,
    aspectRatioDisplay,
    hasPlaceholders: slots.length > 0,
  };
}

/**
 * Options for replacing SVG images
 */
/**
 * Replaces one or more image placeholders in the SVG with a new image URI (usually Data URL).
 */
function replaceSvgImages(
  svgText,
  replacements,
  options = {}
) {
  if (!svgText) return '';

  let currentIndex = 0;
  const imageTagRegex = /<image\b([^>]*?)(\/?>)/gi;

  const updatedSvg = svgText.replace(imageTagRegex, (fullMatch, attrContent, closing) => {
    // Check if this slot matches either by numeric index or by id
    const idMatch = attrContent.match(/id=["']([^"']*)["']/i);
    const id = idMatch ? idMatch[1] : undefined;

    let newHref;
    if (replacements[currentIndex] !== undefined) {
      newHref = replacements[currentIndex];
    } else if (id && replacements[id] !== undefined) {
      newHref = replacements[id];
    } else if (replacements['*'] !== undefined) {
      // Wildcard replace all
      newHref = replacements['*'];
    }

    const slotIndex = currentIndex;
    currentIndex++;

    if (!newHref) {
      return fullMatch;
    }

    let modifiedAttrs = attrContent;

    // Check if xlink:href exists
    const hasXlink = /xlink:href=["'][^"']*["']/i.test(modifiedAttrs);
    const hasHref = /\bhref=["'][^"']*["']/i.test(modifiedAttrs);

    // Update or inject href
    if (hasHref) {
      modifiedAttrs = modifiedAttrs.replace(/\bhref=["'][^"']*["']/i, `href="${newHref}"`);
    } else {
      modifiedAttrs += ` href="${newHref}"`;
    }

    // Update or inject xlink:href for maximum backwards compatibility (Illustrator, inkscape, old SVG renderers)
    if (hasXlink || options.ensureXlink !== false) {
      if (hasXlink) {
        modifiedAttrs = modifiedAttrs.replace(/xlink:href=["'][^"']*["']/i, `xlink:href="${newHref}"`);
      } else {
        modifiedAttrs += ` xlink:href="${newHref}"`;
      }
    }

    // Adjust preserveAspectRatio if specified
    if (options.preserveAspectRatio && options.preserveAspectRatio !== 'original') {
      const parValue =
        options.preserveAspectRatio === 'cover'
          ? 'xMidYMid slice'
          : options.preserveAspectRatio === 'contain'
          ? 'xMidYMid meet'
          : 'none';

      if (/preserveAspectRatio=["'][^"']*["']/i.test(modifiedAttrs)) {
        modifiedAttrs = modifiedAttrs.replace(
          /preserveAspectRatio=["'][^"']*["']/i,
          `preserveAspectRatio="${parValue}"`
        );
      } else {
        modifiedAttrs += ` preserveAspectRatio="${parValue}"`;
      }
    }

    return `<image${modifiedAttrs}${closing}`;
  });

  return updatedSvg;
}

/**
 * Maps a single image to ALL detected image placeholders in the SVG.
 */
function replaceAllSvgImages(
  svgText,
  newImageUri,
  options = {}
) {
  return replaceSvgImages(svgText, { '*': newImageUri }, options);
}

/**
 * Quick SVG validation helper.
 */
function validateSvg(svgText) {
  if (!svgText || typeof svgText !== 'string' || !svgText.trim()) {
    return { valid: false, error: 'SVG file is empty' };
  }
  const clean = svgText.trim();
  if (!clean.includes('<svg') || !clean.includes('</svg>')) {
    return { valid: false, error: 'Missing <svg> or </svg> tags' };
  }
  return { valid: true };
}

this.parseSvgImages = parseSvgImages;
this.replaceSvgImages = replaceSvgImages;
this.replaceAllSvgImages = replaceAllSvgImages;
this.validateSvg = validateSvg;
