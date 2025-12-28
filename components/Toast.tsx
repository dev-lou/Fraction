'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'success', open = true, onClose }: { message: string; type?: 'success'|'error'|'info'; open?: boolean; onClose?: () => void }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  const bg = type === 'success' ? 'linear-gradient(180deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' : type === 'error' ? 'linear-gradient(180deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))' : 'linear-gradient(180deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))';
  const border = type === 'success' ? 'rgba(16,185,129,0.16)' : type === 'error' ? 'rgba(239,68,68,0.16)' : 'rgba(59,130,246,0.16)';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{
            background: bg,
            border: `1px solid ${border}`,
            color: '#d1fae5',
          }}
          className="fixed right-6 top-6 z-[99999] rounded-lg px-4 py-3 shadow-md max-w-sm backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {type === 'success' ? (
                <svg className="h-5 w-5 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : type === 'error' ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v10" />
                  <circle cx="12" cy="17" r="1" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-50">{message}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}