'use client';

import { useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

const springConfig = { stiffness: 260, damping: 20, mass: 0.8 };

type MagneticButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost';
  className?: string;
  onClick?: () => void;
};

export function MagneticButton({ children, href, variant = 'primary', className = '', onClick }: MagneticButtonProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform([x, y], ([dx, dy]) => `rotateX(${(dy as number) / 12}deg) rotateY(${(dx as number) / 12}deg)`);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const baseStyles = useMemo(() => {
    if (variant === 'primary') {
      return 'bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 text-[#0a0a0a] shadow-[0_10px_40px_rgba(120,255,120,0.35)] hover:shadow-[0_14px_50px_rgba(120,255,120,0.45)]';
    }
    return 'border border-neutral-800 text-neutral-100 hover:border-lime-300/70 hover:text-lime-200';
  }, [variant]);

  const content = (
    <motion.span
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition will-change-transform ${baseStyles} ${className}`}
      style={reduceMotion ? {} : { x: springX, y: springY, transform: rotate }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={(e) => {
        if (reduceMotion) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const dx = e.clientX - rect.left - rect.width / 2;
        const dy = e.clientY - rect.top - rect.height / 2;
        x.set(dx * 0.25);
        y.set(dy * 0.25);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
    >
      {children}
    </motion.span>
  );

  if (href) {
      return (
        <motion.a href={href} className="inline-block" whileFocus={{ scale: 1.01 }}>
          {content}
        </motion.a>
      );
  }

  return content;
}
