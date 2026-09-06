import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { useDeveloperMode, useDeveloperModal } from '@/core/lib/developer-mode';
import { devTelemetry, type TelemetryMetrics } from '@/core/lib/dev-telemetry';
import { DeveloperModal } from './developer-modal';

export const FloatingDevButton: React.FC = () => {
  const [developerMode] = useDeveloperMode();
  const [isModalOpen, setIsModalOpen] = useDeveloperModal();
  const [metrics, setMetrics] = useState<TelemetryMetrics>(() =>
    devTelemetry.getMetrics(),
  );

  const isDraggingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = devTelemetry.subscribe(() => {
      setMetrics(devTelemetry.getMetrics());
    });
    return unsubscribe;
  }, []);

  if (!developerMode) {
    return null;
  }

  const errorCount = metrics.failedApiCalls + metrics.consoleErrors;
  const hasInFlight = metrics.activeApiCalls > 0;

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.15}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 80);
        }}
        onClick={() => {
          if (!isDraggingRef.current) {
            setIsModalOpen(true);
          }
        }}
        className="fixed bottom-24 right-4 z-40 touch-none select-none cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        title="Developer Diagnostics"
        data-testid="floating-developer-button"
      >
        <div className="relative w-11 h-11 rounded-full bg-card/90 backdrop-blur-md border border-border/80 shadow-lg hover:shadow-blue-500/10 flex items-center justify-center transition-colors">
          <Terminal className="w-5 h-5 text-blue-500" />

          {/* In-Flight Pulse Indicator */}
          {hasInFlight && !errorCount && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
          )}

          {/* Error Count Badge */}
          {errorCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
              {errorCount > 99 ? '99+' : errorCount}
            </span>
          )}
        </div>
      </motion.div>

      <DeveloperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
