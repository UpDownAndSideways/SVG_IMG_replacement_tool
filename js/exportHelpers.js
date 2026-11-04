/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */



const PAPER_SIZES = {
  letter: {
    key: 'letter',
    name: 'US Letter',
    shortLabel: 'Letter',
    description: '8.5" × 11.0" (215.9 × 279.4 mm)',
    widthInInches: 8.5,
    heightInInches: 11.0,
    widthInMm: 215.9,
    heightInMm: 279.4,
  },
  ledger: {
    key: 'ledger',
    name: 'Ledger / Tabloid',
    shortLabel: 'Ledger',
    description: '11.0" × 17.0" (279.4 × 431.8 mm)',
    widthInInches: 11.0,
    heightInInches: 17.0,
    widthInMm: 279.4,
    heightInMm: 431.8,
  },
  a3: {
    key: 'a3',
    name: 'ISO A3',
    shortLabel: 'A3',
    description: '297 × 420 mm (11.69" × 16.54")',
    widthInInches: 11.6929,
    heightInInches: 16.5354,
    widthInMm: 297,
    heightInMm: 420,
  },
};

/**
 * Inspects SVG content to detect orientation and intrinsic aspect ratio.
 */
function getSvgDimensions(svgContent) {
  let width = 1050;
  let height = 600;

  const svgMatch = svgContent.match(/<svg\b([^>]*)>/i);
  if (svgMatch && svgMatch[1]) {
    const attrString = svgMatch[1];
    const vbMatch = attrString.match(/viewBox=["']([^"']+)["']/i);
    if (vbMatch) {
      const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    } else {
      const wMatch = attrString.match(/width=["']([^"']+)["']/i);
      const hMatch = attrString.match(/height=["']([^"']+)["']/i);
      if (wMatch && hMatch) {
        const wVal = parseFloat(wMatch[1]);
        const hVal = parseFloat(hMatch[1]);
        if (!isNaN(wVal) && !isNaN(hVal) && wVal > 0 && hVal > 0) {
          width = wVal;
          height = hVal;
        }
      }
    }
  }

  return {
    width,
    height,
    isLandscape: width >= height,
  };
}

/**
 * Calculates exact target pixel dimensions at 300 DPI for a chosen paper size and orientation.
 */
function getTargetDimensions(paperKey, isLandscape, dpi = 300) {
  const paper = PAPER_SIZES[paperKey];
  const shortInches = paper.widthInInches;
  const longInches = paper.heightInInches;

  const pageWidthInches = isLandscape ? longInches : shortInches;
  const pageHeightInches = isLandscape ? shortInches : longInches;

  const pixelWidth = Math.round(pageWidthInches * dpi);
  const pixelHeight = Math.round(pageHeightInches * dpi);

  return {
    pageWidthInches,
    pageHeightInches,
    pixelWidth,
    pixelHeight,
  };
}

/**
 * Renders SVG directly to a canvas of exact pixel dimensions (target width & height at 300 DPI).
 * Preserves the SVG's aspect ratio and centers it on the sheet without stretching or squashing.
 */
async function renderSvgToPrintCanvas(
  svgContent,
  targetWidth,
  targetHeight
) {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Clean crisp background for print
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const svgW = img.naturalWidth || targetWidth;
        const svgH = img.naturalHeight || targetHeight;

        // Calculate scale to fit exactly on the page without squashing
        const scale = Math.min(targetWidth / svgW, targetHeight / svgH);
        const drawW = svgW * scale;
        const drawH = svgH * scale;

        // Center on the sheet
        const drawX = (targetWidth - drawW) / 2;
        const drawY = (targetHeight - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG into raster image for printing'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Exports SVG to a print-ready PDF at exact paper dimensions (Letter, Ledger, or A3) at actual size.
 */
async function exportSvgToPrintPdf(
  svgContent,
  paperKey,
  fileName = 'business-cards-print.pdf'
) {
  const { isLandscape } = getSvgDimensions(svgContent);
  const dims = getTargetDimensions(paperKey, isLandscape, 300);

  // 1. Render SVG to 300 DPI canvas at exact paper pixel size
  const canvas = await renderSvgToPrintCanvas(svgContent, dims.pixelWidth, dims.pixelHeight);
  const imgData = canvas.toDataURL('image/png');

  // 2. Create PDF with the exact paper dimensions in inches
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const JsPDF = globalThis.jspdf && globalThis.jspdf.jsPDF;
  if (!JsPDF) {
    throw new Error('PDF library failed to load. Check your network connection and reload the page.');
  }
  const doc = new JsPDF({
    orientation,
    unit: 'in',
    format: [dims.pageWidthInches, dims.pageHeightInches],
    compress: true,
  });

  // 3. Draw the image to fill the exact page dimensions (1:1 actual size)
  doc.addImage(imgData, 'PNG', 0, 0, dims.pageWidthInches, dims.pageHeightInches, undefined, 'FAST');

  // 4. Download file
  const cleanName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(cleanName);
}

/**
 * Exports SVG to a high-resolution PNG at exact print dimensions (Letter, Ledger, or A3) at actual size (300 DPI).
 */
async function exportSvgToPrintPng(
  svgContent,
  paperKey,
  fileName = 'business-cards-print.png'
) {
  const { isLandscape } = getSvgDimensions(svgContent);
  const dims = getTargetDimensions(paperKey, isLandscape, 300);

  const canvas = await renderSvgToPrintCanvas(svgContent, dims.pixelWidth, dims.pixelHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        reject(new Error('Failed to create PNG blob'));
        return;
      }
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
      resolve();
    }, 'image/png');
  });
}

this.PAPER_SIZES = PAPER_SIZES;
this.getSvgDimensions = getSvgDimensions;
this.getTargetDimensions = getTargetDimensions;
this.renderSvgToPrintCanvas = renderSvgToPrintCanvas;
this.exportSvgToPrintPdf = exportSvgToPrintPdf;
this.exportSvgToPrintPng = exportSvgToPrintPng;
