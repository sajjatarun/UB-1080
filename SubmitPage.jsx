import { useState } from 'react'
import { submitComplaint } from '../api.js'

const URGENCY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
}

const CATEGORY_ICONS = {
  'Roads & Infrastructure': '🛣️',
  'Water Supply': '💧',
  'Electricity': '⚡',
  'Sanitation & Waste': '🗑️',
  'Noise Pollution': '🔊',
  'Parks & Recreation': '🌳',
  'Public Transport': '🚌',
  'Other': '📋',
}

const LANG_EXAMPLES = {
  english: {
    label: '🇬🇧 English',
    placeholder: 'Describe the issue in detail. E.g., There is a large pothole on MG Road near the bus stop that has caused accidents...',
    namePlaceholder: 'Rajesh Kumar',
    locationPlaceholder: 'MG Road, Indiranagar, Bengaluru',
  },
  kannada: {
    label: '🇮🇳 ಕನ್ನಡ',
    placeholder: 'ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ತಿಳಿಸಿ. ಉದಾ: ನಮ್ಮ ಬಡಾವಣೆಯಲ್ಲಿ 3 ದಿನಗಳಿಂದ ನೀರು ಬರುತ್ತಿಲ್ಲ...',
    namePlaceholder: 'ರಾಜೇಶ್ ಕುಮಾರ್',
    locationPlaceholder: 'ಎಂಜಿ ರೋಡ್, ಬೆಂಗಳೂರು',
  },
}

