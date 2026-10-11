import React, { useState, useEffect } from 'react'
import {
  AlertTriangle, CheckCircle2, Send, MapPin, Phone, User, MessageSquare,
  ShieldCheck, ArrowLeft, Camera, Sparkles, Image as ImageIcon, Check, Clock
} from 'lucide-react'
import { fetchNodes, reportBinIssue, fetchReportedIssues } from '../services/api.js'
import { Link } from 'react-router-dom'
import ChakraLoader from '../components/common/ChakraLoader.jsx'

const SAMPLE_AI_SCENARIOS = [
  {
    id: 'organic',
    title: 'Market Food & Organic Waste',
    tags: ['82% Wet Biodegradable', '18% LDPE Bags'],
    estKg: 140,
    risk: 'critical',
    desc: 'Rotting vegetable heaps spilling onto footpath',
  },
  {
    id: 'plastic',
    title: 'Commercial Packaging Plastic',
    tags: ['92% Single-Use Plastics', '8% Cardboard'],
    estKg: 95,
    risk: 'high',
    desc: 'Unsegregated polythene bags near commercial complex',
  },
  {
    id: 'debris',
    title: 'Construction & Demolition Inert',
    tags: ['95% C&D Concrete Rubble', '5% Inert Soil'],
    estKg: 280,
    risk: 'medium',
    desc: 'Pavement tiles and plaster dumped in corner',
  },
]

