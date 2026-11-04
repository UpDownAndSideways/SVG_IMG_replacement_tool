/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Icon paths from Lucide (ISC), inlined so the page does not need a build.
 */
const ICONS = {
  "alert-circle": "<circle cx=\"12\" cy=\"12\" r=\"10\" />\n  <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" />\n  <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />",
  "arrow-left": "<path d=\"m12 19-7-7 7-7\" />\n  <path d=\"M19 12H5\" />",
  "arrow-right": "<path d=\"M5 12h14\" />\n  <path d=\"m12 5 7 7-7 7\" />",
  "check": "<path d=\"M20 6 9 17l-5-5\" />",
  "code": "<path d=\"m16 18 6-6-6-6\" />\n  <path d=\"m8 6-6 6 6 6\" />",
  "file-down": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" />\n  <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" />\n  <path d=\"M12 18v-6\" />\n  <path d=\"m9 15 3 3 3-3\" />",
  "file-text": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" />\n  <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" />\n  <path d=\"M10 9H8\" />\n  <path d=\"M16 13H8\" />\n  <path d=\"M16 17H8\" />",
  "grid-3x3": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" />\n  <path d=\"M3 9h18\" />\n  <path d=\"M3 15h18\" />\n  <path d=\"M9 3v18\" />\n  <path d=\"M15 3v18\" />",
  "image": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" />\n  <circle cx=\"9\" cy=\"9\" r=\"2\" />\n  <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" />",
  "layers": "<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\" />\n  <path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\" />\n  <path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\" />",
  "maximize-2": "<path d=\"M15 3h6v6\" />\n  <path d=\"m21 3-7 7\" />\n  <path d=\"m3 21 7-7\" />\n  <path d=\"M9 21H3v-6\" />",
  "moon": "<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\" />",
  "printer": "<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" />\n  <path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" />\n  <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\" />",
  "rotate-ccw": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" />\n  <path d=\"M3 3v5h5\" />",
  "sliders-horizontal": "<path d=\"M10 5H3\" />\n  <path d=\"M12 19H3\" />\n  <path d=\"M14 3v4\" />\n  <path d=\"M16 17v4\" />\n  <path d=\"M21 12h-9\" />\n  <path d=\"M21 19h-5\" />\n  <path d=\"M21 5h-7\" />\n  <path d=\"M8 10v4\" />\n  <path d=\"M8 12H3\" />",
  "sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" />\n  <path d=\"M20 2v4\" />\n  <path d=\"M22 4h-4\" />\n  <circle cx=\"4\" cy=\"20\" r=\"2\" />",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\" />\n  <path d=\"M12 2v2\" />\n  <path d=\"M12 20v2\" />\n  <path d=\"m4.93 4.93 1.41 1.41\" />\n  <path d=\"m17.66 17.66 1.41 1.41\" />\n  <path d=\"M2 12h2\" />\n  <path d=\"M20 12h2\" />\n  <path d=\"m6.34 17.66-1.41 1.41\" />\n  <path d=\"m19.07 4.93-1.41 1.41\" />",
  "upload-cloud": "<path d=\"M12 13v8\" />\n  <path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" />\n  <path d=\"m8 17 4-4 4 4\" />",
  "upload": "<path d=\"M12 3v12\" />\n  <path d=\"m17 8-5-5-5 5\" />\n  <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" />",
  "zoom-in": "<circle cx=\"11\" cy=\"11\" r=\"8\" />\n  <line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" />\n  <line x1=\"11\" x2=\"11\" y1=\"8\" y2=\"14\" />\n  <line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />",
  "zoom-out": "<circle cx=\"11\" cy=\"11\" r=\"8\" />\n  <line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" />\n  <line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />",
};

function icon(name) {
  const body = ICONS[name] || '';
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
}
