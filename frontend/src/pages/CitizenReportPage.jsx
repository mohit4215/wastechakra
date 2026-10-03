import React, { useState, useEffect } from 'react'
import {
  AlertTriangle, CheckCircle2, Send, MapPin, Phone, User, MessageSquare,
  ShieldCheck, ArrowLeft
} from 'lucide-react'
import { fetchNodes, reportBinIssue } from '../services/api.js'
import { Link } from 'react-router-dom'

export default function CitizenReportPage() {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [issueType, setIssueType] = useState('overflow')
  const [description, setDescription] = useState('')
  const [submittedTicket, setSubmittedTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNodes().then(data => {
      setNodes(data.nodes || [])
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0].node_id)
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await reportBinIssue(selectedNode, {
        node_id: selectedNode,
        reporter_name: reporterName || 'Citizen',
        reporter_phone: reporterPhone,
        issue_type: issueType,
        description,
        estimated_overflow_kg: issueType === 'overflow' ? 150 : 50,
      })
      setSubmittedTicket(res)
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.badgeRow}>
          <span style={styles.badge}>MCD Citizen Grievance Redressal</span>
          <span style={styles.rulePill}>SWM Rules 2026 Mandate</span>
        </div>
        <h1 style={styles.title}>Report Bin Overflow or Waste Issue</h1>
        <p style={styles.subtitle}>
          Help MCD maintain clean streets. Verified reports trigger priority vehicle dispatch within 24 hours.
        </p>
      </div>

      {submittedTicket ? (
        <div style={styles.successCard}>
          <div style={styles.checkCircle}>
            <CheckCircle2 size={40} color="#16a34a" />
          </div>
          <h2 style={styles.successTitle}>Grievance Logged Successfully</h2>
          <p style={styles.successSub}>
            Your report for <strong>{selectedNode}</strong> has been received by the MCD EcoFleet Routing Dispatch engine.
          </p>

          <div style={styles.ticketBox}>
            <div style={styles.ticketRow}>
              <span>Tracking Ticket ID:</span>
              <strong>{submittedTicket.ticket_id}</strong>
            </div>
            <div style={styles.ticketRow}>
              <span>Issue Category:</span>
              <strong style={{ textTransform: 'capitalize' }}>{submittedTicket.issue_type}</strong>
            </div>
            <div style={styles.ticketRow}>
              <span>Logged Timestamp:</span>
              <span>{new Date(submittedTicket.reported_at).toLocaleString()}</span>
            </div>
            <div style={styles.ticketRow}>
              <span>Dispatch Action:</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Queued for Next Collection Cycle</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setSubmittedTicket(null)
                setDescription('')
              }}
              style={styles.anotherBtn}
            >
              Submit Another Report
            </button>
            <Link to="/routes" style={styles.viewMapBtn}>
              Track on Route Map
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.formCard}>
          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Affected Collection Node / Bin Cluster *</label>
            <select
              value={selectedNode}
              onChange={e => setSelectedNode(e.target.value)}
              style={styles.select}
              required
            >
              {nodes.map(n => (
                <option key={n.node_id} value={n.node_id}>
                  {n.node_id} — {n.name} ({n.zone})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Issue Nature / Category *</label>
            <div style={styles.issueTypes}>
              {[
                { id: 'overflow', label: '🗑️ Bin Overflowing' },
                { id: 'odor',     label: '💨 Severe Odor / Foul Smell' },
                { id: 'damaged_bin', label: '🛠️ Damaged Bin Structure' },
                { id: 'street_waste', label: '🧹 Scattered Street Waste' },
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setIssueType(item.id)}
                  style={{
                    ...styles.typeBtn,
                    ...(issueType === item.id ? styles.typeBtnActive : {}),
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.row2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={reporterPhone}
                onChange={e => setReporterPhone(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Details / Landmark Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Bins near Gate #2 overflowing since morning after weekend market..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formFooter}>
            <div style={styles.slaNotice}>
              <ShieldCheck size={18} color="#16a34a" />
              <span>SWM 2026 SLA: Priority truck rerouted within 24 hours</span>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              <Send size={16} />
              <span>{loading ? 'Submitting Grievance…' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '860px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '28px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  badge: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  rulePill: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    marginTop: '4px',
  },
  formCard: {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    resize: 'vertical',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  issueTypes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
  },
  typeBtn: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  typeBtnActive: {
    background: '#f0fdf4',
    color: '#15803d',
    borderColor: '#22c55e',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  slaNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#16a34a',
    fontWeight: 600,
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#22c55e',
    color: '#ffffff',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  errorAlert: {
    background: '#fef2f2',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  successCard: {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  checkCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '8px',
  },
  successSub: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '480px',
    margin: '0 auto 24px',
  },
  ticketBox: {
    background: '#f8fafc',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    maxWidth: '480px',
    margin: '0 auto',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '13px',
  },
  ticketRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anotherBtn: {
    padding: '10px 18px',
    background: '#f1f5f9',
    color: '#334155',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  viewMapBtn: {
    padding: '10px 18px',
    background: '#0f172a',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-block',
  },
}