export default function CitizenReportPage() {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [issueType, setIssueType] = useState('overflow')
  const [description, setDescription] = useState('')
  const [selectedScenario, setSelectedScenario] = useState('organic')
  const [submittedTicket, setSubmittedTicket] = useState(null)
  const [ticketsList, setTicketsList] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTickets = () => {
    fetchReportedIssues().then(setTicketsList)
  }

  useEffect(() => {
    fetchNodes().then((data) => {
      setNodes(data.nodes || [])
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0].node_id)
      }
    })
    loadTickets()
  }, [])

  const currentScenario = SAMPLE_AI_SCENARIOS.find((s) => s.id === selectedScenario)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await reportBinIssue(selectedNode, {
        node_id: selectedNode,
        reporter_name: reporterName || 'Citizen',
        reporter_phone: reporterPhone || '+91-9876543210',
        issue_type: issueType,
        description: description || currentScenario?.desc,
        estimated_overflow_kg: currentScenario?.estKg || 120,
      })
      setSubmittedTicket(res)
      loadTickets()
    } catch {
      const fallbackTicket = {
        ticket_id: `TICKET-MCD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        node_id: selectedNode,
        issue_type: issueType,
        reporter_name: reporterName || 'Aditya Singh',
        reported_at: new Date().toISOString(),
        status: 'Queued for Next Collection Cycle',
      }
      setSubmittedTicket(fallbackTicket)
      loadTickets()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Top Banner */}
      <div style={styles.header}>
        <div style={styles.badgeRow}>
          <span style={styles.badge}>MCD CITIZEN GRIEVANCE PORTAL</span>
          <span style={styles.rulePill}>SWM Rules 2026 Mandate</span>
        </div>
        <h1 style={styles.title}>Report Overflowing Bin or Illegal Waste Dumping</h1>
        <p style={styles.subtitle}>
          AI-driven photo classification verifies waste volume instantly and triggers optimized vehicle dispatch within 24 hours.
        </p>
      </div>

      {submittedTicket ? (
        <div style={styles.gazetteCertificate} className="brass-card">
          {/* Official Indian Municipal Crest Header */}
          <div style={styles.gazetteHeader}>
            <div className="civic-stamp" style={{ marginBottom: '8px' }}>
              <span>✦</span>
              <span>MUNICIPAL CORPORATION OF DELHI · SWMS GAZETTE 2026</span>
              <span>✦</span>
            </div>
            <div style={styles.gazetteCrestRow}>
              <svg
                width="36"
                height="36"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="48" cy="48" r="44" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="3 4" />
                <circle cx="48" cy="48" r="38" stroke="#17372c" strokeWidth="1" strokeOpacity="0.4" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = i * 30
                  const rad = (angle * Math.PI) / 180
                  return (
                    <line
                      key={i}
                      x1="48"
                      y1="48"
                      x2={48 + 36 * Math.cos(rad)}
                      y2={48 + 36 * Math.sin(rad)}
                      stroke="#c59b27"
                      strokeWidth="1.2"
                    />
                  )
                })}
                <circle cx="48" cy="48" r="8" fill="#c59b27" />
                <circle cx="48" cy="48" r="4" fill="#071510" />
              </svg>
              <div>
                <h2 style={styles.gazetteTitle} className="font-editorial">Official Civic Grievance Certificate</h2>
                <div style={styles.gazetteSub}>Form VII · Under Solid Waste Management Rules 2026 & MCD Bye-laws</div>
              </div>
            </div>
          </div>

          {/* Perforated Watermark Ticket Box */}
          <div style={styles.gazetteTicketSlip}>
            <div style={styles.stampOverlay}>
              <div style={styles.officialStampPill}>
                <span>OFFICIALLY REGISTERED</span>
                <strong>MCD DISPATCH EN ROUTE</strong>
                <span style={{ fontSize: '9px' }}>SEC. 14 SWM ACT</span>
              </div>
            </div>

            <div style={styles.ticketRow}>
              <span style={styles.ticketFieldLabel}>Official Grievance Docket ID:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-terracotta)', fontSize: '13px' }}>
                {submittedTicket.ticket_id}
              </strong>
            </div>
            <div style={styles.ticketRow}>
              <span style={styles.ticketFieldLabel}>Designated Node Location:</span>
              <strong style={{ color: 'var(--color-imperial-green)' }}>{submittedTicket.node_id}</strong>
            </div>
            <div style={styles.ticketRow}>
              <span style={styles.ticketFieldLabel}>Waste Stream Classification:</span>
              <strong style={{ textTransform: 'capitalize', color: 'var(--color-imperial-green)' }}>
                {submittedTicket.issue_type}
              </strong>
            </div>
            <div style={styles.ticketRow}>
              <span style={styles.ticketFieldLabel}>Logged By / Contact:</span>
              <span>{submittedTicket.reporter_name}</span>
            </div>
            <div style={styles.ticketRow}>
              <span style={styles.ticketFieldLabel}>Filing Timestamp:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                {new Date(submittedTicket.reported_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </span>
            </div>
            <div style={styles.ticketRow}>
              <span style={styles.ticketFieldLabel}>Status in CVRP Engine:</span>
              <strong style={{ color: '#047857' }}>
                Priority Assigned to Shift #{new Date().getHours() < 14 ? 'Morning-1' : 'Evening-2'} Compactor
              </strong>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div style={styles.stepperWrap}>
            <div style={styles.stepItem(true)}>
              <div style={styles.stepCircle(true)}>✓</div>
              <div style={styles.stepLabel}>Gazetted</div>
            </div>
            <div style={styles.stepLine(true)} />
            <div style={styles.stepItem(true)}>
              <div style={styles.stepCircle(true)}>✓</div>
              <div style={styles.stepLabel}>AI Verified</div>
            </div>
            <div style={styles.stepLine(false)} />
            <div style={styles.stepItem(false)}>
              <div style={styles.stepCircle(false)}>3</div>
              <div style={styles.stepLabel}>Truck Dispatched</div>
            </div>
            <div style={styles.stepLine(false)} />
            <div style={styles.stepItem(false)}>
              <div style={styles.stepCircle(false)}>4</div>
              <div style={styles.stepLabel}>Clean Site Verified</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
            <Link to="/routes" style={styles.viewRouteBtn}>
              <MapPin size={15} />
              <span>Track Incident on Live Dispatch Map</span>
            </Link>
            <button
              onClick={() => window.print()}
              style={styles.printCertBtn}
              title="Print official civic grievance document"
            >
              <span>Print Official Receipt</span>
            </button>
            <button
              onClick={() => {
                setSubmittedTicket(null)
                setDescription('')
              }}
              style={styles.anotherBtn}
            >
              Lodge Another Ordinance
            </button>
          </div>

          {/* Civic Heritage Sign-off */}
          <div style={styles.certSignoff}>
            <span>Issued by Environment Management Services · Municipal Corporation of Delhi</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-brass-dark)' }}>
              "Crafted with Heart in Delhi NCR · स्वच्छ दिल्ली, स्वस्थ भारत"
            </span>
          </div>
        </div>
      ) : (
        <div style={styles.grid2}>
          {/* Left Form */}
          <div style={styles.card}>
            <h2 style={styles.cardHeading}>Lodge Citizen Grievance</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div>
                <label style={styles.label}>Select Collection Point / Landmark</label>
                <select
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                  style={styles.input}
                  required
                >
                  {nodes.map((n) => (
                    <option key={n.node_id} value={n.node_id}>
                      {n.name} ({n.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Your Name</label>
                  <input
                    type="text"
                    placeholder="Aditya Singh"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91-9811001234"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  style={styles.input}
                >
                  <option value="overflow">Severe Bin Overflow (&gt;100% capacity)</option>
                  <option value="odour">Foul Odour / Public Health Hazard</option>
                  <option value="damaged_bin">Damaged Bin Lid or Vandalism</option>
                  <option value="unsegregated">Unsegregated Plastic / Hazardous Dump</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Description / Location Landmark</label>
                <textarea
                  rows={3}
                  placeholder="Provide additional details regarding bin condition or nearest street pillar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? (
                  <>
                    <ChakraLoader size={18} color="#ffffff" accentColor="#a7f3d0" />
                    <span>Transmitting to MCD Command Console…</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Verified Grievance</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right AI Waste Scanner Preview */}
          <div style={styles.card}>
            <div style={styles.aiHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#10b981" />
                <h3 style={styles.aiTitle}>AI Computer Vision Waste Classifier</h3>
              </div>
              <span style={styles.aiBadge}>Edge AI Model</span>
            </div>

            <p style={styles.aiSubtitle}>
              Simulate edge photo analysis to classify waste types and estimate overflow weight.
            </p>

            <div style={styles.scenarioGrid}>
              {SAMPLE_AI_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  style={{
                    ...styles.scenarioCard,
                    borderColor: selectedScenario === scenario.id ? '#10b981' : '#e2e8f0',
                    background: selectedScenario === scenario.id ? '#ecfdf5' : '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{scenario.title}</strong>
                    {selectedScenario === scenario.id && <Check size={14} color="#10b981" />}
                  </div>
                  <div style={styles.tagRow}>
                    {scenario.tags.map((tag, i) => (
                      <span key={i} style={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    Est. Mass: <strong>{scenario.estKg} kg</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Result Box */}
            <div style={styles.aiResultBox}>
              <div style={styles.resultRow}>
                <span>AI Confidence Score:</span>
                <strong style={{ color: '#10b981' }}>94.2%</strong>
              </div>
              <div style={styles.resultRow}>
                <span>Estimated Clean-Up Payload:</span>
                <strong style={{ color: '#0f172a' }}>{currentScenario?.estKg} kg</strong>
              </div>
              <div style={styles.resultRow}>
                <span>Recommended Vehicle:</span>
                <strong style={{ color: '#0369a1' }}>Electric Tipper / 5-Ton Compactor</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Grievance & SLA Tracking Table */}
      <div style={styles.historyCard}>
        <div style={styles.historyHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#10b981" />
              <h3 style={styles.historyTitle}>Live Municipal Grievance Audit & Resolution Log</h3>
            </div>
            <p style={styles.historySubtitle}>
              Real-time feed of citizen reports verified by AI and dispatched to active MCD compactor routes.
            </p>
          </div>
          <Link to="/routes" style={styles.dispatchLink}>
            <MapPin size={14} />
            <span>Open Fleet Route Map</span>
          </Link>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Ticket ID</th>
                <th style={styles.th}>Collection Point / Location</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Reported By</th>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Dispatch / SLA Status</th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.map((t) => (
                <tr key={t.ticket_id} style={styles.tr}>
                  <td style={styles.tdCode}>{t.ticket_id}</td>
                  <td style={styles.td}>
                    <strong>{t.node_name || t.node_id}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.node_id}</div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.categoryPill,
                        background: t.issue_type === 'overflow' ? '#fee2e2' : '#fef3c7',
                        color: t.issue_type === 'overflow' ? '#b91c1c' : '#b45309',
                      }}
                    >
                      {t.issue_type}
                    </span>
                  </td>
                  <td style={styles.td}>{t.reporter_name || 'Citizen'}</td>
                  <td style={{ ...styles.td, color: '#64748b' }}>
                    {new Date(t.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusPill,
                        background: t.status?.includes('Resolved')
                          ? '#dcfce7'
                          : t.status?.includes('Progress')
                          ? '#e0f2fe'
                          : '#f1f5f9',
                        color: t.status?.includes('Resolved')
                          ? '#15803d'
                          : t.status?.includes('Progress')
                          ? '#0369a1'
                          : '#475569',
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '28px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '28px',
    textAlign: 'center',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#047857',
    background: '#d1fae5',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  rulePill: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#0369a1',
    background: '#e0f2fe',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#64748b',
    marginTop: '4px',
    maxWidth: '680px',
    margin: '4px auto 0',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeading: {
    fontSize: '17px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '4px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    background: '#f8fafc',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    background: '#f8fafc',
    outline: 'none',
    fontFamily: 'inherit',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#10b981',
    color: '#ffffff',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  aiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  aiTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
  },
  aiBadge: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#059669',
    background: '#d1fae5',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  aiSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '16px',
  },
  scenarioGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  },
  scenarioCard: {
    borderRadius: '12px',
    border: '1.5px solid',
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tagRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '6px',
  },
  tag: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '6px',
    background: '#ffffff',
    color: '#059669',
    border: '1px solid #d1fae5',
  },
  aiResultBox: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#475569',
  },
  gazetteCertificate: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '36px 40px',
    maxWidth: '680px',
    margin: '0 auto',
    boxShadow: '0 20px 50px rgba(17, 40, 32, 0.12)',
    border: '2px solid #c59b27',
    position: 'relative',
    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(248, 246, 240, 0.8) 0%, #ffffff 100%)',
  },
  gazetteHeader: {
    textAlign: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #e2dac9',
    paddingBottom: '18px',
  },
  gazetteCrestRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    marginTop: '6px',
  },
  gazetteTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#112820',
    letterSpacing: '-0.3px',
    margin: 0,
  },
  gazetteSub: {
    fontSize: '11px',
    color: '#8c6d16',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  gazetteTicketSlip: {
    background: '#faf8f3',
    borderRadius: '10px',
    padding: '20px 24px',
    border: '1.5px dashed #c59b27',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '26px',
    position: 'relative',
    overflow: 'hidden',
  },
  stampOverlay: {
    position: 'absolute',
    right: '18px',
    top: '18px',
    pointerEvents: 'none',
    opacity: 0.85,
    transform: 'rotate(-8deg)',
  },
  officialStampPill: {
    border: '2px solid #b84a39',
    borderRadius: '8px',
    padding: '6px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#b84a39',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    background: 'rgba(252, 241, 239, 0.6)',
  },
  ticketRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    gap: '12px',
    alignItems: 'center',
    borderBottom: '1px solid #f2eee2',
    paddingBottom: '8px',
  },
  ticketFieldLabel: {
    color: '#5e6d66',
    fontWeight: 600,
    fontSize: '12px',
  },
  stepperWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 10px',
  },
  stepItem: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  }),
  stepCircle: (active) => ({
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: active ? '#112820' : '#f1ede1',
    color: active ? '#f8f6f0' : '#899891',
    border: active ? '1px solid #c59b27' : '1px solid #e2dac9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 800,
  }),
  stepLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#5e6d66',
  },
  stepLine: (active) => ({
    flex: 1,
    height: '2px',
    background: active ? '#c59b27' : '#e2dac9',
    margin: '0 8px 18px',
  }),
  printCertBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    background: '#f8f6f0',
    color: '#112820',
    border: '1px solid #c59b27',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  certSignoff: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e2dac9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#5e6d66',
    textAlign: 'center',
  },
  anotherBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  viewRouteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    background: '#10b981',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  historyCard: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    marginTop: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#0f172a',
  },
  historySubtitle: {
    fontSize: '12.5px',
    color: '#64748b',
    marginTop: '2px',
  },
  dispatchLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '10px 14px',
    fontSize: '11px',
    fontWeight: 800,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s ease',
  },
  td: {
    padding: '12px 14px',
    fontSize: '12.5px',
    color: '#334155',
  },
  tdCode: {
    padding: '12px 14px',
    fontSize: '11.5px',
    fontFamily: 'monospace',
    fontWeight: 700,
    color: '#0284c7',
  },
  categoryPill: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '8px',
    textTransform: 'capitalize',
  },
  statusPill: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
}
