'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export default function GlassSurface({
  children,
  className,
  elevated = false,
  interactive = false,
  onClick,
}: GlassSurfaceProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-300 relative overflow-hidden',
        elevated ? 'cinema-panel-elevated' : 'cinema-surface',
        interactive &&
          'hover:-translate-y-1 hover:border-accent-blue/40 hover:shadow-[0_25px_50px_-12px_rgba(79,124,255,0.25)] cursor-pointer',
        className
      )}
    >
      {/* Subtle top reflection line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
