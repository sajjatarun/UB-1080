import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import SubmitPage from './pages/SubmitPage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

const NAV = [
  { to: '/', label: '📝 File Complaint', exact: true },
  { to: '/track', label: '🔍 Track Status' },
  { to: '/admin', label: '🛡 Admin Dashboard' },
]

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white text-lg font-black">G</div>
            <div>
              <div className="font-extrabold text-slate-900 leading-none text-lg">Grievance</div>
              <div className="text-xs text-slate-400 font-medium">AI-Powered Civic Portal · English & ಕನ್ನಡ</div>
            </div>
          </div>
          <nav className="flex gap-1">
            {NAV.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<SubmitPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-8">
        GrievanceGPT · Built at Hackathon 2026 · Powered by AI 🤖 · English & ಕನ್ನಡ
      </footer>
    </div>
  )
}
