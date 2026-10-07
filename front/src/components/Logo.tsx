import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export default function Logo({ size = 'md', variant = 'default' }: LogoProps) {
  const sizes = { sm: 32, md: 40, lg: 56 };
  const textSizes = { sm: '18px', md: '22px', lg: '32px' };
  const s = sizes[size];
  const color = variant === 'white' ? '#fff' : '#2563EB';
  const textColor = variant === 'white' ? '#fff' : 'var(--text-primary)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? '14px' : '10px' }}>
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill={color} fillOpacity="0.12"/>
        <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="2"/>
        <path d="M14 24h5l3.5-9L27 33l3.5-9H34" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="24" r="3" fill={color}/>
      </svg>
      <span style={{
        fontSize: textSizes[size],
        fontWeight: 800,
        letterSpacing: '-0.5px',
        color: textColor,
        fontFamily: 'var(--font-display)',
      }}>
        Med<span style={{ color }}>Sync</span>
      </span>
    </div>
  );
}
