/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ArrowRight, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentStep: 1 | 2 | 3;
  canProceedToMap: boolean;
  canProceedToExport: boolean;
  onSelectStep: (step: 1 | 2 | 3) => void;
  onReset: () => void;
  hasSvg: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  canProceedToMap,
  canProceedToExport,
  onSelectStep,
  onReset,
  hasSvg,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full apple-glass border-b border-black/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#1D1D1F] to-[#2D2D30] text-white flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-white/90" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] whitespace-nowrap">
            CardCraft
          </span>
          <span className="hidden sm:inline text-xs text-[#86868B] font-normal">
            SVG Image Mapper
          </span>
        </div>

        {/* Zone 2: Apple Segmented 3-Step Navigation */}
        <nav
          aria-label="Process steps"
          className="flex items-center p-1 bg-[#EBEBED]/80 rounded-full border border-black/5"
        >
          <button
            onClick={() => onSelectStep(1)}
            className={`px-3.5 py-1 text-xs sm:text-[13px] font-medium rounded-full transition-all whitespace-nowrap ${
              currentStep === 1
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
          >
            1. Upload
          </button>
          <button
            onClick={() => canProceedToMap && onSelectStep(2)}
            disabled={!canProceedToMap}
            className={`px-3.5 py-1 text-xs sm:text-[13px] font-medium rounded-full transition-all whitespace-nowrap ${
              currentStep === 2
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : canProceedToMap
                ? 'text-[#6E6E73] hover:text-[#1D1D1F]'
                : 'text-[#A1A1A6] cursor-not-allowed opacity-50'
            }`}
          >
            2. Map
          </button>
          <button
            onClick={() => canProceedToExport && onSelectStep(3)}
            disabled={!canProceedToExport}
            className={`px-3.5 py-1 text-xs sm:text-[13px] font-medium rounded-full transition-all whitespace-nowrap ${
              currentStep === 3
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : canProceedToExport
                ? 'text-[#6E6E73] hover:text-[#1D1D1F]'
                : 'text-[#A1A1A6] cursor-not-allowed opacity-50'
            }`}
          >
            3. Export
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {hasSvg && currentStep === 2 && (
            <button
              onClick={() => onSelectStep(3)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-[13px] font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] rounded-full transition-all shadow-sm whitespace-nowrap"
            >
              <span>Export</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {hasSvg && currentStep !== 1 && (
            <button
              onClick={onReset}
              title="Reset and start over"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6E6E73] hover:text-[#1D1D1F] bg-black/5 hover:bg-black/10 rounded-full transition-all whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Start Over</span>
            </button>
          )}

          {!hasSvg && (
            <div className="text-xs text-[#86868B] font-medium hidden sm:block">
              Business Card Ready
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