export default function SubmitPage() {
  const [form, setForm] = useState({ citizen_name: '', citizen_phone: '', complaint_text: '', location: '' })
  const [lang, setLang] = useState('english')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const ex = LANG_EXAMPLES[lang]

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.citizen_name.trim() || !form.complaint_text.trim()) {
      setError(lang === 'kannada' ? 'ಹೆಸರು ಮತ್ತು ದೂರು ಅಗತ್ಯ.' : 'Name and complaint text are required.')
      return
    }
    if (form.citizen_phone && form.citizen_phone.replace(/\D/g, '').length !== 10) {
      setError(lang === 'kannada' ? 'ದಯವಿಟ್ಟು 10 ಅಂಕಿಯ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ.' : 'Please enter a valid 10-digit phone number.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await submitComplaint(form)
      setResult(res.data)
      setForm({ citizen_name: '', citizen_phone: '', complaint_text: '', location: '' })
      setPhoto(null)
      setPhotoPreview(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-blue-200">
          🏛️ Citizen Grievance Portal · ನಾಗರಿಕ ದೂರು ಕೇಂದ್ರ
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          {lang === 'kannada' ? 'ದೂರು ದಾಖಲಿಸಿ' : 'File a Complaint'}
        </h1>
        <p className="text-slate-500 text-sm">
          {lang === 'kannada'
            ? 'ನಿಮ್ಮ ದೂರನ್ನು AI ವರ್ಗೀಕರಿಸಿ ಸಂಬಂಧಿತ ವಿಭಾಗಕ್ಕೆ ಕಳುಹಿಸುತ್ತದೆ.'
            : 'Your complaint will be classified by AI and routed to the right department instantly.'}
        </p>
      </div>

      {/* Language Toggle */}
      <div className="flex gap-2 mb-4 justify-center">
        {Object.entries(LANG_EXAMPLES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              lang === key
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Kannada Sample Complaints */}
      {lang === 'kannada' && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
          <div className="text-xs font-bold text-orange-700 mb-2">ಉದಾಹರಣೆ ದೂರುಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):</div>
          <div className="flex flex-col gap-1.5">
            {[
              'ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ. ಎರಡು ದ್ವಿಚಕ್ರ ವಾಹನಗಳು ಬಿದ್ದಿವೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ರಿಪೇರಿ ಮಾಡಿ.',
              'ಕಳೆದ 3 ದಿನಗಳಿಂದ ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು ಬರುತ್ತಿಲ್ಲ. ನಾಗರಿಕರು ತೊಂದರೆ ಅನುಭವಿಸುತ್ತಿದ್ದಾರೆ.',
              'ನಮ್ಮ ಬೀದಿಯ ದೀಪಗಳು ಒಂದು ವಾರದಿಂದ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ. ರಾತ್ರಿ ತುಂಬಾ ಅಪಾಯಕಾರಿ.',
            ].map((sample, i) => (
              <button
                key={i}
                onClick={() => setForm(f => ({ ...f, complaint_text: sample }))}
                className="text-left text-xs bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-orange-100 transition-all"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <div className="font-bold text-green-800 text-lg mb-1">
                {result.detected_language === 'kannada' ? 'ದೂರು ನೋಂದಾಯಿಸಲಾಗಿದೆ!' : 'Complaint Registered!'}
              </div>
              <div className="font-mono text-sm bg-white border border-green-200 rounded-lg px-3 py-1.5 inline-block text-green-700 font-bold mb-3">
                Ticket ID: {result.ticket_id}
              </div>
              {result.detected_language === 'kannada' && (
                <div className="mb-2 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold border border-orange-300 ml-2">
                  🇮🇳 ಕನ್ನಡ ಗುರುತಿಸಲಾಗಿದೆ
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="bg-white rounded-lg p-2.5 border border-green-200">
                  <div className="text-xs text-slate-400 mb-0.5">Category</div>
                  <div className="font-semibold">{CATEGORY_ICONS[result.category] || '📋'} {result.category}</div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-green-200">
                  <div className="text-xs text-slate-400 mb-0.5">Routed To</div>
                  <div className="font-semibold text-xs">{result.department}</div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${URGENCY_COLORS[result.urgency] || ''} mb-3`}>
                Priority: {result.urgency?.toUpperCase()}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <span className="font-semibold">
                  {result.detected_language === 'kannada' ? 'ಸ್ವಯಂ ಉತ್ತರ: ' : 'Auto-Reply: '}
                </span>
                {result.auto_reply}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Save your Ticket ID to track status → <strong>Track Status</strong> tab.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {lang === 'kannada' ? 'ಪೂರ್ಣ ಹೆಸರು *' : 'Full Name *'}
            </label>
            <input
              type="text"
              placeholder={ex.namePlaceholder}
              value={form.citizen_name}
              onChange={e => setForm({ ...form, citizen_name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {lang === 'kannada' ? 'ಫೋನ್ ನಂಬರ್' : 'Phone Number'}
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              value={form.citizen_phone}
              maxLength={10}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                setForm({ ...form, citizen_phone: val })
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs mt-1 text-right" style={{ color: form.citizen_phone.length === 10 ? '#10b981' : '#94a3b8' }}>
              {form.citizen_phone.length}/10 digits
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {lang === 'kannada' ? 'ಸ್ಥಳ' : 'Location'}
          </label>
          <input
            type="text"
            placeholder={ex.locationPlaceholder}
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {lang === 'kannada' ? '📷 ಜಿಯೋಟ್ಯಾಗ್ ಫೋಟೋ' : '📷 Geotagged Photo'}
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400 transition-all">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="photo-upload"
              className="hidden"
              onChange={handlePhoto}
            />
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="complaint"
                  className="w-full max-h-48 object-cover rounded-lg mb-2"
                />
                <div className="text-xs text-slate-500 mb-2">📍 Location will be tagged from your device</div>
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  ✕ Remove Photo
                </button>
              </div>
            ) : (
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm font-semibold text-slate-600 mb-1">
                  {lang === 'kannada' ? 'ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್ಲೋಡ್ ಮಾಡಿ' : 'Take Photo or Upload'}
                </div>
                <div className="text-xs text-slate-400">
                  {lang === 'kannada' ? 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to open camera · GPS location auto-tagged'}
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Complaint Text */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {lang === 'kannada' ? 'ದೂರು ವಿವರಿಸಿ *' : 'Describe Your Complaint *'}
          </label>
          <textarea
            rows={5}
            placeholder={ex.placeholder}
            value={form.complaint_text}
            onChange={e => setForm({ ...form, complaint_text: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="text-xs text-slate-400 mt-1">{form.complaint_text.length} characters · Min 10</div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2.5 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {lang === 'kannada' ? 'AI ವರ್ಗೀಕರಿಸುತ್ತಿದೆ...' : 'AI is classifying your complaint...'}
            </>
          ) : (lang === 'kannada' ? '🚀 ದೂರು ಸಲ್ಲಿಸಿ' : '🚀 Submit Complaint')}
        </button>
      </form>

      {/* Categories Info */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
          {lang === 'kannada' ? 'ನಾವು ಈ ದೂರುಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೇವೆ' : 'We handle complaints about'}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(CATEGORY_ICONS).slice(0, -1).map(([cat, icon]) => (
            <div key={cat} className="text-center p-2 bg-slate-50 rounded-lg">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs text-slate-600 font-medium leading-tight">{cat}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}