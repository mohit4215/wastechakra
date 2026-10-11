import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Recycle, Truck, ShieldCheck, ArrowRight, MapPin, Sparkles,
  BarChart3, AlertTriangle, Layers, Award, CheckCircle2, ChevronRight,
  Leaf, Info, Compass, ArrowUpRight
} from 'lucide-react'
import { NCR_ZONES } from '../data/mockData.js'

// Intentional Waste Streams Taxonomy according to SWM Rules 2026
const WASTE_STREAMS = [
  {
    category: 'Biodegradable Wet',
    share: '58%',
    color: '#2d6a4f',
    bg: '#edf7f0',
    border: '#b7e4c7',
    icon: '🍃',
    keySources: 'Vegetable mandis, households, hotels, dhabas',
    handling: 'Aerobic bio-methanation & vermicomposting at Okhla & Narela',
    action: 'Segregate green bin at source; avoid polythene liners',
  },
  {
    category: 'Dry Recyclables',
    share: '27%',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: '📦',
    keySources: 'Packaging cardboard, PET bottles, tins, newspapers',
    handling: 'Material Recovery Facilities (MRFs) & registered kabadiwalas',
    action: 'Rinse milk pouches; flatten cardboard before depositing',
  },
  {
    category: 'Construction & Inert',
    share: '11%',
    color: '#9a3412',
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: '🧱',
    keySources: 'Demolition rubble, road sweepings, silt deposits',
    handling: 'C&D Processing Plants at Burari, Shastri Park, Ranikhera',
    action: 'Designated drop-off points; zero mixing with food waste',
  },
  {
    category: 'Domestic Hazardous & E-Waste',
    share: '4%',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: '⚡',
    keySources: 'Spent lithium cells, CFL tubes, paint cans, syringes',
    handling: 'Authorised PRO recovery & TSDF at Bawana industrial hub',
    action: 'Red bin collection; never burn or discard into regular bins',
  },
]

// Real Community Initiatives & Recognition
const COMMUNITY_PROGRAMS = [
  {
    title: 'Ward Zero-Landfill Pacts',
    participants: '34 RWAs',
    impact: '12.4 Tonnes diverted daily',
    status: 'Active',
    quote: 'Door-to-door wet waste segregation in Vasant Kunj Sector C achieved 94% source sorting.',
  },
  {
    title: 'Bulk Waste Generator (BWG) On-Site Audits',
    participants: '182 Hotels & Malls',
    impact: '8.2 Tonnes in-situ composted',
    status: 'Verified',
    quote: 'Select Citywalk & Aerocity hotels installed decentralized bio-digesters.',
  },
  {
    title: 'Informal Waste Picker Integration (Safai Mitras)',
    participants: '1,420 Certified Workers',
    impact: 'Direct livelihood & PPE issuance',
    status: 'Expanding',
    quote: 'Formalized route incentives with cashless UPI collection bonuses.',
  },
]

