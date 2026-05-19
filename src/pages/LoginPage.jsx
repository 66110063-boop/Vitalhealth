import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

export default function LoginPage({ onSuccess }) {
  const { login, loginWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(username.trim(), password)
      if (ok) {
        showToast('เข้าสู่ระบบสำเร็จ!')
        onSuccess()
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      }
      setLoading(false)
    }, 600)
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        // Fetch user info from Google API using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const data = await res.json()
        
        // ส่งข้อมูลเข้า AuthContext พร้อม Access Token
        loginWithGoogle(data, tokenResponse.access_token)
        showToast('เข้าสู่ระบบด้วย Google สำเร็จ!')
        onSuccess()
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการดึงข้อมูล Google')
      } finally {
        setLoading(false)
      }
    },
    onError: () => showToast('การเข้าสู่ระบบด้วย Google ล้มเหลว'),
  })

  const handleAction = (label) => {
    showToast(`ฟีเจอร์ ${label} ยังไม่เปิดให้บริการ`)
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
      <div className="w-full max-w-md bg-white rounded-app shadow-app-lg overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-green-deep to-green-mid px-8 py-6">
          <h2 className="text-white text-xl font-bold font-prompt">เข้าสู่ระบบ</h2>
          <p className="text-white/75 text-sm font-sarabun mt-1">ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {/* Username or Email */}
          <div>
            <label className="block text-sm font-medium text-app-text2 mb-2 font-sarabun">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-all focus:border-green-mid focus:bg-white placeholder:text-app-text3/60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-app-text2 mb-2 font-sarabun">
              รหัสผ่าน
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
                placeholder="กรอกรหัสผ่าน (1234)"
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-all focus:border-green-mid focus:bg-white placeholder:text-app-text3/60"
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

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between text-sm font-sarabun">
            <label className="flex items-center gap-2 text-app-text2 cursor-pointer group">
              <input type="checkbox" className="rounded border-app-border text-green-mid focus:ring-green-mid/20" />
              <span className="group-hover:text-green-deep transition-colors">จดจำฉัน</span>
            </label>
            <button type="button" onClick={() => handleAction('ลืมรหัสผ่าน')} className="text-green-mid hover:text-green-deep transition-colors font-medium">
              ลืมรหัสผ่าน?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-app-sm text-red-600 text-sm font-sarabun animate-shake">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Hint */}
          <div className="p-3 bg-green-pale rounded-app-sm border border-app-border text-xs text-app-text2 font-sarabun flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-green-deep"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            <div>สำหรับทดสอบ: ชื่อผู้ใช้ <strong>user</strong> รหัสผ่าน <strong>1234</strong></div>
          </div>

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
                กำลังเข้าสู่ระบบ...
              </span>
            ) : 'เข้าสู่ระบบ'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-app-text3 font-sarabun">
            <div className="flex-1 h-px bg-app-border" />
            หรือเข้าสู่ระบบด้วย
            <div className="flex-1 h-px bg-app-border" />
          </div>

          {/* Social buttons (UI only) */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-app-border rounded-app-sm text-sm text-app-text2 font-sarabun hover:bg-app-bg2 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/><path d="M12 7v5l3 3"/></svg>
              Google
            </button>
            <button type="button" onClick={() => handleAction('Facebook')} className="flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-app-border rounded-app-sm text-sm text-app-text2 font-sarabun hover:bg-app-bg2 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Facebook
            </button>
          </div>

          <p className="text-center text-sm text-app-text3 font-sarabun">
            ยังไม่มีบัญชี?{' '}
            <button type="button" onClick={() => navigate('/register')} className="text-green-mid hover:text-green-deep font-medium transition-colors">
              สมัครสมาชิกฟรี
            </button>
          </p>
        </form>
      </div>

      <p className="mt-6 text-white/50 text-xs font-sarabun">© 2025 Vitalhealth · สงวนลิขสิทธิ์</p>
    </div>
  )
}
