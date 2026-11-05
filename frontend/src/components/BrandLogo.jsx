import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({
  variant = 'full', // 'full' | 'mark' | 'image'
  theme = 'light',  // 'light' | 'dark'
  size = 'md',      // 'sm' | 'md' | 'lg'
  to = '/',
  style = {},
}) {
  const isDark = theme === 'dark';
  
  // Color tokens
  const markColor = isDark ? '#D4B896' : '#B89977';
  const textColor = isDark ? '#FFFFFF' : '#14291D';
  const subtextColor = isDark ? '#D4B896' : '#2A3B30';

  // Dimension presets
  const dimensions = {
    sm: { markSize: 32, titleSize: '1.15rem', subSize: '0.52rem', imgHeight: 38 },
    md: { markSize: 42, titleSize: '1.45rem', subSize: '0.62rem', imgHeight: 52 },
    lg: { markSize: 64, titleSize: '2.1rem', subSize: '0.75rem', imgHeight: 76 },
  }[size] || { markSize: 42, titleSize: '1.45rem', subSize: '0.62rem', imgHeight: 52 };

  // SVG Mark component representing the official cabin line art
  const LogoMark = ({ width = dimensions.markSize }) => (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, maxWidth: `${width}px`, display: 'block' }}
    >
      {/* Outer Rounded Container */}
      <rect x="8" y="8" width="104" height="104" rx="22" stroke={markColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Chimney */}
      <path d="M40 38V28H48V46" stroke={markColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Outer Roof Pitch */}
      <path d="M18 78L60 36L102 78" stroke={markColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Inner Roof Pitch */}
      <path d="M26 84L60 50L94 84" stroke={markColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Posts */}
      <line x1="39" y1="67" x2="39" y2="92" stroke={markColor} strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="81" y1="67" x2="81" y2="92" stroke={markColor} strokeWidth="3.5" strokeLinecap="round"/>
      
      {/* Central Door */}
      <rect x="52" y="66" width="16" height="26" stroke={markColor} strokeWidth="3.5" strokeLinejoin="round"/>
      
      {/* Stepped Base Platform */}
      <line x1="32" y1="92" x2="88" y2="92" stroke={markColor} strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="22" y1="98" x2="98" y2="98" stroke={markColor} strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );

  const content = (() => {
    if (variant === 'image' && !isDark) {
      return (
        <img
          src="/logo.jpg"
          alt="Villula Cabins Resort"
          style={{ height: `${dimensions.imgHeight}px`, width: 'auto', display: 'block', objectFit: 'contain', maxWidth: '100%' }}
        />
      );
    }

    if (variant === 'mark') {
      return <LogoMark />;
    }

    // Default: 'full' layout (Mark + Text)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <LogoMark />
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: dimensions.titleSize,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: textColor,
              lineHeight: 1.05,
            }}
          >
            VILLULA
          </div>
          <div
            style={{
              fontSize: dimensions.subSize,
              textTransform: 'uppercase',
              letterSpacing: '0.24em',
              fontWeight: 600,
              color: subtextColor,
              marginTop: '0.15rem',
            }}
          >
            CABINS RESORT
          </div>
        </div>
      </div>
    );
  })();

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', ...style }}>
        {content}
      </Link>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {content}
    </div>
  );
}