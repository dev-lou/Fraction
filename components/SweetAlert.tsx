'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SweetAlert({
  open,
  title,
  text,
  icon = 'success',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onConfirm?.();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onConfirm]);

  const bgColor = icon === 'success' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300' : icon === 'error' ? 'bg-red-600/10 border-red-500/20 text-red-400' : 'bg-sky-600/10 border-sky-500/20 text-sky-300';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ type: 'spring', stiffness: 300 }} className="relative z-10 w-full max-w-md rounded-2xl border bg-[#0b0b0b] p-6">
            <div className={`flex items-start gap-4 rounded-lg border p-4 ${bgColor}`}>
              <div className="flex-shrink-0">
                {icon === 'success' ? (
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                ) : icon === 'error' ? (
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v10" />
                      <circle cx="12" cy="17" r="1" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="text-lg font-semibold text-neutral-50">{title}</div>
                {text && <div className="mt-1 text-sm text-neutral-300">{text}</div>}
              </div>
            </div>
            {children && <div className="mt-4">{children}</div>}

            <div className="mt-4 flex justify-end gap-2">
              {cancelText && <button onClick={() => onCancel?.()} className="rounded-full border border-neutral-800 px-4 py-2 font-semibold text-neutral-200 hover:brightness-95">{cancelText}</button>}
              <button autoFocus onClick={() => onConfirm?.()} className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-black hover:brightness-95">{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// End of SweetAlert component
