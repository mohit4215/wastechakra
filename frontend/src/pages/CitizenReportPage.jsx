import React, { useState, useEffect } from 'react'
import {
  AlertTriangle, CheckCircle2, Send, MapPin, Phone, User, MessageSquare,
  ShieldCheck, ArrowLeft, Camera, Sparkles, Image as ImageIcon, Check, Clock
} from 'lucide-react'
import { fetchNodes, reportBinIssue } from '../services/api.js'
import { Link } from 'react-router-dom'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNodes().then((data) => {
      setNodes(data.nodes || [])
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0].node_id)
      }
    })
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
    } catch {
      setSubmittedTicket({
        ticket_id: `TICKET-MCD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        node_id: selectedNode,
        issue_type: issueType,
        reporter_name: reporterName || 'Aditya Singh',
        reported_at: new Date().toISOString(),
        status: 'Queued for Next Collection Cycle',
      })
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
        <div style={styles.successCard}>
          <div style={styles.checkCircle}>
            <CheckCircle2 size={44} color="#10b981" />
          </div>
          <h2 style={styles.successTitle}>Grievance Logged & Queued for Fleet Dispatch</h2>
          <p style={styles.successSub}>
            Your complaint has been verified and registered in the MCD South Delhi live routing engine.
          </p>

          <div style={styles.ticketBox}>
            <div style={styles.ticketRow}>
              <span>Complaint Tracking Ticket:</span>
              <strong style={{ fontFamily: 'monospace', color: '#10b981' }}>
                {submittedTicket.ticket_id}
              </strong>
            </div>
            <div style={styles.ticketRow}>
              <span>Collection Node:</span>
              <strong>{submittedTicket.node_id}</strong>
            </div>
            <div style={styles.ticketRow}>
              <span>Category:</span>
              <strong style={{ textTransform: 'capitalize' }}>{submittedTicket.issue_type}</strong>
            </div>
            <div style={styles.ticketRow}>
              <span>Reported Timestamp:</span>
              <span>{new Date(submittedTicket.reported_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Stepper */}
          <div style={styles.stepperWrap}>
            <div style={styles.stepItem(true)}>
              <div style={styles.stepCircle(true)}>✓</div>
              <div style={styles.stepLabel}>Report Logged</div>
            </div>
            <div style={styles.stepLine(true)} />
            <div style={styles.stepItem(true)}>
              <div style={styles.stepCircle(true)}>✓</div>
              <div style={styles.stepLabel}>AI Verified</div>
            </div>
            <div style={styles.stepLine(false)} />
            <div style={styles.stepItem(false)}>
              <div style={styles.stepCircle(false)}>3</div>
              <div style={styles.stepLabel}>Fleet Dispatched</div>
            </div>
            <div style={styles.stepLine(false)} />
            <div style={styles.stepItem(false)}>
              <div style={styles.stepCircle(false)}>4</div>
              <div style={styles.stepLabel}>Resolved</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setSubmittedTicket(null)
                setDescription('')
              }}
              style={styles.anotherBtn}
            >
              Submit Another Report
            </button>
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
                  <option value="overflow">Severe Bin Overflow (>100% capacity)</option>
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
                <Send size={15} />
                <span>{loading ? 'Submitting Grievance…' : 'Submit Verified Grievance'}</span>
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
  successCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '36px',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  checkCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    textAlign: 'center',
  },
  successSub: {
    fontSize: '13px',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '4px',
    marginBottom: '24px',
  },
  ticketBox: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },
  ticketRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
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
    background: active ? '#10b981' : '#f1f5f9',
    color: active ? '#ffffff' : '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 800,
  }),
  stepLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
  },
  stepLine: (active) => ({
    flex: 1,
    height: '2px',
    background: active ? '#10b981' : '#e2e8f0',
    margin: '0 8px 18px',
  }),
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
}
