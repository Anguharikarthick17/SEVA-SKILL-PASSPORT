'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'saffron' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  ariaLabel?: string;
}

export default function GlowButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  type = 'button',
  id,
  ariaLabel,
}: GlowButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-full',
    md: 'px-6 py-2.5 text-sm rounded-full',
    lg: 'px-7 py-3 text-base rounded-full',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#881337] text-white border border-white/20 shadow-[0_4px_14px_rgba(136,19,55,0.25)] hover:bg-[#700F2E] hover:shadow-[0_8px_20px_rgba(136,19,55,0.35)]',
    saffron:
      'bg-[#CA8A04] text-white font-bold border border-white/30 shadow-[0_4px_14px_rgba(202,138,4,0.25)] hover:bg-[#A16207] hover:shadow-[0_8px_20px_rgba(202,138,4,0.35)]',
    glass:
      'bg-white text-[#1C0D12] border border-[#881337]/20 hover:border-[#881337] hover:text-[#881337] hover:bg-[#FFF1F2] shadow-[0_2px_8px_rgba(136,19,55,0.06)]',
    outline:
      'bg-transparent text-[#1C0D12] border border-[#881337]/30 hover:border-[#881337] hover:text-[#881337] hover:bg-[#FFF1F2] shadow-xs',
  }[variant];

  const baseClasses = cn(
    'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-milan-600 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-bg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group select-none',
    sizeClasses,
    variantClasses,
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} id={id} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
