/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Check,
  Image as ImageIcon,
  ArrowLeft,
  Printer,
  Sparkles,
  RotateCcw,
  FileText,
  FileDown,
} from 'lucide-react';
import { ParseSvgResult } from '../utils/svgImageParser.ts';
import { SvgPreview } from './SvgPreview.tsx';
import {
  PaperSizeKey,
  PAPER_SIZES,
  getTargetDimensions,
  getSvgDimensions,
  exportSvgToPrintPdf,
  exportSvgToPrintPng,
} from '../utils/exportHelpers.ts';

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
  // Determine intelligent default paper size based on SVG dimensions
  const svgDims = useMemo(() => getSvgDimensions(svgContent), [svgContent]);

  const initialPaperSize: PaperSizeKey = useMemo(() => {
    const longSide = Math.max(svgDims.width, svgDims.height);
    const shortSide = Math.min(svgDims.width, svgDims.height);
    const ratio = longSide / shortSide;

    // A3 is ~1.414 (420/297)
    // Ledger is ~1.545 (17/11)
    // Letter is ~1.294 (11/8.5)
    if (Math.abs(ratio - (420 / 297)) < 0.08) return 'a3';
    if (Math.abs(ratio - (17 / 11)) < 0.08) return 'ledger';
    if (Math.abs(ratio - (11 / 8.5)) < 0.08) return 'letter';
    // If it's a 21-up or multi-up business card sheet, A3 is standard
    return 'a3';
  }, [svgDims]);

  const [selectedPaper, setSelectedPaper] = useState<PaperSizeKey>(initialPaperSize);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const [isExportingPng, setIsExportingPng] = useState(false);
  const [pngSuccess, setPngSuccess] = useState(false);

  const cleanFileName = fileName.replace(/\.svg$/i, '') + '-customized';

  const currentPaper = PAPER_SIZES[selectedPaper];
  const targetDims = useMemo(
    () => getTargetDimensions(selectedPaper, svgDims.isLandscape, 300),
    [selectedPaper, svgDims.isLandscape]
  );

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportSvgToPrintPdf(
        svgContent,
        selectedPaper,
        `${cleanFileName}-${selectedPaper.toUpperCase()}.pdf`
      );
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      await exportSvgToPrintPng(
        svgContent,
        selectedPaper,
        `${cleanFileName}-${selectedPaper.toUpperCase()}-300dpi.png`
      );
      setPngSuccess(true);
      setTimeout(() => setPngSuccess(false), 3000);
    } catch (err) {
      console.error('PNG export failed', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Navigation */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Card Complete & Ready for Print</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
          Export at Actual Size
        </h2>
        <p className="text-sm sm:text-base text-[#6E6E73] mt-2 max-w-xl mx-auto">
          Choose your target sheet format. The export outputs at exact 1:1 physical dimensions without squashing or distortion.
        </p>
      </div>

      {/* Hero Card Showcase */}
      <div className="bg-white rounded-3xl apple-card-shadow-lg border border-black/5 p-6 sm:p-10 mb-8">
        <SvgPreview svgContent={svgContent} showControls={true} />
      </div>

      {/* Selectable Sheet Dimension Picker: Letter, Ledger, A3 */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 apple-card-shadow border border-black/5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1D1D1F]">
              Select Print Sheet Dimensions
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              Exports will match this physical page geometry at 100% actual print size (300 DPI)
            </p>
          </div>
          <div className="text-xs text-[#0071E3] font-medium flex items-center gap-1.5 bg-[#0071E3]/5 px-2.5 py-1 rounded-full self-start sm:self-auto">
            <span>Orientation: {svgDims.isLandscape ? 'Landscape' : 'Portrait'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {(['letter', 'ledger', 'a3'] as PaperSizeKey[]).map((key) => {
            const paper = PAPER_SIZES[key];
            const isSelected = selectedPaper === key;
            const dims = getTargetDimensions(key, svgDims.isLandscape, 300);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPaper(key)}
                className={`p-4 rounded-2xl text-left border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0071E3] bg-[#0071E3]/5 ring-2 ring-[#0071E3]/20'
                    : 'border-black/5 hover:border-black/15 bg-[#F9F9FB]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1D1D1F]">
                      {paper.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6E6E73] font-medium mt-1">
                    {paper.description}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-black/5 text-[11px] font-mono tabular-nums text-[#86868B]">
                  300 DPI: {dims.pixelWidth} × {dims.pixelHeight} px
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Export Showcase: Print-Ready PDF */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 apple-card-shadow-lg border-2 border-[#0071E3]/30 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-semibold mb-2.5">
              Primary Option · 1:1 Scale
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#0071E3]" />
              Print-Ready PDF ({currentPaper.shortLabel})
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-2 leading-relaxed">
              Native {currentPaper.name} page format ({targetDims.pageWidthInches.toFixed(2)}" × {targetDims.pageHeightInches.toFixed(2)}"). Your template is preserved at actual size without squashing or distortion, ready for direct press output.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="py-3.5 px-8 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 min-w-[220px]"
            >
              {pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>PDF Downloaded!</span>
                </>
              ) : isExportingPdf ? (
                <span>Generating {currentPaper.shortLabel} PDF...</span>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Download {currentPaper.shortLabel} PDF</span>
                </>
              )}
            </button>
            <div className="text-[11px] text-[#86868B] text-center sm:text-right mt-2 font-mono tabular-nums">
              Actual Size · 300 DPI
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Export Option: High-Res Print PNG */}
      <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#1D1D1F]">
              Print-Ready PNG ({targetDims.pixelWidth} × {targetDims.pixelHeight} px)
            </h3>
          </div>
          <p className="text-xs text-[#86868B] mt-1 sm:ml-10 leading-relaxed max-w-lg">
            Rasterized at actual size for {currentPaper.name} at 300 DPI ({targetDims.pageWidthInches.toFixed(2)}" × {targetDims.pageHeightInches.toFixed(2)}") without squashing.
          </p>
        </div>

        <button
          onClick={handleExportPng}
          disabled={isExportingPng}
          className="py-2.5 px-5 rounded-full bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/15 text-xs sm:text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
        >
          {pngSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Saved {currentPaper.shortLabel} PNG</span>
            </>
          ) : isExportingPng ? (
            <span>Generating PNG...</span>
          ) : (
            <>
              <FileDown className="w-4 h-4 text-[#0071E3]" />
              <span>Download {currentPaper.shortLabel} PNG</span>
            </>
          )}
        </button>
      </div>

      {/* Production Specifications Card */}
      <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 mb-8">
        <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-4">
          Production Specifications
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#86868B] block">Selected Sheet Format</span>
            <span className="font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              {currentPaper.name}
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block">Physical Size</span>
            <span className="font-mono tabular-nums font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              {targetDims.pageWidthInches.toFixed(2)}" × {targetDims.pageHeightInches.toFixed(2)}"
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block">300 DPI Canvas</span>
            <span className="font-mono tabular-nums font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              {targetDims.pixelWidth} × {targetDims.pixelHeight} px
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block">Mapped Placeholders</span>
            <span className="font-semibold text-[#1D1D1F] text-sm mt-0.5 block">
              {parsedSvg.slots.length} Embedded Slots
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
          <span>Upload Another SVG</span>
        </button>
      </div>
    </div>
  );
};
