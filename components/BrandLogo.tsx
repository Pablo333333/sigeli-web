'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { BrandMeta, BrandColors, USE_CUSTOM_LOGO } from '@/lib/brand';

type Props = {
  size?: number;
  variant?: 'mark' | 'full';
  light?: boolean;
  className?: string;
};

export function BrandLogo({ size = 64, variant = 'mark', light = false, className = '' }: Props) {
  const fg = light ? '#FFFFFF' : BrandColors.primary;

  if (USE_CUSTOM_LOGO) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div
          className="flex items-center justify-center bg-white overflow-hidden shadow-sm"
          style={{ width: size, height: size, borderRadius: size * 0.18 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BrandMeta.logoPath}
            alt={BrandMeta.appName}
            width={size * 0.92}
            height={size * 0.92}
            className="object-contain"
          />
        </div>
        {variant === 'full' && (
          <>
            <p className="mt-3 text-3xl font-extrabold tracking-wide" style={{ color: fg }}>
              {BrandMeta.appName}
            </p>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: light ? 'rgba(255,255,255,0.85)' : BrandColors.textSecondary }}
            >
              {BrandMeta.organizerName}
            </p>
          </>
        )}
      </div>
    );
  }

  const bg = light ? 'rgba(255,255,255,0.14)' : BrandColors.accentSoft;
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: size, height: size, backgroundColor: bg }}
      >
        <ShieldCheck style={{ color: fg, width: size * 0.5, height: size * 0.5 }} />
      </div>
      {variant === 'full' && (
        <>
          <p className="mt-3 text-3xl font-extrabold tracking-wide" style={{ color: fg }}>
            {BrandMeta.appName}
          </p>
          <p
            className="text-xs font-semibold mt-0.5"
            style={{ color: light ? 'rgba(255,255,255,0.8)' : BrandColors.textSecondary }}
          >
            {BrandMeta.organizerName}
          </p>
        </>
      )}
    </div>
  );
}
