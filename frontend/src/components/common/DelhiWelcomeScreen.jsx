import React, { useState, useEffect } from 'react'
import { Heart, Sparkles, Compass, Shield, ArrowRight } from 'lucide-react'

const CIVIC_WHISPERS = [
  'Mapping 50 ward collection nodes across South Delhi & NDMC…',
  'Harmonizing compactor routes with morning Yamuna breezes…',
  'Consulting historical waste generation velocity in Connaught Place & Lajpat Nagar…',
  'Calculating Clarke-Wright savings to abate diesel exhaust in residential sectors…',
  'Synchronizing civic grievance telemetry with active SWM 2026 mandates…',
]

/**
 * Signature Opening Screen:
 * "Crafted with Heart in Delhi NCR · दिल से दिल्ली NCR में निर्मित"
 * Features an organic Ashok Chakra / brass wheel of transformation with poetic civic copy.
 */
export default function DelhiWelcomeScreen({ onComplete, forceShow = false }) {
  const [whisperIdx, setWhisperIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Only show once per session unless forceShow is requested
    const hasSeen = sessionStorage.getItem('wastechakra_welcome_seen')
    if (hasSeen && !forceShow) {
      setVisible(false)
      if (onComplete) onComplete()
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            sessionStorage.setItem('wastechakra_welcome_seen', 'true')
            setVisible(false)
            if (onComplete) onComplete()
          }, 450)
          return 100
        }
        return prev + 2.5
      })
    }, 45)

    const whisperTimer = setInterval(() => {
      setWhisperIdx((prev) => (prev + 1) % CIVIC_WHISPERS.length)
    }, 1400)

    return () => {
      clearInterval(interval)
      clearInterval(whisperTimer)
    }
  }, [forceShow, onComplete])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to WasteChakra"
      style={styles.overlay}
    >
      <div style={styles.card}>
        {/* Heritage Top Seal */}
        <div style={styles.crestRow}>
          <div style={styles.brassPill}>
            <span style={styles.star}>✦</span>
            <span>MUNICIPAL CORPORATION OF DELHI · EST. 2026</span>
            <span style={styles.star}>✦</span>
          </div>
        </div>

        {/* The Classical Wheel of Transformation (Ashok / Botanical Chakra) */}
        <div style={styles.chakraWrap}>
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: 'chakra-spin 12s linear infinite',
              transformOrigin: 'center center',
            }}
          >
            {/* Outer Fluted Gold Ring */}
            <circle cx="48" cy="48" r="44" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="3 4" />
            <circle cx="48" cy="48" r="38" stroke="#17372c" strokeWidth="1" strokeOpacity="0.4" />

            {/* 12 Architectural Spokes */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30
              const rad = (angle * Math.PI) / 180
              const x2 = 48 + 36 * Math.cos(rad)
              const y2 = 48 + 36 * Math.sin(rad)
              return (
                <line
                  key={i}
                  x1="48"
                  y1="48"
                  x2={x2}
                  y2={y2}
                  stroke="#c59b27"
                  strokeWidth="1.2"
                  strokeOpacity="0.75"
                />
              )
            })}

            {/* Four Organic Leaves at Cardinal Directions */}
            <path
              d="M48 10 C53 22 58 28 48 36 C38 28 43 22 48 10 Z"
              fill="#1b4332"
              stroke="#c59b27"
              strokeWidth="1"
            />
            <path
              d="M86 48 C74 53 68 58 60 48 C68 38 74 43 86 48 Z"
              fill="#2d6a4f"
              stroke="#c59b27"
              strokeWidth="1"
            />
            <path
              d="M48 86 C43 74 38 68 48 60 C58 68 53 74 48 86 Z"
              fill="#1b4332"
              stroke="#c59b27"
              strokeWidth="1"
            />
            <path
              d="M10 48 C22 43 28 38 36 48 C28 58 22 53 10 48 Z"
              fill="#2d6a4f"
              stroke="#c59b27"
              strokeWidth="1"
            />

            {/* Brass Hub */}
            <circle cx="48" cy="48" r="8" fill="#c59b27" />
            <circle cx="48" cy="48" r="4" fill="#071510" />
            <circle cx="48" cy="48" r="1.5" fill="#f8f6f0" />
          </svg>

          {/* Glowing Aura Ring */}
          <div style={styles.haloRing} />
        </div>

        {/* Title & Roman Typography */}
        <div style={styles.titleArea}>
          <div style={styles.subTitle}>SWACHH BHARAT URBAN · CIVIC LOGISTICS</div>
          <h1 style={styles.title}>WasteChakra</h1>
          <div style={styles.tagline}>
            Predictive Municipal Routing & Environmental Intelligence
          </div>
        </div>

        {/* THE SIGNATURE HEART IN DELHI NCR BADGE */}
        <div style={styles.heartRibbon}>
          <div style={styles.heartIcon}>
            <Heart size={14} color="#ffffff" fill="#b84a39" />
          </div>
          <div style={styles.heartTextWrap}>
            <span style={styles.heartEn}>Crafted with Heart in Delhi NCR</span>
            <span style={styles.heartHi}>दिल से दिल्ली NCR में निर्मित</span>
          </div>
        </div>

        {/* Poetic Telemetry Message */}
        <div style={styles.whisperBox}>
          <div style={styles.whisperText}>
            "{CIVIC_WHISPERS[whisperIdx]}"
          </div>
        </div>

        {/* Antiqued Brass Progress Gauge */}
        <div style={styles.progressContainer}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${progress}%`,
              }}
            />
          </div>
          <div style={styles.progressNumbers}>
            <span>INITIALIZING SECTOR MAPPING</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Skip button for quick evaluators */}
        <button
          onClick={() => {
            sessionStorage.setItem('wastechakra_welcome_seen', 'true')
            setVisible(false)
            if (onComplete) onComplete()
          }}
          style={styles.skipBtn}
        >
          <span>Enter Command Console</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at center, #112820 0%, #071510 70%, #040d0a 100%)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    background: '#f8f6f0',
    border: '2px solid #c59b27',
    borderRadius: '16px',
    padding: '36px 32px 28px',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 0 0 1px #e2dac9',
    textAlign: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  crestRow: {
    marginBottom: '20px',
  },
  brassPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#17372c',
    color: '#dfb743',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '10px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.08em',
    border: '1px solid #c59b27',
  },
  star: {
    color: '#dfb743',
    fontSize: '9px',
  },
  chakraWrap: {
    position: 'relative',
    width: '96px',
    height: '96px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRing: {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '50%',
    border: '1.5px solid rgba(197, 155, 39, 0.35)',
    animation: 'chakra-pulse 3s ease-in-out infinite',
    pointerEvents: 'none',
  },
  titleArea: {
    marginBottom: '16px',
  },
  subTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#8c6d16',
    marginBottom: '4px',
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '36px',
    fontWeight: 800,
    color: '#112820',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  tagline: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '15px',
    fontStyle: 'italic',
    color: '#5e6d66',
    marginTop: '4px',
  },
  heartRibbon: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f2eee2',
    border: '1px solid #c59b27',
    borderRadius: '30px',
    padding: '6px 16px',
    margin: '12px 0 16px',
    boxShadow: '0 2px 6px rgba(197, 155, 39, 0.15)',
  },
  heartIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#b84a39',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    lineHeight: 1.15,
  },
  heartEn: {
    fontSize: '12.5px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', Georgia, serif",
    color: '#112820',
  },
  heartHi: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#b84a39',
  },
  whisperBox: {
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px 0 16px',
    padding: '0 16px',
  },
  whisperText: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '14.5px',
    fontStyle: 'italic',
    color: '#3d4a44',
    lineHeight: 1.35,
  },
  progressContainer: {
    width: '100%',
    maxWidth: '380px',
    marginBottom: '16px',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    background: '#e2dac9',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid #cfc4ae',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #17372c 0%, #c59b27 100%)',
    transition: 'width 0.1s linear',
  },
  progressNumbers: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9.5px',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600,
    color: '#8c6d16',
    marginTop: '6px',
  },
  skipBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    color: '#112820',
    fontSize: '11.5px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    cursor: 'pointer',
    padding: '6px 12px',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
}
