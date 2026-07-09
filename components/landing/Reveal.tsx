'use client';

import { useReveal } from '@/hooks/useReveal';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/** Fades in and settles upward once, on first viewport entry. Instant with reduced motion. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
