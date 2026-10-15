'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface GradientTextProps {
  children: React.ReactNode;
  variant?: 'milan-red' | 'shimmer' | 'gold' | 'espresso';
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

export default function GradientText({
  children,
  variant = 'milan-red',
  className,
  as: Component = 'span',
}: GradientTextProps) {
  const variantStyles = {
    'milan-red': 'bg-gradient-to-r from-[#9F1239] via-[#881337] to-[#4C0519]',
    shimmer: 'bg-gradient-to-r from-[#881337] via-[#CA8A04] to-[#881337]',
    gold: 'bg-gradient-to-r from-[#EAB308] via-[#CA8A04] to-[#A16207]',
    espresso: 'bg-gradient-to-r from-[#1C0D12] to-[#3D1B24]',
  }[variant];

  return (
    <Component
      className={cn(
        'bg-clip-text text-transparent font-extrabold',
        variantStyles,
        className
      )}
    >
      {children}
    </Component>
  );
}
