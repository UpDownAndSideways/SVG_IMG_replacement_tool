/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, Code, ArrowRight, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { SAMPLE_TEMPLATES, CardTemplate } from '../data/sampleTemplates.ts';
import { parseSvgImages, validateSvg } from '../utils/svgImageParser.ts';

interface Step1UploadProps {
  onSvgLoaded: (svgText: string, fileName?: string) => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({ onSvgLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setErrorMsg('Please upload a valid .svg vector file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processSvgContent(content, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const processSvgContent = (content: string, fileName?: string) => {
    const validation = validateSvg(content);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid SVG content.');
      return;
    }

    const parsed = parseSvgImages(content);
    if (parsed.slots.length === 0) {
      // It's still a valid SVG, but alert the user helpfully
      console.warn('No image placeholders detected in uploaded SVG');
    }

    onSvgLoaded(content, fileName);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    processSvgContent(pastedText, 'pasted-template.svg');
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    processSvgContent(template.svgContent, `${template.id}.svg`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Introduction */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] mb-3">
          Upload Your SVG Template
        </h1>
        <p className="text-base sm:text-lg text-[#6E6E73] max-w-xl mx-auto leading-relaxed">
          Drop your business card SVG to automatically detect all linked image placeholders and map new assets.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Dropzone / Paste Area */}
      {!pasteMode ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer relative rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all apple-card-shadow bg-white ${
            isDragging
              ? 'border-[#0071E3] bg-[#0071E3]/5 scale-[1.01]'
              : 'border-[#D2D2D7] hover:border-[#86868B] hover:bg-[#FAFAFC]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] text-[#0071E3] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1.5">
            Drop your SVG business card here
          </h3>
          <p className="text-sm text-[#86868B] mb-5">
            Supports vector SVGs exported from Figma, Illustrator, Inkscape, or Sketch
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-full transition-all shadow-sm">
            <span>Browse Files</span>
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#86868B]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPasteMode(true);
              }}
              className="hover:text-[#0071E3] flex items-center gap-1.5 underline underline-offset-2 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Or paste raw SVG code</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 sm:p-8 apple-card-shadow border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
              <Code className="w-4 h-4 text-[#0071E3]" />
              Paste SVG Code
            </h3>
            <button
              onClick={() => setPasteMode(false)}
              className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              Back to file upload
            </button>
          </div>

          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1050 600'>&#10;  <image id='avatar' href='...' />&#10;</svg>"
            rows={8}
            className="w-full p-4 rounded-xl font-mono text-xs text-[#1D1D1F] bg-[#F5F5F7] border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all resize-y"
          />

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setPasteMode(false)}
              className="px-4 py-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-40 disabled:cursor-not-allowed rounded-full transition-all shadow-sm flex items-center gap-2"
            >
              <span>Parse & Map Images</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Instant Sample Templates Section */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0071E3]" />
              Or start with a curated business card template
            </h3>
            <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
              Standard 3.5" × 2" cards with pre-configured image placeholders
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleTemplateSelect(tmpl)}
              className="group text-left p-5 rounded-2xl bg-white hover:bg-[#FAFAFC] border border-black/5 apple-card-shadow transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-[1.75/1] rounded-xl bg-[#F5F5F7] mb-3.5 overflow-hidden flex items-center justify-center p-2.5 border border-black/5 group-hover:border-[#0071E3]/30 transition-colors">
                  <div
                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: tmpl.svgContent }}
                  />
                </div>

                <div className="text-xs text-[#0071E3] font-medium mb-1">
                  {tmpl.category}
                </div>
                <h4 className="text-sm font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-[#86868B] mt-1 line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#6E6E73]">
                <span className="font-mono tabular-nums">
                  {tmpl.imageSlotCount} Image {tmpl.imageSlotCount === 1 ? 'Slot' : 'Slots'}
                </span>
                <span className="font-medium text-[#0071E3] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Load <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