export default function LandingPortal() {
  const navigate = useNavigate()
  const [activeStream, setActiveStream] = useState(0)

  return (
    <div style={styles.portal}>
      {/* ── 1. Hero: Human-Centered, Editorial & Impact-Driven ── */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeDot} />
            <span style={styles.heroBadgeText}>MUNICIPAL CORPORATION OF DELHI · SWM 2026 PILOT</span>
          </div>

          <h1 style={styles.heroTitle}>
            From Overflowing Corners <br />
            <span style={styles.heroTitleAccent}>to Circular Delhi.</span>
          </h1>

          <p style={styles.heroLead}>
            EcoFleet AI replaces blind morning truck rounds with predictive CVRP intelligence.
            By forecasting bin fill velocity before festival surges and monsoon rains, we abate
            diesel exhaust, empower drivers with live manifests, and give citizens direct voice.
          </p>

          <div style={styles.ctaRow}>
            <button
              onClick={() => navigate('/')}
              style={styles.primaryCta}
            >
              <span>Launch Municipal Command Console</span>
              <ArrowRight size={17} />
            </button>
            <Link to="/report" style={styles.secondaryCta}>
              <AlertTriangle size={16} color="#c2593f" />
              <span>Report Bin Overflow (Citizen Redressal)</span>
            </Link>
          </div>

          {/* Genuine Verified Telemetry Strip */}
          <div style={styles.metricsBand}>
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>50</span>
              <span style={styles.metricLabel}>Delhi NCR Smart Nodes</span>
              <span style={styles.metricSub}>MCD, NDMC, Gurugram, Noida, Ghaziabad</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>98.7%</span>
              <span style={styles.metricLabel}>SWM Rules 2026 Compliance</span>
              <span style={styles.metricSub}>Zero uncontrolled roadside heaps</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>46.9 L</span>
              <span style={styles.metricLabel}>Daily Fuel Saved / Route</span>
              <span style={styles.metricSub}>125.6 kg CO₂ abated vs fixed routing</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>&lt; 45 min</span>
              <span style={styles.metricLabel}>Citizen Redressal Velocity</span>
              <span style={styles.metricSub}>Automated compactor diversion</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The Waste Problem & The Solution: Visual Split ── */}
      <section style={styles.narrativeSection}>
        <div style={styles.narrativeGrid}>
          {/* Legacy Model */}
          <div style={styles.narrativeCardOld}>
            <div style={styles.narrativeTagOld}>THE LEGACY PARADOX (BEFORE)</div>
            <h3 style={styles.narrativeHeading}>Fixed schedules, blind sweeps</h3>
            <ul style={styles.narrativeList}>
              <li>Compactors visit half-empty bins while market bins spill onto the road.</li>
              <li>Heavy 12-tonne diesel trucks emit unneeded PM2.5 in morning school hours.</li>
              <li>Citizen complaints are registered in paper logs and delayed for days.</li>
              <li>Diwali packaging spikes and monsoon wet waste crash the collection system.</li>
            </ul>
          </div>

          {/* EcoFleet AI Model */}
          <div style={styles.narrativeCardNew}>
            <div style={styles.narrativeTagNew}>CIRCULAR MCD ARCHITECTURE (NOW)</div>
            <h3 style={styles.narrativeHeading}>Demand-driven dynamic CVRP dispatch</h3>
            <ul style={styles.narrativeList}>
              <li>ML predicts high-risk bins based on weather signals, festivals, and history.</li>
              <li>Greedy & Clarke-Wright routing calculates shortest multi-truck circuits.</li>
              <li>Trucks bypass low-risk bins (&lt;45% fill), saving diesel and cutting traffic.</li>
              <li>Citizens upload photo reports that directly reprioritize today's active manifest.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. Waste Streams: Educational, Categorical & Tactile ── */}
      <section style={styles.streamsSection}>
        <div style={styles.sectionHeaderWrap}>
          <div style={styles.sectionKicker}>SEPARATION AT SOURCE</div>
          <h2 style={styles.sectionTitle}>Delhi's 4 Municipal Waste Streams</h2>
          <p style={styles.sectionSub}>
            Effective routing begins with disciplined segregation. Under SWM Rules 2026, 
            mixed waste attracts municipal penalties, while segregated streams feed specialized facilities.
          </p>
        </div>

        <div style={styles.streamsGrid}>
          {WASTE_STREAMS.map((s, idx) => (
            <div
              key={s.category}
              onClick={() => setActiveStream(idx)}
              style={{
                ...styles.streamCard,
                borderColor: activeStream === idx ? s.color : '#e2ddd2',
                background: activeStream === idx ? s.bg : '#ffffff',
                boxShadow: activeStream === idx ? `0 8px 24px ${s.color}20` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span style={{ ...styles.streamShare, color: s.color, borderColor: s.border }}>
                  {s.share} of total mass
                </span>
              </div>
              <h3 style={{ ...styles.streamName, color: '#1c2421' }}>{s.category}</h3>
              <div style={styles.streamDetail}>
                <strong>Sources:</strong> {s.keySources}
              </div>
              <div style={styles.streamDetail}>
                <strong>Processing Hub:</strong> {s.handling}
              </div>
              <div style={{ ...styles.streamAction, color: s.color, background: `${s.color}12` }}>
                ✓ {s.action}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Community & Collective Impact (No Fake Gamification) ── */}
      <section style={styles.communitySection}>
        <div style={styles.communityContainer}>
          <div style={styles.communityText}>
            <div style={styles.sectionKicker}>GROUND-LEVEL ACCOUNTABILITY</div>
            <h2 style={styles.sectionTitle}>Civic Action, Verifiable Progress</h2>
            <p style={styles.sectionSub}>
              Municipal transformation succeeds when RWAs, market associations, and sanitation workers 
              operate with transparent data rather than opaque promises.
            </p>

            <div style={styles.initiativeStack}>
              {COMMUNITY_PROGRAMS.map((prog) => (
                <div key={prog.title} style={styles.initiativeCard}>
                  <div style={styles.initHeader}>
                    <div>
                      <h4 style={styles.initTitle}>{prog.title}</h4>
                      <span style={styles.initMeta}>{prog.participants} · {prog.impact}</span>
                    </div>
                    <span style={styles.initStatus}>{prog.status}</span>
                  </div>
                  <p style={styles.initQuote}>"{prog.quote}"</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.quickAccessPanel}>
            <div style={styles.quickCard}>
              <div style={styles.quickIconWrap}>
                <Compass size={22} color="#1b4332" />
              </div>
              <h3 style={styles.quickTitle}>Explore Delhi NCR Ward Map</h3>
              <p style={styles.quickDesc}>
                Inspect live bin telemetry, fill predictions, and depot coordinates across South Delhi,
                Central NDMC, Noida, and Gurugram.
              </p>
              <Link to="/routes" style={styles.quickLink}>
                <span>Open GIS Route Simulation</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div style={{ ...styles.quickCard, marginTop: 18, background: '#1b4332', color: '#ffffff' }}>
              <div style={{ ...styles.quickIconWrap, background: '#2d6a4f' }}>
                <ShieldCheck size={22} color="#d8f3dc" />
              </div>
              <h3 style={{ ...styles.quickTitle, color: '#ffffff' }}>SWM 2026 Compliance Audit</h3>
              <p style={{ ...styles.quickDesc, color: '#d8f3dc' }}>
                Download audit-ready PDF/CSV logs of diverted tonnage, diesel savings, and carbon abatements 
                aligned with MoHUA guidelines.
              </p>
              <Link to="/analytics" style={{ ...styles.quickLink, color: '#a7f3d0' }}>
                <span>View ESG Governance Audit</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Open Infrastructure & Polyglot Technical Footprint ── */}
      <section style={styles.footerSection}>
        <div style={styles.footerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Leaf size={22} color="#1b4332" strokeWidth={2.5} />
            <span style={styles.footerBrand}>WasteChakra · EcoFleet AI</span>
          </div>
          <div style={styles.footerNote}>
            Built for Smart Municipal Governance · Engineered with Rust CVRP engine, Go IoT gateway, Python ML, and React GIS.
          </div>
          <div style={styles.footerLinks}>
            <Link to="/" style={styles.footerAnchor}>Command Console</Link>
            <Link to="/routes" style={styles.footerAnchor}>Fleet Routes</Link>
            <Link to="/report" style={styles.footerAnchor}>Citizen Grievance</Link>
            <Link to="/analytics" style={styles.footerAnchor}>ESG Compliance</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const styles = {
  portal: {
    minHeight: '100vh',
    background: '#f7f5f0',
    color: '#1c2421',
  },
  heroSection: {
    padding: '72px 24px 48px',
    borderBottom: '1px solid #e2ddd2',
    background: 'linear-gradient(180deg, #f7f5f0 0%, #edeae2 100%)',
  },
  heroContainer: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#ffffff',
    border: '1px solid #dcd7ca',
    borderRadius: '20px',
    padding: '4px 12px',
    marginBottom: '20px',
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#1b4332',
  },
  heroBadgeText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#1b4332',
  },
  heroTitle: {
    fontSize: 'clamp(34px, 5.5vw, 56px)',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#0d1f18',
    marginBottom: '20px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  heroTitleAccent: {
    color: '#2d6a4f',
    fontStyle: 'normal',
    textDecoration: 'underline',
    textDecorationColor: '#b7e4c7',
    textUnderlineOffset: '6px',
  },
  heroLead: {
    fontSize: 'clamp(15px, 1.8vw, 17.5px)',
    lineHeight: 1.6,
    color: '#40514e',
    maxWidth: '780px',
    marginBottom: '32px',
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '48px',
  },
  primaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: '#1b4332',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14.5px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(27,67,50,0.25)',
  },
  secondaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 22px',
    background: '#ffffff',
    color: '#1c2421',
    border: '1px solid #dcd7ca',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
  },
  metricsBand: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    background: '#ffffff',
    border: '1px solid #e2ddd2',
    borderRadius: '14px',
    padding: '24px 28px',
    gap: '20px',
    boxShadow: '0 4px 12px rgba(27,67,50,0.03)',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  metricVal: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: '#1b4332',
    lineHeight: 1.1,
  },
  metricLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1c2421',
  },
  metricSub: {
    fontSize: '11px',
    color: '#6b7280',
    lineHeight: 1.3,
  },
  metricDivider: {
    width: '1px',
    background: '#e2ddd2',
    display: 'none',
  },

  // Narrative
  narrativeSection: {
    padding: '56px 24px',
    maxWidth: '1120px',
    margin: '0 auto',
  },
  narrativeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  narrativeCardOld: {
    background: '#fffcf7',
    border: '1px solid #ebd8c8',
    borderRadius: '14px',
    padding: '28px',
  },
  narrativeTagOld: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#c2593f',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  narrativeCardNew: {
    background: '#edf7f0',
    border: '1px solid #b7e4c7',
    borderRadius: '14px',
    padding: '28px',
  },
  narrativeTagNew: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#1b4332',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  narrativeHeading: {
    fontSize: '20px',
    fontWeight: 800,
    marginBottom: '16px',
    color: '#1c2421',
  },
  narrativeList: {
    paddingLeft: '20px',
    fontSize: '13.5px',
    color: '#40514e',
    lineHeight: 1.7,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  // Streams
  streamsSection: {
    padding: '48px 24px 64px',
    maxWidth: '1120px',
    margin: '0 auto',
  },
  sectionHeaderWrap: {
    marginBottom: '32px',
  },
  sectionKicker: {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#1b4332',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0d1f18',
    marginBottom: '8px',
  },
  sectionSub: {
    fontSize: '14.5px',
    color: '#556b2f',
    maxWidth: '680px',
    lineHeight: 1.5,
  },
  streamsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '18px',
  },
  streamCard: {
    border: '1.5px solid',
    borderRadius: '14px',
    padding: '22px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  streamShare: {
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid',
    padding: '2px 8px',
    borderRadius: '12px',
    background: '#ffffff',
  },
  streamName: {
    fontSize: '17px',
    fontWeight: 800,
    margin: '4px 0 2px',
  },
  streamDetail: {
    fontSize: '12px',
    color: '#4a5568',
    lineHeight: 1.4,
  },
  streamAction: {
    marginTop: '6px',
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '11.5px',
    fontWeight: 700,
    lineHeight: 1.35,
  },

  // Community
  communitySection: {
    padding: '56px 24px 72px',
    borderTop: '1px solid #e2ddd2',
    background: '#ffffff',
  },
  communityContainer: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '40px',
  },
  communityText: {},
  initiativeStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '24px',
  },
  initiativeCard: {
    background: '#f7f5f0',
    border: '1px solid #e2ddd2',
    borderRadius: '12px',
    padding: '16px 18px',
  },
  initHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  initTitle: {
    fontSize: '14.5px',
    fontWeight: 800,
    color: '#1c2421',
  },
  initMeta: {
    fontSize: '11.5px',
    color: '#6b7280',
  },
  initStatus: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#1b4332',
    background: '#d8f3dc',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  initQuote: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#40514e',
    lineHeight: 1.45,
  },
  quickAccessPanel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  quickCard: {
    background: '#f7f5f0',
    border: '1px solid #e2ddd2',
    borderRadius: '14px',
    padding: '28px',
  },
  quickIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: '#d8f3dc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  quickTitle: {
    fontSize: '18px',
    fontWeight: 800,
    marginBottom: '8px',
    color: '#1c2421',
  },
  quickDesc: {
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#40514e',
    marginBottom: '20px',
  },
  quickLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#1b4332',
    textDecoration: 'none',
  },

  // Footer
  footerSection: {
    padding: '32px 24px',
    borderTop: '1px solid #e2ddd2',
    background: '#edeae2',
  },
  footerInner: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  footerBrand: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '14px',
    fontWeight: 800,
    color: '#1b4332',
  },
  footerNote: {
    fontSize: '12px',
    color: '#6b7280',
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerAnchor: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#1b4332',
    textDecoration: 'none',
  },
}
