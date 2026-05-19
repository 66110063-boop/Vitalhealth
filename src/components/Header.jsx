import { NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const navItems = [
  { id: 'home', label: 'หน้าหลัก', path: '/', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'exercise', label: 'ออกกำลัง', path: '/exercise', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 .5-1.5"/><path d="M14 18l.5-1.5"/><path d="M18 14l.5-1.5"/><path d="m22 18-1.5.5"/><path d="m18 14-1.5.5"/><path d="m14 10-1.5.5"/><path d="M2 6l1.5-.5"/><path d="M6 10l1.5-.5"/><path d="M10 14l1.5-.5"/><path d="m6 2-.5 1.5"/><path d="m10 6-.5 1.5"/><path d="m14 10-.5 1.5"/></svg> },
  { id: 'food', label: 'อาหาร', path: '/food', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v11"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg> },
  { id: 'sleep', label: 'นอนหลับ', path: '/sleep', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> },
  { id: 'tips', label: 'เคล็ดลับ', path: '/tips', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { id: 'settings', label: 'ตั้งค่า', path: '/settings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
]

function MobileNavItem({ item }) {
  const location = useLocation()
  const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)

  return (
    <Link
      to={item.path}
      className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative no-underline ${
        isActive ? 'text-green-deep' : 'text-app-text3'
      }`}
    >
      {isActive && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-green-deep rounded-b-full" />
      )}
      <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
        {item.icon}
      </span>
      <span className={`text-[10px] font-sarabun leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
        {item.label}
      </span>
    </Link>
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const handleLogout = () => {
    logout()
    showToast('ออกจากระบบแล้ว')
  }

  return (
    <>
      <header className="bg-app-bg/80 backdrop-blur-md border-b border-app-border sticky top-0 z-50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[76px]">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 no-underline cursor-pointer group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0d6e4f, #16a97a)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-[1.4rem] font-black text-green-deep font-prompt leading-none tracking-tight">Vitalhealth</span>
              <span className="text-[0.65rem] font-bold text-app-text3 font-sarabun uppercase tracking-[0.2em] ml-0.5">Health Tracker</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-app-bg2 p-1.5 rounded-[14px] border border-app-border">
            {navItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `px-5 py-2.5 rounded-xl font-sarabun text-[0.95rem] font-medium transition-all duration-300 border-none cursor-pointer ${
                  isActive
                    ? 'bg-app-bg text-green-deep font-bold shadow-md scale-105'
                    : 'bg-transparent text-app-text2 hover:text-green-deep hover:bg-app-bg/60'
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-1.5 py-1.5 pr-4 bg-white rounded-full border border-app-border hover:border-green-mid transition-all shadow-sm group cursor-pointer no-underline"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-pale">
                    <img
                      src={user.avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[0.85rem] font-bold text-green-deep font-sarabun leading-none mb-0.5">{user.name || user.username}</span>
                    <span className="text-[0.65rem] text-app-text3 font-sarabun leading-none">View Profile</span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full text-app-text3 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100 cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-app-bg/95 backdrop-blur-xl border-t border-app-border z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <nav className="flex justify-around items-center h-[60px]">
            {navItems.map(item => (
              <MobileNavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
