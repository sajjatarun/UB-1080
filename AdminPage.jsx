import { useState, useEffect } from 'react'
import { getComplaints, getStats, updateStatus } from '../api.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const STATUS_COLORS = {
  'Open': '#3b82f6',
  'In Progress': '#f59e0b',
  'Resolved': '#10b981',
  'Rejected': '#ef4444',
}
const URGENCY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

const STATUS_BADGE = {
  'Open': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
}

export default function AdminPage() {
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', category: '', urgency: '' })
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [c, s] = await Promise.all([
        getComplaints(filter),
        getStats()
      ])
      setComplaints(c.data)
      setStats(s.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId)
    try {
      await updateStatus(ticketId, newStatus)
      await load()
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = complaints.filter(c =>
    !search || c.complaint_text.toLowerCase().includes(search.toLowerCase()) ||
    c.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
    c.citizen_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all citizen complaints</p>
        </div>
        <button onClick={load} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-lg transition-all">
          🔄 Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-slate-900', text: 'text-white' },
            { label: 'Open', value: stats.by_status?.find(s => s.status === 'Open')?.count || 0, color: 'bg-blue-600', text: 'text-white' },
            { label: 'In Progress', value: stats.by_status?.find(s => s.status === 'In Progress')?.count || 0, color: 'bg-yellow-500', text: 'text-white' },
            { label: 'Resolved', value: stats.by_status?.find(s => s.status === 'Resolved')?.count || 0, color: 'bg-emerald-500', text: 'text-white' },
          ].map(({ label, value, color, text }) => (
            <div key={label} className={`${color} ${text} rounded-2xl p-5 shadow-sm`}>
              <div className="text-3xl font-black">{value}</div>
              <div className="text-sm font-medium opacity-80 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* CHARTS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-sm font-bold text-slate-700 mb-4">Complaints by Category</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.by_category} margin={{ left: -20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 9 }} tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n) => [v, 'Complaints']} labelFormatter={l => l} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-sm font-bold text-slate-700 mb-4">Status Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {stats.by_status?.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FILTERS + SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search complaints, names, ticket IDs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Status</option>
          {['Open', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filter.urgency}
          onChange={e => setFilter({ ...filter, urgency: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Priority</option>
          {['high', 'medium', 'low'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
        </select>
        {(filter.status || filter.urgency || search) && (
          <button
            onClick={() => { setFilter({ status: '', category: '', urgency: '' }); setSearch('') }}
            className="text-xs text-slate-500 hover:text-red-500 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* COMPLAINTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No complaints found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Citizen</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Complaint</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.ticket_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{c.ticket_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 text-xs">{c.citizen_name}</div>
                      <div className="text-slate-400 text-xs">{c.citizen_phone}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-slate-700 text-xs line-clamp-2">{c.complaint_text}</div>
                      {c.location && <div className="text-slate-400 text-xs mt-0.5">📍 {c.location}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600 font-medium">{c.category}</div>
                      <div className="text-xs text-slate-400">{c.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                        background: URGENCY_COLORS[c.urgency] + '22',
                        color: URGENCY_COLORS[c.urgency]
                      }}>
                        {c.urgency?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        disabled={updatingId === c.ticket_id}
                        onChange={e => handleStatusChange(c.ticket_id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_BADGE[c.status]} focus:outline-none`}
                      >
                        {['Open', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="text-xs text-slate-400 mt-2 text-right">{filtered.length} complaints shown</div>
    </div>
  )
}
