/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Image as ImageIcon,
  ArrowLeft,
  Printer,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ParseSvgResult } from '../utils/svgImageParser.ts';
import { SvgPreview } from './SvgPreview.tsx';
import { downloadSvgFile, exportSvgToPng, copyToClipboard } from '../utils/exportHelpers.ts';

interface Step3ExportProps {
  svgContent: string;
  parsedSvg: ParseSvgResult;
  fileName?: string;
  onBackToMap: () => void;
  onReset: () => void;
}

export const Step3Export: React.FC<Step3ExportProps> = ({
  svgContent,
  parsedSvg,
  fileName = 'business-card',
  onBackToMap,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [pngSuccess, setPngSuccess] = useState(false);

  const cleanFileName = fileName.replace(/\.svg$/i, '') + '-customized';

  const handleDownloadSvg = () => {
    downloadSvgFile(svgContent, `${cleanFileName}.svg`);
  };

  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      await exportSvgToPng(svgContent, `${cleanFileName}-print.png`, 3);
      setPngSuccess(true);
      setTimeout(() => setPngSuccess(false), 3000);
    } catch (err) {
      console.error('PNG export failed', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(svgContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Navigation */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Card Complete & Ready for Production</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
          Export Your Business Card
        </h2>
        <p className="text-sm sm:text-base text-[#6E6E73] mt-2 max-w-lg mx-auto">
          All image placeholders have been embedded directly into the vector file for seamless printing and digital delivery.
        </p>
      </div>

      {/* Hero Card Showcase */}
      <div className="bg-white rounded-3xl apple-card-shadow-lg border border-black/5 p-6 sm:p-10 mb-8">
        <SvgPreview svgContent={svgContent} showControls={true} />
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Option 1: Vector SVG */}
        <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">
              Vector SVG File
            </h3>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              Resolution-independent vector format with embedded raster images. Ideal for commercial printing, Illustrator, and Figma.
            </p>
          </div>

          <button
            onClick={handleDownloadSvg}
            className="mt-6 w-full py-2.5 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download .SVG</span>
          </button>
        </div>

        {/* Option 2: High-Res PNG (300 DPI) */}
        <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">
              300 DPI Raster PNG
            </h3>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              Ultra-high-density bitmap print proof rendered at 3× resolution (up to 3150×1800 px) for crisp desktop or commercial proofs.
            </p>
          </div>

          <button
            onClick={handleExportPng}
            disabled={isExportingPng}
            className="mt-6 w-full py-2.5 px-4 rounded-full bg-[#1D1D1F] hover:bg-[#2D2D30] active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {pngSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : isExportingPng ? (
              <span>Generating...</span>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Export 300 DPI PNG</span>
              </>
            )}
          </button>
        </div>

        {/* Option 3: Copy SVG Markup */}
        <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-[#1D1D1F] flex items-center justify-center mb-4">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">
              Copy Raw Markup
            </h3>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              Copy the full updated SVG XML markup directly to your clipboard for instant embedding in web apps or codebases.
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className="mt-6 w-full py-2.5 px-4 rounded-full bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/10 text-xs sm:text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy SVG Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Production Specifications Card */}
      <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 mb-8">
        <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-4">
          Production Specifications
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#86868B] block">Physical Size</span>
            <span className="font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              3.5" × 2.0"
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block">Canvas Pixels</span>
            <span className="font-mono tabular-nums font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              {(() => {
                if (parsedSvg.viewBox) {
                  const parts = parsedSvg.viewBox.trim().split(/[\s,]+/);
                  if (parts.length === 4) {
                    return `${parts[2]} × ${parts[3]} px`;
                  }
                }
                return parsedSvg.width && parsedSvg.height
                  ? `${parsedSvg.width} × ${parsedSvg.height} px`
                  : '1050 × 600 px';
              })()}
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block">Embedded Slots</span>
            <span className="font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              {parsedSvg.slots.length} Placeholders Mapped
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block">File Type</span>
            <span className="font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              SVG 1.1 + XLink
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-black/5">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mapping</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start Another Card</span>
        </button>
      </div>
    </div>
  );
};
