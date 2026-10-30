/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleImage {
  id: string;
  name: string;
  category: 'Portrait' | 'Logo' | 'Abstract';
  dataUrl: string;
}

function toBase64(svgStr: string) {
  if (typeof btoa !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svgStr)}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svgStr).toString('base64')}`;
}

export const SAMPLE_REPLACEMENT_IMAGES: SampleImage[] = [
  {
    id: 'sample-portrait-1',
    name: 'Executive Headshot',
    category: 'Portrait',
    dataUrl: toBase64(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="300" height="300" fill="url(#bg)"/><circle cx="150" cy="115" r="58" fill="#f8fafc"/><path d="M70 260 C70 190 110 170 150 170 C190 170 230 190 230 260 Z" fill="#38bdf8"/><circle cx="150" cy="110" r="48" fill="#fdba74"/><path d="M115 95 Q150 65 185 95 Q170 70 150 70 Q130 70 115 95 Z" fill="#1e293b"/><circle cx="135" cy="110" r="4" fill="#0f172a"/><circle cx="165" cy="110" r="4" fill="#0f172a"/><path d="M140 130 Q150 138 160 130" stroke="#ea580c" stroke-width="2" fill="none"/></svg>`
    ),
  },
  {
    id: 'sample-portrait-2',
    name: 'Creative Founder',
    category: 'Portrait',
    dataUrl: toBase64(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4338ca"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs><rect width="300" height="300" fill="url(#bg2)"/><circle cx="150" cy="115" r="58" fill="#f1f5f9"/><path d="M60 265 C60 195 105 175 150 175 C195 175 240 195 240 265 Z" fill="#fbbf24"/><circle cx="150" cy="115" r="48" fill="#fecdd3"/><circle cx="132" cy="112" r="5" fill="#312e81"/><circle cx="168" cy="112" r="5" fill="#312e81"/><circle cx="132" cy="112" r="14" fill="none" stroke="#1e1b4b" stroke-width="3"/><circle cx="168" cy="112" r="14" fill="none" stroke="#1e1b4b" stroke-width="3"/><line x1="146" y1="112" x2="154" y2="112" stroke="#1e1b4b" stroke-width="3"/><path d="M140 136 Q150 144 160 136" stroke="#e11d48" stroke-width="3" fill="none"/></svg>`
    ),
  },
  {
    id: 'sample-logo-1',
    name: 'Prism Tech Mark',
    category: 'Logo',
    dataUrl: toBase64(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" rx="16" fill="#09090b"/><path d="M50 75 L80 30 L110 75 L80 120 Z" fill="#0071E3"/><circle cx="80" cy="75" r="14" fill="#ffffff"/><text x="135" y="85" fill="#ffffff" font-family="-apple-system, sans-serif" font-weight="800" font-size="28" letter-spacing="1">PRISM</text></svg>`
    ),
  },
  {
    id: 'sample-logo-2',
    name: 'Apex Studio Crest',
    category: 'Logo',
    dataUrl: toBase64(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" rx="16" fill="#18181b"/><circle cx="75" cy="75" r="38" fill="none" stroke="#10b981" stroke-width="6"/><path d="M60 75 L75 55 L90 75 L75 95 Z" fill="#10b981"/><text x="135" y="86" fill="#f4f4f5" font-family="-apple-system, sans-serif" font-weight="700" font-size="26" letter-spacing="2">APEX</text></svg>`
    ),
  },
  {
    id: 'sample-abstract-1',
    name: 'Gradient Architecture',
    category: 'Abstract',
    dataUrl: toBase64(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="50%" stop-color="#6366f1"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><rect width="400" height="600" fill="url(#g3)"/><circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="0" y1="300" x2="400" y2="300" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>`
    ),
  },
];
