import { useState } from 'react'
import { getComplaint } from '../api.js'

const STATUS_CONFIG = {
  'Open': { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🔵', step: 0 },
  'In Progress': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡', step: 1 },
  'Resolved': { color: 'bg-green-100 text-green-700 border-green-300', icon: '🟢', step: 2 },
  'Rejected': { color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴', step: 3 },
}

const URGENCY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export default function TrackPage() {
  const [ticketId, setTicketId] = useState('')
  const [loading, setLoading] = useState(false)
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ticketId.trim()) return
    setLoading(true)
    setError('')
    setComplaint(null)
    try {
      const res = await getComplaint(ticketId.trim().toUpperCase())
      setComplaint(res.data)
    } catch {
      setError('Ticket not found. Please check your Ticket ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Open', 'In Progress', 'Resolved']

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-slate-200">
          🔍 Track Your Complaint
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Check Status</h1>
        <p className="text-slate-500 text-sm">Enter your Ticket ID to see the current status of your complaint.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
          placeholder="Enter Ticket ID (e.g. GRV-001)"
          className="flex-1 border border-slate-300 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-60"
        >
          {loading ? '...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {complaint && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Ticket ID</div>
                <div className="font-mono font-bold text-lg">{complaint.ticket_id}</div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_CONFIG[complaint.status]?.color}`}>
                {STATUS_CONFIG[complaint.status]?.icon} {complaint.status}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {complaint.status !== 'Rejected' && (
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-200"></div>
                <div
                  className="absolute top-3.5 left-6 h-0.5 bg-blue-600 transition-all"
                  style={{ width: `${(STATUS_CONFIG[complaint.status]?.step || 0) * 50}%` }}
                ></div>
                {steps.map((step, i) => {
                  const current = STATUS_CONFIG[complaint.status]?.step || 0
                  const done = i <= current
                  return (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <div className={`text-xs mt-1.5 font-medium ${done ? 'text-blue-700' : 'text-slate-400'}`}>{step}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="p-6 space-y-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Complaint</div>
              <p className="text-sm text-slate-700 leading-relaxed">{complaint.complaint_text}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Category</div>
                <div className="text-sm font-semibold">{complaint.category}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Department</div>
                <div className="text-sm font-semibold">{complaint.department}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Priority</div>
                <div className={`text-sm font-bold inline-flex px-2 py-0.5 rounded-full ${URGENCY_COLORS[complaint.urgency]}`}>
                  {complaint.urgency?.toUpperCase()}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Filed On</div>
                <div className="text-sm font-semibold">{new Date(complaint.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {complaint.auto_reply && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-semibold mb-1">📩 Official Response</div>
                <div className="text-sm text-blue-800">{complaint.auto_reply}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo hints */}
      {!complaint && !error && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center">
          <div className="text-slate-400 text-sm mb-2">Try these demo tickets:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {['GRV-001', 'GRV-002', 'GRV-003', 'GRV-004'].map(id => (
              <button
                key={id}
                onClick={() => { setTicketId(id); }}
                className="font-mono text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
