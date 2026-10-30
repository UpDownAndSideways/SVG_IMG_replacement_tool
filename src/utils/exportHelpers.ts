/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Downloads a string content as an SVG file.
 */
export function downloadSvgFile(svgContent: string, fileName = 'business-card-updated.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts an SVG string into a high-resolution PNG file and triggers download.
 * Multiplier defaults to 3 for ultra-crisp 300+ DPI print quality.
 */
export async function exportSvgToPng(
  svgContent: string,
  fileName = 'business-card-print.png',
  dpiMultiplier = 3
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        // Extract native dimensions or fallback
        const naturalW = img.naturalWidth || 1050;
        const naturalH = img.naturalHeight || 600;

        const canvas = document.createElement('canvas');
        canvas.width = naturalW * dpiMultiplier;
        canvas.height = naturalH * dpiMultiplier;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

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
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG into raster image'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Copies text to clipboard with modern navigator.clipboard or fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
