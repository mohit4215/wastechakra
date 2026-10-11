import React from 'react'

/**
 * WasteChakra Iconic Circular Loader
 * Inspired by the Ashok Chakra / circular loop of zero waste, featuring organic leaf arcs
 * and circular transformation dynamics.
 */
export default function ChakraLoader({
  size = 40,
  color = '#1b4332',
  accentColor = '#52b788',
  label = null,
  message = null,
  fullPage = false,
  className = '',
}) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`chakra-loader-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: fullPage ? 32 : 16,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="chakra-spin-icon"
          style={{
            animation: 'chakra-spin 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            transformOrigin: 'center center',
          }}
        >
          {/* Outer dotted cycle trail */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeOpacity="0.25"
          />

          {/* Chakra Organic 3-Leaf Transformation Petals */}
          {/* Petal 1 */}
          <path
            d="M32 6 C38 16 46 20 46 32 C46 36 43 40 38 40 C32 40 28 32 32 6 Z"
            fill={accentColor}
            fillOpacity="0.85"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Petal 2 (Rotated 120 deg) */}
          <path
            d="M54.5 45 C45 42 39 48 29 42 C25 40 24 35 27 31 C32 26 39 31 54.5 45 Z"
            fill={color}
            fillOpacity="0.9"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Petal 3 (Rotated 240 deg) */}
          <path
            d="M9.5 45 C19 48 25 42 35 48 C39 50 40 55 37 59 C32 64 25 59 9.5 45 Z"
            fill="#d8f3dc"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Central seed / nucleus */}
          <circle cx="32" cy="32" r="4.5" fill={color} />
          <circle cx="32" cy="32" r="2" fill="#ffffff" />
        </svg>

        {/* Subtle breathing ring */}
        <span
          className="chakra-pulse-ring"
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `1.5px solid ${accentColor}`,
            opacity: 0.35,
            animation: 'chakra-pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      </div>

      {(label || message) && (
        <div style={{ textAlign: 'center' }}>
          {label && (
            <div
              style={{
                fontFamily: "'Space Grotesk', var(--font-display, sans-serif)",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '-0.02em',
                color: '#1b4332',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </div>
          )}
          {message && (
            <div
              style={{
                fontSize: 12,
                color: '#556b2f',
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {message}
            </div>
          )}
        </div>
      )}
      <span className="sr-only">Loading waste telemetry and municipal intelligence...</span>
    </div>
  )

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(247, 245, 240, 0.92)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    )
  }

  return content
}

/**
 * Reusable Content Skeleton Loader for heavy data widgets
 */
export function SkeletonBlock({
  height = 120,
  borderRadius = 12,
  className = '',
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${className}`}
      style={{
        height,
        borderRadius,
        background: '#e9e6df',
        border: '1px solid #ddd9d0',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  )
}
