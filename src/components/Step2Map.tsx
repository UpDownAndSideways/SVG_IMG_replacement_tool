/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Sliders,
  ExternalLink,
  Info,
  Maximize,
} from 'lucide-react';
import { SvgImageSlot, ParseSvgResult, replaceSvgImages, replaceAllSvgImages, ReplaceOptions } from '../utils/svgImageParser.ts';
import { SvgPreview } from './SvgPreview.tsx';
import { SAMPLE_REPLACEMENT_IMAGES } from '../data/sampleImages.ts';

interface Step2MapProps {
  originalSvg: string;
  currentSvg: string;
  parsedSvg: ParseSvgResult;
  fileName?: string;
  onUpdateSvg: (newSvg: string) => void;
  onProceedToExport: () => void;
  onBackToUpload: () => void;
}

export const Step2Map: React.FC<Step2MapProps> = ({
  originalSvg,
  currentSvg,
  parsedSvg,
  fileName,
  onUpdateSvg,
  onProceedToExport,
  onBackToUpload,
}) => {
  const [highlightSlotId, setHighlightSlotId] = useState<string | null>(null);
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'original'>('cover');
  const [activeTab, setActiveTab] = useState<'bulk' | 'slots'>('bulk');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [openPresetSlotIndex, setOpenPresetSlotIndex] = useState<number | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to read File into base64 Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  // Map to ALL placeholders (Core User Requirement)
  const handleMapToAll = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const updated = replaceAllSvgImages(currentSvg, dataUrl, {
        preserveAspectRatio: fitMode,
      });
      onUpdateSvg(updated);
      setLastActionMessage(`Mapped "${file.name}" to all ${parsedSvg.slots.length} placeholders`);
      setTimeout(() => setLastActionMessage(null), 3500);
    } catch (err) {
      console.error('Failed to map image', err);
    }
  };

  // Map a preset sample image to ALL
  const handleMapSampleToAll = (sampleDataUrl: string, sampleName: string) => {
    const updated = replaceAllSvgImages(currentSvg, sampleDataUrl, {
      preserveAspectRatio: fitMode,
    });
    onUpdateSvg(updated);
    setLastActionMessage(`Mapped ${sampleName} to all placeholders`);
    setTimeout(() => setLastActionMessage(null), 3500);
  };

  // Map image to a specific slot
  const handleMapToSingleSlot = async (slotIndex: number, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const updated = replaceSvgImages(currentSvg, { [slotIndex]: dataUrl }, {
        preserveAspectRatio: fitMode,
      });
      onUpdateSvg(updated);
      setLastActionMessage(`Updated image in Slot #${slotIndex + 1}`);
      setTimeout(() => setLastActionMessage(null), 3500);
    } catch (err) {
      console.error('Failed to update slot', err);
    }
  };

  // Map preset sample to single slot
  const handleMapSampleToSlot = (slotIndex: number, sampleDataUrl: string, sampleName: string) => {
    const updated = replaceSvgImages(currentSvg, { [slotIndex]: sampleDataUrl }, {
      preserveAspectRatio: fitMode,
    });
    onUpdateSvg(updated);
    setLastActionMessage(`Applied ${sampleName} to Slot #${slotIndex + 1}`);
    setTimeout(() => setLastActionMessage(null), 3500);
  };

  // Revert card back to original uploaded state
  const handleRevertAll = () => {
    onUpdateSvg(originalSvg);
    setLastActionMessage('Reverted to original template images');
    setTimeout(() => setLastActionMessage(null), 3000);
  };

  // Change fit mode and re-apply to current SVG if images are present
  const handleFitModeChange = (newMode: 'cover' | 'contain' | 'original') => {
    setFitMode(newMode);
    if (newMode !== 'original') {
      const updated = replaceSvgImages(currentSvg, {}, { preserveAspectRatio: newMode });
      onUpdateSvg(updated);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pt-1">
        <div className="min-w-0 max-w-full">
          <div className="flex items-center gap-2 text-xs text-[#86868B] flex-wrap">
            <button
              onClick={onBackToUpload}
              className="hover:text-[#1D1D1F] transition-colors underline-offset-2 hover:underline"
            >
              Templates
            </button>
            <span>/</span>
            <span className="text-[#1D1D1F] font-medium truncate max-w-[150px] sm:max-w-[220px]">
              {fileName || 'Business Card'}
            </span>
            <span>·</span>
            <span className="font-mono tabular-nums text-[11px] bg-black/5 px-1.5 py-0.5 rounded">
              {parsedSvg.aspectRatioDisplay}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mt-1">
            Map Embedded Images
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRevertAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] bg-white border border-black/10 rounded-full transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Original</span>
          </button>
        </div>
      </div>

      {lastActionMessage && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{lastActionMessage}</span>
          </div>
        </div>
      )}

      {/* Main 2-Column Split: Mapping Workbench (Left) vs Interactive Card Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Workbench Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between p-1 bg-[#EBEBED] rounded-xl border border-black/5">
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'bulk'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Map to All ({parsedSvg.slots.length} Placeholders)
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'slots'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Individual Slots ({parsedSvg.slots.length})
            </button>
          </div>

          {/* Aspect Ratio / Fit Setting Control */}
          <div className="bg-white rounded-2xl p-4 apple-card-shadow border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#1D1D1F] font-medium">
              <Sliders className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Image Scaling Mode:</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-lg text-xs">
              <button
                onClick={() => handleFitModeChange('cover')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  fitMode === 'cover'
                    ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
                title="Crop & fill entire frame without distortion (best for portraits)"
              >
                Cover (Fill)
              </button>
              <button
                onClick={() => handleFitModeChange('contain')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  fitMode === 'contain'
                    ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
                title="Fit entire image within boundary (best for logos)"
              >
                Fit (Contain)
              </button>
            </div>
          </div>

          {/* TAB 1: Bulk "Map to All Placeholders" (Primary user request) */}
          {activeTab === 'bulk' && (
            <div className="bg-white rounded-2xl p-6 apple-card-shadow border border-black/5 flex flex-col gap-5">
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#0071E3]" />
                  Upload Image to Map to All Placeholders
                </h3>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                  Replaces every detected image placeholder ({parsedSvg.slots.length} total) inside your SVG template in one step.
                </p>
              </div>

              {/* Master Dropzone */}
              <div
                onClick={() => bulkFileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleMapToAll(e.dataTransfer.files[0]);
                  }
                }}
                className="cursor-pointer border-2 border-dashed border-[#0071E3]/30 hover:border-[#0071E3] bg-[#0071E3]/5 hover:bg-[#0071E3]/10 rounded-2xl p-8 text-center transition-all group"
              >
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleMapToAll(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-xl bg-white text-[#0071E3] shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#1D1D1F]">
                  Upload Master Replacement Image
                </div>
                <div className="text-xs text-[#86868B] mt-1">
                  Supports PNG, JPG, WebP, or SVG vector
                </div>
              </div>

              {/* Quick Preset Sample Images for Instant 1-Click Testing */}
              <div>
                <div className="text-xs font-semibold text-[#86868B] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Or quickly test with a sample asset</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_REPLACEMENT_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleMapSampleToAll(sample.dataUrl, sample.name)}
                      className="p-2.5 rounded-xl border border-black/5 bg-[#F9F9FB] hover:bg-[#F2F2F7] hover:border-black/10 transition-all flex items-center gap-2.5 text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={sample.dataUrl}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate min-w-0">
                        <div className="text-xs font-medium text-[#1D1D1F] group-hover:text-[#0071E3] truncate">
                          {sample.name}
                        </div>
                        <div className="text-[10px] text-[#86868B]">
                          {sample.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Individual Image Slots Inspection & Custom Mapping */}
          {activeTab === 'slots' && (
            <div className="flex flex-col gap-3">
              <input
                ref={slotFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0] && selectedSlotIndex !== null) {
                    handleMapToSingleSlot(selectedSlotIndex, e.target.files[0]);
                  }
                }}
              />

              {parsedSvg.slots.map((slot) => {
                const isHighlighted = highlightSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onMouseEnter={() => setHighlightSlotId(slot.id)}
                    onMouseLeave={() => setHighlightSlotId(null)}
                    className={`p-4 rounded-2xl bg-white apple-card-shadow border transition-all ${
                      isHighlighted
                        ? 'border-[#0071E3] ring-2 ring-[#0071E3]/15'
                        : 'border-black/5 hover:border-black/10'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Slot Current Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-[#F5F5F7] border border-black/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {slot.href ? (
                          <img
                            src={slot.href}
                            alt={slot.label}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback placeholder if external image is broken
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-[#86868B]" />
                        )}
                      </div>

                      {/* Slot Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#1D1D1F] truncate">
                            {slot.label}
                          </h4>
                          <span className="text-[11px] font-mono tabular-nums text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded-md">
                            {slot.width && slot.height
                              ? `${slot.width}×${slot.height}`
                              : 'Dynamic'}
                          </span>
                        </div>

                        <div className="text-xs text-[#86868B] mt-0.5 flex items-center gap-2 truncate">
                          <span>Tag ID: <code className="font-mono text-[#6E6E73]">{slot.id}</code></span>
                          {slot.clipPath && (
                            <>
                              <span>·</span>
                              <span className="text-amber-600">Clipped</span>
                            </>
                          )}
                        </div>

                        {/* Replace Button & Sample Dropdown */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSlotIndex(slot.index);
                              slotFileInputRef.current?.click();
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-[#1D1D1F] bg-[#F2F2F7] hover:bg-[#E5E5EA] active:bg-[#D1D1D6] rounded-full transition-colors flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3 text-[#0071E3]" />
                            <span>Replace Image</span>
                          </button>

                          {/* Quick Preset for this slot */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenPresetSlotIndex(openPresetSlotIndex === slot.index ? null : slot.index)}
                              className="px-2.5 py-1.5 text-xs text-[#6E6E73] hover:text-[#1D1D1F] bg-[#F9F9FB] border border-black/5 hover:border-black/10 rounded-full transition-colors"
                            >
                              Presets ▾
                            </button>
                            {openPresetSlotIndex === slot.index && (
                              <div className="absolute left-0 bottom-full mb-1 z-30 bg-white rounded-xl shadow-xl border border-black/10 p-1.5 w-48 animate-in fade-in duration-150">
                                {SAMPLE_REPLACEMENT_IMAGES.map((s) => (
                                  <button
                                    key={s.id}
                                    onClick={() => {
                                      handleMapSampleToSlot(slot.index, s.dataUrl, s.name);
                                      setOpenPresetSlotIndex(null);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F2F2F7] flex items-center gap-2 text-[#1D1D1F]"
                                  >
                                    <img src={s.dataUrl} alt={s.name} className="w-5 h-5 rounded-sm object-cover" />
                                    <span className="truncate">{s.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Preview Column (7 cols): Live Card Canvas */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="bg-white rounded-3xl apple-card-shadow border border-black/5 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F]">
                  Live Card Preview
                </h3>
                <span className="text-xs text-[#86868B]">
                  (Updates in real time)
                </span>
              </div>
              <div className="text-xs text-[#86868B]">
                Hover slot to highlight on card
              </div>
            </div>

            {/* Svg Preview Canvas */}
            <SvgPreview
              svgContent={currentSvg}
              highlightSlotId={highlightSlotId}
              showControls={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
