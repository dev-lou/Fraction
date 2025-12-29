'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'success', open = true, onClose }: { message: string; type?: 'success'|'error'|'info'; open?: boolean; onClose?: () => void }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  const accent = type === 'success' ? 'bg-lime-400' : type === 'error' ? 'bg-rose-500' : 'bg-sky-400';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="fixed right-6 top-6 z-[99999] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-lg shadow-md overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3 p-3 bg-[#081014]/40 backdrop-blur">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent} text-black`}>✓</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-50">{message}</div>
              </div>
              <button onClick={() => onClose?.()} className="text-neutral-400 hover:text-neutral-200 ml-2" aria-label="Close notification">✕</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}