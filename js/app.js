/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CardCraft UI. Classic script: open index.html, no compile step.
 */

const state = {
  step: 1,
  originalSvg: '',
  currentSvg: '',
  fileName: 'business-card.svg',
  upload: { dragging: false, pasteMode: false, pastedText: '', error: null },
  map: {
    highlightId: null,
    fitMode: 'cover',
    tab: 'bulk',
    slotIndex: null,
    message: null,
    messageError: false,
    messageTimer: 0,
  },
  exp: {
    paper: null,
    pdfBusy: false,
    pdfOk: false,
    pngBusy: false,
    pngOk: false,
    error: null,
    timers: { pdf: 0, png: 0 },
  },
  preview: {
    2: { zoom: 100, theme: 'light' },
    3: { zoom: 100, theme: 'light' },
  },
};

let renderedStep = 1;
let openingFile = false;

function hasSvg() {
  return Boolean(state.currentSvg && state.currentSvg.trim());
}

let parsedCacheKey = null;
let parsedCacheValue = null;
function parsedSvg() {
  if (parsedCacheKey !== state.currentSvg) {
    parsedCacheKey = state.currentSvg;
    parsedCacheValue = parseSvgImages(state.currentSvg);
  }
  return parsedCacheValue;
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function renderedSvg(svg, highlightId) {
  if (!svg) return '';
  if (!highlightId) return svg;
  const safe = window.CSS && CSS.escape ? CSS.escape(highlightId) : String(highlightId).replace(/[^a-zA-Z0-9_-]/g, '');
  const style = `<style>#${safe}{outline:4px solid #0071E3 !important;outline-offset:2px !important;filter:drop-shadow(0 0 12px rgba(0,113,227,.6)) !important;}</style>`;
  return svg.replace(/<svg\b([^>]*)>/i, `<svg $1>${style}`);
}

function defaultPaper(svg) {
  const dims = getSvgDimensions(svg);
  const longSide = Math.max(dims.width, dims.height);
  const shortSide = Math.min(dims.width, dims.height);
  const ratio = shortSide > 0 ? longSide / shortSide : 1;
  if (Math.abs(ratio - 420 / 297) < 0.08) return 'a3';
  if (Math.abs(ratio - 17 / 11) < 0.08) return 'ledger';
  if (Math.abs(ratio - 11 / 8.5) < 0.08) return 'letter';
  return 'a3';
}

function paperKey() {
  return state.exp.paper || defaultPaper(state.currentSvg);
}

function cleanName() {
  return state.fileName.replace(/\.svg$/i, '') + '-customized';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

function render() {
  const root = document.getElementById('app');
  const keepScroll = renderedStep === state.step;
  const scrollY = window.scrollY;
  root.innerHTML = page();
  renderedStep = state.step;
  if (keepScroll) window.scrollTo(0, scrollY);
  else window.scrollTo(0, 0);
}

function page() {
  return `<div class="app">${header()}${main()}<footer class="footer"><div class="footer-inner"><div>CardCraft · Precision SVG Image Mapping for Business Cards</div><div>Client-side Processing · Actual Size 300 DPI Export</div></div></footer></div>`;
}

function header() {
  const svg = hasSvg();
  const step = state.step;
  const stepBtn = (n, label) => {
    const enabled = n === 1 || svg;
    return `<button type="button" class="step-btn${step === n ? ' is-current' : ''}" data-action="goto" data-step="${n}" ${enabled ? '' : 'disabled'} ${step === n ? 'aria-current="step"' : ''}>${label}</button>`;
  };
  let actions = '';
  if (svg && step === 2) {
    actions += `<button type="button" class="btn btn-primary" data-action="goto" data-step="3">Export ${icon('arrow-right')}</button>`;
  }
  if (svg && step !== 1) {
    actions += `<button type="button" class="btn btn-ghost" data-action="reset" title="Reset and start over">${icon('rotate-ccw')}<span class="start-label">Start Over</span></button>`;
  }
  if (!svg) actions += `<div class="quiet">Business Card Ready</div>`;
  return `<header class="header"><div class="header-inner"><div class="brand"><div class="brand-mark">${icon('layers')}</div><span class="brand-name">CardCraft</span><span class="brand-sub">SVG Image Mapper</span></div><nav class="stepper" aria-label="Process steps">${stepBtn(1, '1. Upload')}${stepBtn(2, '2. Map')}${stepBtn(3, '3. Export')}</nav><div class="header-actions">${actions}</div></div></header>`;
}

function main() {
  if (state.step === 1) return `<main class="main"><div class="wrap-narrow">${stepUpload()}</div></main>`;
  if (state.step === 2) return `<main class="main"><div class="wrap">${stepMap()}</div></main>`;
  return `<main class="main"><div class="wrap-mid">${stepExport()}</div></main>`;
}

function stepUpload() {
  const error = state.upload.error
    ? `<div class="banner banner-error" role="alert">${icon('alert-circle')}<span>${esc(state.upload.error)}</span></div>`
    : '';
  const body = state.upload.pasteMode ? pasteBox() : dropBox();
  return `<section class="hero"><h1>Upload Your SVG Template</h1><p class="lede">Drop your business card SVG to automatically detect all linked image placeholders and map new assets.</p></section>${error}${body}<section class="panel guide"><h2 class="kicker">How CardCraft Works</h2><div class="guide-grid"><div><h3>1. Upload SVG</h3><p>Export your business card design from Figma, Illustrator, or Inkscape as an SVG file and drop it here.</p></div><div><h3>2. Map Images</h3><p>Upload replacement headshots or logos. Map them to all placeholders at once or configure each slot.</p></div><div><h3>3. Actual Size Print</h3><p>Export a 300 DPI print-ready PDF or high-res PNG sized for Letter, Ledger, or A3 sheets at actual size.</p></div></div></section>`;
}

function dropBox() {
  const drag = state.upload.dragging ? ' is-drag' : '';
  return `<div class="dropzone${drag}" data-drop="svg" data-input="svg-file"><input id="svg-file" class="hidden-file" data-file="svg" type="file" accept=".svg,image/svg+xml" /><div class="drop-icon">${icon('upload-cloud')}</div><h3>Drop your SVG business card here</h3><p class="support">Supports vector SVGs exported from Figma, Illustrator, Inkscape, or Sketch</p><button type="button" class="btn btn-primary" data-action="browse-svg">Browse Files ${icon('arrow-right')}</button><div class="drop-alt"><button type="button" class="linkish" data-action="show-paste">${icon('code')} Or paste raw SVG code</button></div></div>`;
}

function pasteBox() {
  return `<div class="panel paste"><div class="paste-head"><h3>${icon('code')} Paste SVG Code</h3><button type="button" class="linkish" data-action="hide-paste">Back to file upload</button></div><textarea id="svg-paste" placeholder="&lt;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1050 600'&gt;&#10;  &lt;image id='avatar' href='...' /&gt;&#10;&lt;/svg&gt;">${esc(state.upload.pastedText)}</textarea><div class="paste-actions"><button type="button" class="btn" data-action="hide-paste">Cancel</button><button type="button" class="btn btn-primary" id="paste-submit" data-action="paste-submit" ${state.upload.pastedText.trim() ? '' : 'disabled'}>Parse &amp; Map Images ${icon('arrow-right')}</button></div></div>`;
}

function stepMap() {
  const parsed = parsedSvg();
  const count = parsed.slots.length;
  const message = state.map.message
    ? `<div class="banner ${state.map.messageError ? 'banner-error' : 'banner-ok'}" role="status">${icon(state.map.messageError ? 'alert-circle' : 'check')}<span>${esc(state.map.message)}</span></div>`
    : '';
  return `<section class="map-page"><div class="map-top"><div><div class="crumb"><button type="button" data-action="goto" data-step="1">Templates</button><span>/</span><strong>${esc(state.fileName || 'Business Card')}</strong><span>·</span><span class="pill">${esc(parsed.aspectRatioDisplay)}</span></div><h2>Map Embedded Images</h2></div><button type="button" class="btn btn-white" data-action="revert">${icon('rotate-ccw')} Reset to Original</button></div>${message}<div class="split"><div class="workbench">${tabs(count)}${fitBar()}${state.map.tab === 'bulk' ? bulkPanel(count) : slotPanel(parsed)}</div><div class="preview-col"><div class="panel preview-shell"><div class="preview-head"><h3><span class="live-dot"></span> Live Card Preview <span style="font-weight:450;color:#86868b">(Updates in real time)</span></h3><span class="hover-hint">Hover slot to highlight on card</span></div>${previewHtml(2, state.currentSvg, state.map.highlightId)}</div></div></div></section>`;
}

function tabs(count) {
  const tab = (id, label) => `<button type="button" class="tab${state.map.tab === id ? ' is-current' : ''}" data-action="tab" data-tab="${id}">${label}</button>`;
  return `<div class="tabs">${tab('bulk', `Map to All (${count} Placeholders)`)}${tab('slots', `Individual Slots (${count})`)}</div>`;
}

function fitBar() {
  const button = (mode, label, title) => `<button type="button" data-action="fit" data-fit="${mode}" class="${state.map.fitMode === mode ? 'is-current' : ''}" title="${attr(title)}">${label}</button>`;
  return `<div class="panel fitbar"><div class="fit-label">${icon('sliders-horizontal')} Image Scaling Mode:</div><div class="segment">${button('cover', 'Cover (Fill)', 'Crop and fill the frame without distortion')}${button('contain', 'Fit (Contain)', 'Fit the entire image inside the frame')}</div></div>`;
}

function bulkPanel(count) {
  const drag = state.upload.dragging ? ' is-drag' : '';
  return `<div class="panel bulk"><div><h3 class="block-title">${icon('upload')} Upload Image to Map to All Placeholders</h3><p class="support">Replaces every detected image placeholder (${count} total) inside your SVG template in one step.</p></div><div class="mini-drop${drag}" data-drop="bulk" data-input="bulk-file"><input id="bulk-file" class="hidden-file" data-file="bulk" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" /><div class="mini-icon">${icon('upload')}</div><strong>Upload Master Replacement Image</strong><span>Supports PNG, JPG, WebP, or SVG vector</span></div><div class="help"><strong>Batch Image Replacement</strong><p>Drop any photograph, corporate monogram, portrait, or vector artwork. It will be encoded as base64 and mapped across all image positions in your template.</p></div></div>`;
}

function slotPanel(parsed) {
  if (!parsed.slots.length) {
    return `<p class="empty-slots">No <code>&lt;image&gt;</code> placeholders were found in this file. Text, paths, and clipped groups are left as they are.</p><input id="slot-file" class="hidden-file" data-file="slot" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />`;
  }
  const cards = parsed.slots.map((slot) => {
    const hot = state.map.highlightId === slot.id ? ' is-hot' : '';
    const dim = slot.width && slot.height ? `${slot.width}×${slot.height}` : 'Dynamic';
    const thumb = slot.href
      ? `<img src="${attr(slot.href)}" alt="${attr(slot.label)}" />`
      : icon('image');
    const clipped = slot.clipPath ? `<span>·</span><span class="clipped">Clipped</span>` : '';
    return `<article class="panel slot${hot}" data-slot-id="${attr(slot.id)}"><div class="thumb">${thumb}</div><div class="slot-body"><div class="slot-head"><h3>${esc(slot.label)}</h3><span class="dim">${esc(dim)}</span></div><div class="meta"><span>Tag ID: <code>${esc(slot.id)}</code></span>${clipped}</div><button type="button" class="btn btn-soft" data-action="browse-slot" data-index="${slot.index}">${icon('upload')} Upload Image for this Slot</button></div></article>`;
  }).join('');
  return `<div class="slot-list">${cards}</div><input id="slot-file" class="hidden-file" data-file="slot" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />`;
}

function previewHtml(which, svg, highlightId) {
  const prefs = state.preview[which];
  const themeBtn = (theme, name, label, extra) => `<button type="button" class="icon-btn${extra || ''}${prefs.theme === theme ? ' is-on' : ''}" data-action="theme" data-preview="${which}" data-theme="${theme}" title="${attr(label)}" aria-label="${attr(label)}">${icon(name)}</button>`;
  const reset = prefs.zoom !== 100
    ? `<button type="button" class="icon-btn" data-action="zoom-reset" data-preview="${which}" title="Reset 100%" aria-label="Reset zoom">${icon('maximize-2')}</button>`
    : '';
  return `<div class="preview" id="preview-${which}"><div class="preview-controls">${themeBtn('light', 'sun', 'Light Desk Surface', '')}${themeBtn('dark', 'moon', 'Dark Desk Surface', ' is-dark')}${themeBtn('grid', 'grid-3x3', 'Design Grid', '')}<span class="rule"></span><button type="button" class="icon-btn" data-action="zoom-out" data-preview="${which}" title="Zoom out" aria-label="Zoom out">${icon('zoom-out')}</button><span class="zoom-label">${prefs.zoom}%</span><button type="button" class="icon-btn" data-action="zoom-in" data-preview="${which}" title="Zoom in" aria-label="Zoom in">${icon('zoom-in')}</button>${reset}</div><div class="preview-stage theme-${prefs.theme}"><div class="preview-scale" style="transform:scale(${prefs.zoom / 100})"><div class="preview-card"><div class="preview-svg">${renderedSvg(svg, highlightId)}</div></div></div></div></div>`;
}

function stepExport() {
  const parsed = parsedSvg();
  const dims = getSvgDimensions(state.currentSvg);
  const key = paperKey();
  const paper = PAPER_SIZES[key];
  const target = getTargetDimensions(key, dims.isLandscape, 300);
  const error = state.exp.error
    ? `<div class="banner banner-error" role="alert">${icon('alert-circle')}<span>${esc(state.exp.error)}</span></div>`
    : '';
  const sheets = ['letter', 'ledger', 'a3'].map((name) => {
    const item = PAPER_SIZES[name];
    const px = getTargetDimensions(name, dims.isLandscape, 300);
    const selected = name === key;
    return `<button type="button" class="sheet${selected ? ' is-selected' : ''}" data-action="paper" data-paper="${name}"><span><span class="sheet-name">${esc(item.name)}${selected ? `<span class="check-bubble">${icon('check')}</span>` : ''}</span><span class="desc">${esc(item.description)}</span></span><span class="px">300 DPI: ${px.pixelWidth} × ${px.pixelHeight} px</span></button>`;
  }).join('');

  let pdfLabel = `${icon('printer')} Download ${esc(paper.shortLabel)} PDF`;
  if (state.exp.pdfOk) pdfLabel = `${icon('check')} PDF Downloaded!`;
  else if (state.exp.pdfBusy) pdfLabel = `Generating ${esc(paper.shortLabel)} PDF...`;

  let pngLabel = `${icon('file-down')} Download ${esc(paper.shortLabel)} PNG`;
  if (state.exp.pngOk) pngLabel = `${icon('check')} <span class="ok">Saved ${esc(paper.shortLabel)} PNG</span>`;
  else if (state.exp.pngBusy) pngLabel = 'Generating PNG...';

  return `<section class="export-page"><div class="hero"><div class="ready">${icon('sparkles')} Card Complete &amp; Ready for Print</div><h1>Export at Actual Size</h1><p class="lede">Choose your target sheet format. The export outputs at exact 1:1 physical dimensions without squashing or distortion.</p></div>${error}<div class="panel panel-lg hero-card">${previewHtml(3, state.currentSvg, null)}</div><div class="panel sheet-panel"><div class="sheet-head"><div><h3>Select Print Sheet Dimensions</h3><p>Exports will match this physical page geometry at 100% actual print size (300 DPI)</p></div><div class="orient">Orientation: ${dims.isLandscape ? 'Landscape' : 'Portrait'}</div></div><div class="sheet-grid">${sheets}</div></div><div class="panel panel-lg pdf-card"><div><div class="badge">Primary Option · 1:1 Scale</div><h3>${icon('file-text')} Print-Ready PDF (${esc(paper.shortLabel)})</h3><p>Native ${esc(paper.name)} page format (${target.pageWidthInches.toFixed(2)}" × ${target.pageHeightInches.toFixed(2)}"). Your template is preserved at actual size without squashing or distortion, ready for direct press output.</p></div><div class="pdf-side"><button type="button" class="btn btn-primary btn-lg" data-action="pdf" ${state.exp.pdfBusy ? 'disabled' : ''}>${pdfLabel}</button><div class="fine">Actual Size · 300 DPI</div></div></div><div class="panel png-row"><div><div class="png-title"><div class="png-mark">${icon('image')}</div><h3>Print-Ready PNG (${target.pixelWidth} × ${target.pixelHeight} px)</h3></div><p class="png-copy">Rasterized at actual size for ${esc(paper.name)} at 300 DPI (${target.pageWidthInches.toFixed(2)}" × ${target.pageHeightInches.toFixed(2)}") without squashing.</p></div><button type="button" class="btn btn-line" data-action="png" ${state.exp.pngBusy ? 'disabled' : ''}>${pngLabel}</button></div><div class="panel spec-panel"><h3 class="kicker">Production Specifications</h3><div class="specs-grid"><div><span class="spec-label">Selected Sheet Format</span><span class="spec-value">${esc(paper.name)}</span></div><div><span class="spec-label">Physical Size</span><span class="spec-value mono">${target.pageWidthInches.toFixed(2)}" × ${target.pageHeightInches.toFixed(2)}"</span></div><div><span class="spec-label">300 DPI Canvas</span><span class="spec-value mono">${target.pixelWidth} × ${target.pixelHeight} px</span></div><div><span class="spec-label">Mapped Placeholders</span><span class="spec-value">${parsed.slots.length} Embedded Slots</span></div></div></div><div class="bottom-nav"><button type="button" class="text-btn" data-action="goto" data-step="2">${icon('arrow-left')} Back to Mapping</button><button type="button" class="text-btn" data-action="reset">${icon('rotate-ccw')} Upload Another SVG</button></div></section>`;
}

function loadSvg(content, fileName) {
  const validation = validateSvg(content);
  if (!validation.valid) {
    state.upload.error = validation.error || 'Invalid SVG content.';
    state.step = 1;
    render();
    return;
  }
  state.originalSvg = content;
  state.currentSvg = content;
  state.fileName = fileName || 'custom-card.svg';
  state.upload.error = null;
  state.exp.paper = null;
  state.exp.error = null;
  state.exp.pdfOk = false;
  state.exp.pngOk = false;
  state.map.highlightId = null;
  state.map.message = null;
  state.map.tab = 'bulk';
  state.step = 2;
  render();
}

function resetAll() {
  clearTimeout(state.map.messageTimer);
  clearTimeout(state.exp.timers.pdf);
  clearTimeout(state.exp.timers.png);
  state.step = 1;
  state.originalSvg = '';
  state.currentSvg = '';
  state.fileName = 'business-card.svg';
  state.upload = { dragging: false, pasteMode: false, pastedText: '', error: null };
  state.map.highlightId = null;
  state.map.message = null;
  state.map.fitMode = 'cover';
  state.map.tab = 'bulk';
  state.map.slotIndex = null;
  state.exp.paper = null;
  state.exp.error = null;
  state.exp.pdfBusy = false;
  state.exp.pngBusy = false;
  state.exp.pdfOk = false;
  state.exp.pngOk = false;
  state.preview[2] = { zoom: 100, theme: 'light' };
  state.preview[3] = { zoom: 100, theme: 'light' };
  render();
}

function handleSvgFile(file) {
  const name = file.name || '';
  if (!name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
    state.upload.error = 'Please upload a valid .svg vector file.';
    state.step = 1;
    render();
    return;
  }
  const reader = new FileReader();
  reader.onload = () => loadSvg(String(reader.result || ''), name);
  reader.onerror = () => {
    state.upload.error = 'Failed to read the file.';
    state.step = 1;
    render();
  };
  reader.readAsText(file);
}

function setMapMessage(text, isError, ms) {
  state.map.message = text;
  state.map.messageError = Boolean(isError);
  clearTimeout(state.map.messageTimer);
  render();
  state.map.messageTimer = setTimeout(() => {
    state.map.message = null;
    if (state.step === 2) render();
  }, ms || 3500);
}

async function handleMapToAll(file) {
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const count = parsedSvg().slots.length;
    state.currentSvg = replaceAllSvgImages(state.currentSvg, dataUrl, { preserveAspectRatio: state.map.fitMode });
    setMapMessage(`Mapped "${file.name}" to all ${count} placeholders`);
  } catch (err) {
    setMapMessage('Could not read that image.', true);
  }
}

async function handleMapToSingleSlot(slotIndex, file) {
  try {
    const dataUrl = await readFileAsDataUrl(file);
    state.currentSvg = replaceSvgImages(state.currentSvg, { [slotIndex]: dataUrl }, { preserveAspectRatio: state.map.fitMode });
    setMapMessage(`Updated image in Slot #${slotIndex + 1}`);
  } catch (err) {
    setMapMessage('Could not read that image.', true);
  }
}

function setFit(mode) {
  state.map.fitMode = mode;
  if (mode !== 'original') {
    state.currentSvg = replaceSvgImages(state.currentSvg, {}, { preserveAspectRatio: mode });
  }
  render();
}

function openFile(id) {
  if (openingFile) return;
  const input = document.getElementById(id);
  if (!input) return;
  openingFile = true;
  input.click();
  setTimeout(() => {
    openingFile = false;
  }, 500);
}

function patchPreview(which) {
  const root = document.getElementById(`preview-${which}`);
  if (!root) return;
  const prefs = state.preview[which];
  const scale = root.querySelector('.preview-scale');
  if (scale) scale.style.transform = `scale(${prefs.zoom / 100})`;
  const label = root.querySelector('.zoom-label');
  if (label) label.textContent = `${prefs.zoom}%`;
  const stage = root.querySelector('.preview-stage');
  if (stage) stage.className = `preview-stage theme-${prefs.theme}`;
  root.querySelectorAll('[data-action="theme"]').forEach((button) => {
    button.classList.toggle('is-on', button.dataset.theme === prefs.theme);
  });
  const reset = root.querySelector('[data-action="zoom-reset"]');
  if (prefs.zoom !== 100 && !reset) {
    const zoomIn = root.querySelector('[data-action="zoom-in"]');
    zoomIn.insertAdjacentHTML('afterend', `<button type="button" class="icon-btn" data-action="zoom-reset" data-preview="${which}" title="Reset 100%" aria-label="Reset zoom">${icon('maximize-2')}</button>`);
  } else if (prefs.zoom === 100 && reset) {
    reset.remove();
  }
}

function paintSlots() {
  document.querySelectorAll('[data-slot-id]').forEach((el) => {
    el.classList.toggle('is-hot', el.dataset.slotId === state.map.highlightId);
  });
  const host = document.querySelector('#preview-2 .preview-svg');
  if (host) host.innerHTML = renderedSvg(state.currentSvg, state.map.highlightId);
}

async function exportPdf() {
  if (state.exp.pdfBusy) return;
  state.exp.pdfBusy = true;
  state.exp.error = null;
  state.exp.pdfOk = false;
  render();
  try {
    const key = paperKey();
    await exportSvgToPrintPdf(state.currentSvg, key, `${cleanName()}-${key.toUpperCase()}.pdf`);
    state.exp.pdfOk = true;
    clearTimeout(state.exp.timers.pdf);
    state.exp.timers.pdf = setTimeout(() => {
      state.exp.pdfOk = false;
      if (state.step === 3) render();
    }, 3000);
  } catch (err) {
    state.exp.error = (err && err.message) || 'PDF export failed.';
  } finally {
    state.exp.pdfBusy = false;
    render();
  }
}

async function exportPng() {
  if (state.exp.pngBusy) return;
  state.exp.pngBusy = true;
  state.exp.error = null;
  state.exp.pngOk = false;
  render();
  try {
    const key = paperKey();
    await exportSvgToPrintPng(state.currentSvg, key, `${cleanName()}-${key.toUpperCase()}-300dpi.png`);
    state.exp.pngOk = true;
    clearTimeout(state.exp.timers.png);
    state.exp.timers.png = setTimeout(() => {
      state.exp.pngOk = false;
      if (state.step === 3) render();
    }, 3000);
  } catch (err) {
    state.exp.error = (err && err.message) || 'PNG export failed.';
  } finally {
    state.exp.pngBusy = false;
    render();
  }
}

function handleAction(el, event) {
  const action = el.dataset.action;
  if (action === 'show-paste' || action === 'hide-paste' || action === 'browse-svg' || action === 'browse-slot') {
    event.preventDefault();
    event.stopPropagation();
  }
  switch (action) {
    case 'goto': {
      const step = Number(el.dataset.step);
      if (step === 1 || hasSvg()) {
        if (step === 1 && state.step !== 1) state.upload.pasteMode = false;
        state.step = step;
        render();
      }
      break;
    }
    case 'reset':
      resetAll();
      break;
    case 'show-paste':
      state.upload.pasteMode = true;
      state.upload.error = null;
      render();
      break;
    case 'hide-paste':
      state.upload.pasteMode = false;
      render();
      break;
    case 'paste-submit':
      if (!state.upload.pastedText.trim()) return;
      loadSvg(state.upload.pastedText, 'pasted-template.svg');
      break;
    case 'browse-svg':
      openFile('svg-file');
      break;
    case 'revert':
      state.currentSvg = state.originalSvg;
      setMapMessage('Reverted to original template images', false, 3000);
      break;
    case 'tab':
      state.map.tab = el.dataset.tab;
      state.map.highlightId = null;
      render();
      break;
    case 'fit':
      setFit(el.dataset.fit);
      break;
    case 'browse-slot':
      state.map.slotIndex = Number(el.dataset.index);
      openFile('slot-file');
      break;
    case 'paper':
      state.exp.paper = el.dataset.paper;
      state.exp.error = null;
      render();
      break;
    case 'pdf':
      exportPdf();
      break;
    case 'png':
      exportPng();
      break;
    case 'zoom-in':
      zoomBy(el.dataset.preview, 15);
      break;
    case 'zoom-out':
      zoomBy(el.dataset.preview, -15);
      break;
    case 'zoom-reset':
      state.preview[el.dataset.preview].zoom = 100;
      patchPreview(el.dataset.preview);
      break;
    case 'theme':
      state.preview[el.dataset.preview].theme = el.dataset.theme;
      patchPreview(el.dataset.preview);
      break;
    default:
      break;
  }
}

function zoomBy(which, delta) {
  const prefs = state.preview[which];
  prefs.zoom = Math.max(50, Math.min(180, prefs.zoom + delta));
  patchPreview(which);
}

function bind() {
  document.addEventListener('click', (event) => {
    if (openingFile) return;
    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      handleAction(actionEl, event);
      return;
    }
    const zone = event.target.closest('[data-drop]');
    if (zone && !event.target.closest('button, a, input, textarea')) {
      openFile(zone.dataset.input);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const zone = event.target.closest && event.target.closest('[data-drop]');
    if (!zone || event.target.closest('button, a, input, textarea')) return;
    event.preventDefault();
    openFile(zone.dataset.input);
  });

  document.addEventListener('input', (event) => {
    if (event.target.id !== 'svg-paste') return;
    state.upload.pastedText = event.target.value;
    const button = document.getElementById('paste-submit');
    if (button) button.disabled = !state.upload.pastedText.trim();
  });

  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.dataset || !input.dataset.file) return;
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    if (input.dataset.file === 'svg') handleSvgFile(file);
    if (input.dataset.file === 'bulk') handleMapToAll(file);
    if (input.dataset.file === 'slot' && state.map.slotIndex !== null) {
      handleMapToSingleSlot(state.map.slotIndex, file);
    }
  });

  document.addEventListener('dragover', (event) => {
    const zone = event.target.closest && event.target.closest('[data-drop]');
    if (!zone) return;
    event.preventDefault();
    zone.classList.add('is-drag');
  });

  document.addEventListener('dragleave', (event) => {
    const zone = event.target.closest && event.target.closest('[data-drop]');
    if (!zone) return;
    if (zone.contains(event.relatedTarget)) return;
    zone.classList.remove('is-drag');
  });

  document.addEventListener('drop', (event) => {
    const zone = event.target.closest && event.target.closest('[data-drop]');
    if (!zone) return;
    event.preventDefault();
    zone.classList.remove('is-drag');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    if (zone.dataset.drop === 'svg') handleSvgFile(file);
    if (zone.dataset.drop === 'bulk') handleMapToAll(file);
  });

  document.addEventListener('mouseover', (event) => {
    const slot = event.target.closest && event.target.closest('[data-slot-id]');
    if (!slot || state.step !== 2 || state.map.tab !== 'slots') return;
    if (state.map.highlightId === slot.dataset.slotId) return;
    state.map.highlightId = slot.dataset.slotId;
    paintSlots();
  });

  document.addEventListener('mouseout', (event) => {
    const slot = event.target.closest && event.target.closest('[data-slot-id]');
    if (!slot) return;
    if (event.relatedTarget && slot.contains(event.relatedTarget)) return;
    state.map.highlightId = null;
    paintSlots();
  });

  document.addEventListener('error', (event) => {
    const img = event.target;
    if (img && img.matches && img.matches('.thumb img')) img.hidden = true;
  }, true);
}

bind();
render();
