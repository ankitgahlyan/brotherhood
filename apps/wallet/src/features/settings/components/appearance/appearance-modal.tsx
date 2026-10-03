/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  Monitor,
  Sun,
  Moon,
  Sparkles,
  Palette,
  Check,
  LayoutGrid,
  Eye,
  Coffee,
  Layers,
  Blend,
  Box,
  ALargeSmall,
  RotateCcw,
} from 'lucide-react';
import { usePreferences } from '@demo/wallet-core';
import { useTheme } from '@/core/theme';
import type { ThemeMode, ColorPalette, SurfaceStyle } from '@/core/theme';
import {
  MIN_TEXT_SCALE,
  MAX_TEXT_SCALE,
  DEFAULT_TEXT_SCALE,
  TEXT_SCALE_STEP,
} from '@/core/theme';
import { Modal } from '@/core/components/ui/modal';
import { AnimationSettingsCard } from '../animation-settings-card';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  { mode: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  { mode: 'light', label: 'Daylight', icon: <Sun className="w-4 h-4" /> },
  { mode: 'warm', label: 'Warm', icon: <Coffee className="w-4 h-4" /> },
  { mode: 'dark', label: 'Midnight', icon: <Moon className="w-4 h-4" /> },
  { mode: 'oled', label: 'OLED', icon: <Sparkles className="w-4 h-4" /> },
];

const PALETTE_OPTIONS: {
  id: ColorPalette;
  name: string;
  gradientClass: string;
}[] = [
  {
    id: 'violet',
    name: 'Brotherhood',
    gradientClass: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'ton',
    name: 'TON Ocean',
    gradientClass: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    gradientClass: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    gradientClass: 'from-amber-500 to-rose-500',
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia',
    gradientClass: 'from-pink-500 to-fuchsia-600',
  },
];

const SURFACE_OPTIONS: {
  style: SurfaceStyle;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    style: 'flat',
    label: 'Flat',
    desc: 'Classic matte',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    style: 'glass_css',
    label: 'Glass',
    desc: 'Pure specular',
    icon: <Box className="w-4 h-4" />,
  },
  {
    style: 'glass_hybrid',
    label: 'Lens',
    desc: 'SVG refraction',
    icon: <Blend className="w-4 h-4" />,
  },
  {
    style: 'glass_tilt',
    label: 'Tilt',
    desc: '3D interactive',
    icon: <ALargeSmall className="w-4 h-4 rotate-90" />,
  },
];

