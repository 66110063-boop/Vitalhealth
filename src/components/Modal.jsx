import { useEffect, useState } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShow(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => setShow(false), 300) // matches transition duration
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen && !show) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-app-text/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-app-border bg-app-bg2/50">
          <h2 className="text-[1.25rem] font-bold text-green-deep font-prompt leading-none m-0">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-app-bg text-app-text3 hover:bg-red-50 hover:text-red-500 transition-colors border-none cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
