import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    setTimeout(() => {
      const res = register(name.trim(), email.trim(), password)
      if (res.success) {
        showToast('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!')
        navigate('/')
      } else {
        setError(res.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen login-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-80 h-80 rounded-full bg-white/8 pointer-events-none" />
      <div className="absolute top-1/2 left-[-120px] w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-app-lg border border-white/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold font-prompt tracking-wide">Vitalhealth</h1>
          <p className="text-white/70 text-sm font-sarabun mt-1">ดูแลสุขภาพทุกวันกับเรา</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-app-card rounded-app shadow-app-lg overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-green-deep to-green-mid px-8 py-6">
          <h2 className="text-white text-xl font-bold font-prompt">สมัครสมาชิก</h2>
          <p className="text-white/75 text-sm font-sarabun mt-1">เข้าร่วมครอบครัวรักสุขภาพกับเราวันนี้</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-app-text2 mb-2 font-sarabun">
              ชื่อแสดงในระบบ
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="ชื่อของคุณ (เช่น สมชาย ดีใจ)"
                className="w-full pl-10 pr-4 py-3 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-all focus:border-green-mid focus:bg-app-card placeholder:text-app-text3/60"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-app-text2 mb-2 font-sarabun">
              อีเมล
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full pl-10 pr-4 py-3 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-all focus:border-green-mid focus:bg-app-card placeholder:text-app-text3/60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-app-text2 mb-2 font-sarabun">
              รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="กรอกรหัสผ่าน"
                className="w-full pl-10 pr-12 py-3 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-all focus:border-green-mid focus:bg-app-card placeholder:text-app-text3/60"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text3 hover:text-green-mid transition-colors flex items-center justify-center"
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 3.62 3.62"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><path d="m2 2 20 20"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-app-text2 mb-2 font-sarabun">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className="w-full pl-10 pr-12 py-3 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-all focus:border-green-mid focus:bg-app-card placeholder:text-app-text3/60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text3 hover:text-green-mid transition-colors flex items-center justify-center"
              >
                {showConfirmPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 3.62 3.62"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><path d="m2 2 20 20"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-app-sm text-red-600 text-sm font-sarabun animate-shake">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-app-sm font-prompt font-semibold text-white text-[1rem] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #16a97a, #0891b2)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสมัครสมาชิก...
              </span>
            ) : 'สมัครสมาชิก'}
          </button>

          {/* Login link */}
          <p className="text-center text-sm text-app-text3 font-sarabun">
            มีบัญชีผู้ใช้อยู่แล้ว?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-green-mid hover:text-green-deep font-medium transition-colors">
              เข้าสู่ระบบที่นี่
            </button>
          </p>
        </form>
      </div>

      <p className="mt-6 text-white/50 text-xs font-sarabun">© 2025 Vitalhealth · สงวนลิขสิทธิ์</p>
    </div>
  )
}
