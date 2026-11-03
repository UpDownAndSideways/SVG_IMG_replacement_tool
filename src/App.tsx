/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { Step1Upload } from './components/Step1Upload.tsx';
import { Step2Map } from './components/Step2Map.tsx';
import { Step3Export } from './components/Step3Export.tsx';
import { parseSvgImages, ParseSvgResult } from './utils/svgImageParser.ts';

export default function App() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [originalSvg, setOriginalSvg] = useState<string>('');
  const [currentSvg, setCurrentSvg] = useState<string>('');
  const [fileName, setFileName] = useState<string>('business-card.svg');

  // Parse current SVG whenever it updates
  const parsedSvg: ParseSvgResult = useMemo(() => {
    return parseSvgImages(currentSvg);
  }, [currentSvg]);

  const handleSvgLoaded = (svgText: string, name = 'custom-card.svg') => {
    setOriginalSvg(svgText);
    setCurrentSvg(svgText);
    setFileName(name);
    setCurrentStep(2);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setOriginalSvg('');
    setCurrentSvg('');
    setFileName('business-card.svg');
  };

  const hasSvg = Boolean(currentSvg && currentSvg.trim().length > 0);
  const canProceedToMap = hasSvg;
  const canProceedToExport = hasSvg && parsedSvg.slots.length >= 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F]">
      {/* Apple Styled Header & Stepper */}
      <Header
        currentStep={currentStep}
        canProceedToMap={canProceedToMap}
        canProceedToExport={canProceedToExport}
        onSelectStep={setCurrentStep}
        onReset={handleReset}
        hasSvg={hasSvg}
      />

      {/* Main Multi-Step Wizard Viewport */}
      <main className="flex-1 flex flex-col justify-start">
        {currentStep === 1 && (
          <Step1Upload onSvgLoaded={handleSvgLoaded} />
        )}

        {currentStep === 2 && (
          <Step2Map
            originalSvg={originalSvg}
            currentSvg={currentSvg}
            parsedSvg={parsedSvg}
            fileName={fileName}
            onUpdateSvg={setCurrentSvg}
            onProceedToExport={() => setCurrentStep(3)}
            onBackToUpload={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Export
            svgContent={currentSvg}
            parsedSvg={parsedSvg}
            fileName={fileName}
            onBackToMap={() => setCurrentStep(2)}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Minimal Apple Clean Footer */}
      <footer className="w-full py-6 border-t border-black/5 text-center text-xs text-[#86868B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            CardCraft · Precision SVG Image Mapping for Business Cards
          </div>
          <div className="flex items-center gap-3">
            <span>Client-side Processing</span>
            <span>·</span>
            <span>Actual Size 300 DPI Export</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
