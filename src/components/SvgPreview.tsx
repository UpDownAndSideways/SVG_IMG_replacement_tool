/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Sun, Moon, Grid } from 'lucide-react';

interface SvgPreviewProps {
  svgContent: string;
  highlightSlotId?: string | null;
  className?: string;
  showControls?: boolean;
}

export const SvgPreview: React.FC<SvgPreviewProps> = ({
  svgContent,
  highlightSlotId,
  className = '',
  showControls = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [backdropTheme, setBackdropTheme] = useState<'light' | 'dark' | 'grid'>('light');

  // Highlight selected slot in the SVG by temporarily appending subtle styling or stroke
  const renderedSvg = useMemo(() => {
    if (!svgContent) return '';
    if (!highlightSlotId) return svgContent;

    // Add CSS injection to highlight the matching image id
    const styleInjection = `
      <style>
        #${highlightSlotId} {
          outline: 4px solid #0071E3 !important;
          outline-offset: 2px !important;
          filter: drop-shadow(0 0 12px rgba(0, 113, 227, 0.6)) !important;
          transition: all 0.2s ease-in-out !important;
        }
      </style>
    `;

    return svgContent.replace(/<svg\b([^>]*)>/i, `<svg $1>${styleInjection}`);
  }, [svgContent, highlightSlotId]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Top Floating Mini Controls (Apple Glass Pill) */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-full border border-black/10 shadow-sm text-xs">
          <button
            onClick={() => setBackdropTheme('light')}
            className={`p-1.5 rounded-full transition-all ${
              backdropTheme === 'light' ? 'bg-[#F2F2F7] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
            title="Light Desk Surface"
            aria-label="Light Desk"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBackdropTheme('dark')}
            className={`p-1.5 rounded-full transition-all ${
              backdropTheme === 'dark' ? 'bg-[#1D1D1F] text-white' : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
            title="Dark Desk Surface"
            aria-label="Dark Desk"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBackdropTheme('grid')}
            className={`p-1.5 rounded-full transition-all ${
              backdropTheme === 'grid' ? 'bg-[#F2F2F7] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
            title="Design Grid"
            aria-label="Design Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3 bg-black/10 mx-0.5" />

          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
            className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] rounded-full transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono tabular-nums px-1.5 text-[#86868B]">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
            className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] rounded-full transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 100 && (
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] rounded-full transition-colors"
              title="Reset 100%"
              aria-label="Reset zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Viewport Card Stage */}
      <div
        className={`w-full h-full min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-6 sm:p-10 rounded-2xl transition-colors duration-300 overflow-hidden ${
          backdropTheme === 'light'
            ? 'bg-gradient-to-b from-[#F9F9FB] to-[#EDEDF2]'
            : backdropTheme === 'dark'
            ? 'bg-[#18181B]'
            : 'bg-[#F4F4F6] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]'
        }`}
      >
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 ease-out max-w-full flex items-center justify-center"
        >
          {/* Card Presentation Container with Realistic Physical Elevation */}
          <div className="relative group rounded-2xl overflow-hidden transition-all duration-300 apple-card-shadow-lg max-w-[620px] w-full border border-black/5">
            <div
              className="w-full h-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: renderedSvg }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
