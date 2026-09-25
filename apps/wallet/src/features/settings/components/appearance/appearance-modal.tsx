/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Monitor, Sun, Moon, Sparkles, Palette, Check } from 'lucide-react';
import { useTheme } from '@/core/theme';
import type { ThemeMode, ColorPalette } from '@/core/theme';
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
  { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
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

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, setTheme, palette, setPalette } = useTheme();

  return (
    <Modal.Container
      isOpened={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="px-2 max-w-md"
    >
      <Modal.Header onClose={onClose}>
        <Modal.Title className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-500" />
          <span>Appearance & Animations</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="gap-5 p-4 max-h-[80vh] overflow-y-auto">
        {/* Section 1: Theme & Color Palette */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
            Theme & Color Palette
          </span>

          <div className="rounded-2xl bg-secondary/60 p-3.5 border border-border flex flex-col gap-4">
            {/* Theme Mode Selector */}
            <div>
              <span className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                Display Mode
              </span>
              <div className="grid grid-cols-4 gap-1.5 bg-background/60 p-1 rounded-xl border border-border">
                {THEME_OPTIONS.map((opt) => {
                  const isSelected = theme === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => setTheme(opt.mode)}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-card text-foreground shadow-xs font-semibold border border-border'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                      data-testid={`appearance-theme-${opt.mode}`}
                    >
                      <div className="flex items-center gap-1">
                        {opt.icon}
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <span>{opt.label}</span>
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
              <div className="grid grid-cols-5 gap-1.5 bg-background/60 p-1.5 rounded-xl border border-border">
                {PALETTE_OPTIONS.map((pal) => {
                  const isSelected = palette === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setPalette(pal.id)}
                      className={`flex flex-col items-center gap-1.5 py-2 px-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
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
          </div>
        </div>

        {/* Section 2: Motion & Animations */}
        <AnimationSettingsCard />
      </Modal.Body>
    </Modal.Container>
  );
};