const TEXT_PRESETS: { label: string; scale: number }[] = [
  { label: 'Compact', scale: 90 },
  { label: 'Standard', scale: 100 },
  { label: 'Large', scale: 115 },
  { label: 'Senior', scale: 130 },
];

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    setTheme,
    palette,
    setPalette,
    surfaceStyle,
    setSurfaceStyle,
    textScale,
    stepTextScale,
    resetTextScale,
    setTextScale,
  } = useTheme();
  const { viewMode, setViewMode } = usePreferences();

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2 max-w-md"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-500" />
          <span>Appearance &amp; Accessibility</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="gap-5 p-4 max-h-[80vh] overflow-y-auto">
        {/* Section 1: Theme & Color Palette */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
            Theme &amp; Color Palette
          </span>

          <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border flex flex-col gap-4">
            {/* Theme Mode Selector — 5 options */}
            <div>
              <span className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                Display Mode
              </span>
              <div className="grid grid-cols-5 keep-cols gap-1 bg-background/60 p-1 rounded-xl border border-border">
                {THEME_OPTIONS.map((opt) => {
                  const isSelected = theme === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => setTheme(opt.mode)}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer min-h-(--touch-target) ${
                        isSelected
                          ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                      data-testid={`appearance-theme-${opt.mode}`}
                    >
                      <div className="flex items-center gap-0.5">
                        {opt.icon}
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 text-primary" />
                        )}
                      </div>
                      <span className="truncate w-full text-center">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <span className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-primary" />
                Color Palette
              </span>
              <div className="grid grid-cols-5 keep-cols gap-1.5 bg-background/60 p-1.5 rounded-xl border border-border">
                {PALETTE_OPTIONS.map((pal) => {
                  const isSelected = palette === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setPalette(pal.id)}
                      className={`flex flex-col items-center gap-1.5 py-2 px-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer min-h-(--touch-target) ${
                        isSelected
                          ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                      data-testid={`appearance-palette-${pal.id}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full bg-linear-to-tr ${pal.gradientClass} flex items-center justify-center shadow-xs transition-transform ${
                          isSelected
                            ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card'
                            : 'opacity-85 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        {isSelected && (
                          <Check
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span className="truncate w-full text-center text-[10px] leading-tight">
                        {pal.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Navigation Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-primary" />
                  Navigation View Mode
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {viewMode === 'icons_only' ? 'Icons Only' : 'Text + Icons'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-background/60 p-1.5 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode('standard')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-(--touch-target) ${
                    viewMode !== 'icons_only'
                      ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                  data-testid="appearance-viewmode-standard"
                >
                  <LayoutGrid className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold leading-tight">Standard</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Text &amp; Icons
                    </div>
                  </div>
                  {viewMode !== 'icons_only' && (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('icons_only')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-(--touch-target) ${
                    viewMode === 'icons_only'
                      ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                  data-testid="appearance-viewmode-icons-only"
                >
                  <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold leading-tight">Pictorial</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Icons Only
                    </div>
                  </div>
                  {viewMode === 'icons_only' && (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 px-1">
                Pictorial mode enlarges icons and removes text on tabs &amp;
                actions for universal global usability.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Surface Style */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
            Surface Style
          </span>
          <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border">
            <span className="text-[11px] font-medium text-muted-foreground mb-2 block">
              Card &amp; panel material
            </span>
            <div className="grid grid-cols-4 keep-cols gap-1.5">
              {SURFACE_OPTIONS.map((opt) => {
                const isSelected = surfaceStyle === opt.style;
                return (
                  <button
                    key={opt.style}
                    type="button"
                    onClick={() => setSurfaceStyle(opt.style)}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-medium transition-all cursor-pointer border min-h-(--touch-target) ${
                      isSelected
                        ? 'bg-card text-foreground shadow-sm border-primary/40 ring-1 ring-primary/30'
                        : 'bg-background/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                    }`}
                    data-testid={`appearance-surface-${opt.style}`}
                  >
                    <span
                      className={isSelected ? 'text-primary' : 'opacity-70'}
                    >
                      {opt.icon}
                    </span>
                    <span className="font-semibold">{opt.label}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight text-center">
                      {opt.desc}
                    </span>
                    {isSelected && (
                      <Check className="w-2.5 h-2.5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 px-1">
              Flat = classic matte. Glass modes add backdrop blur &amp; specular
              highlights. Tilt adds pointer-tracked 3D refraction.
            </p>
          </div>
        </div>

        {/* Section 3: Text Size / Accessibility */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
            Text Size
          </span>
          <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border flex flex-col gap-3">
            {/* Live indicator + reset */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <ALargeSmall className="w-3.5 h-3.5 text-primary" />
                Scale: {textScale}%
              </span>
              {textScale !== DEFAULT_TEXT_SCALE && (
                <button
                  type="button"
                  onClick={resetTextScale}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/40 min-h-9 cursor-pointer"
                  aria-label="Reset text scale to default"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Slider + A−/A+ steppers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stepTextScale(-TEXT_SCALE_STEP)}
                disabled={textScale <= MIN_TEXT_SCALE}
                className="min-w-11 min-h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                aria-label="Decrease text size"
              >
                A−
              </button>
              <input
                type="range"
                min={MIN_TEXT_SCALE}
                max={MAX_TEXT_SCALE}
                step={TEXT_SCALE_STEP}
                value={textScale}
                onChange={(e) => setTextScale(Number(e.target.value))}
                className="flex-1 accent-primary h-2 rounded-full cursor-pointer"
                aria-label="Text scale slider"
              />
              <button
                type="button"
                onClick={() => stepTextScale(TEXT_SCALE_STEP)}
                disabled={textScale >= MAX_TEXT_SCALE}
                className="min-w-11 min-h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            {/* Preset pills */}
            <div className="grid grid-cols-4 keep-cols gap-1.5">
              {TEXT_PRESETS.map((preset) => {
                const isActive = textScale === preset.scale;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTextScale(preset.scale)}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[10px] font-medium border transition-all cursor-pointer min-h-(--touch-target) ${
                      isActive
                        ? 'bg-card text-foreground border-primary/40 shadow-sm ring-1 ring-primary/30'
                        : 'bg-background/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                    }`}
                    aria-label={`Set text scale to ${preset.label} (${preset.scale}%)`}
                    aria-pressed={isActive}
                  >
                    <span
                      className={`font-bold ${preset.scale >= 115 ? 'text-sm' : preset.scale <= 90 ? 'text-[9px]' : 'text-xs'}`}
                    >
                      Aa
                    </span>
                    <span className="font-semibold">{preset.label}</span>
                    <span className="text-[9px] opacity-70">
                      {preset.scale}%
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground px-1">
              Adjusts app text size from {MIN_TEXT_SCALE}% to {MAX_TEXT_SCALE}%.
              All interactive targets remain tappable at any size.
            </p>
          </div>
        </div>

        {/* Section 4: Motion & Animations */}
        <AnimationSettingsCard />
      </Modal.Body>
    </Modal.Container>
  );
};
