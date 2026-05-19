import { useToast } from '../context/ToastContext'

export default function Footer() {
  const { showToast } = useToast()

  const handleLinkClick = (e, label) => {
    e.preventDefault()
    showToast(`หน้า ${label} ยังไม่เปิดให้บริการ`)
  }

  return (
    <footer className="mt-5" style={{ background: '#0d6e4f', color: 'white', padding: '24px 28px' }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-5">
          {['คำถามที่พบบ่อย', 'ติดต่อเรา', 'นโยบายความเป็นส่วนตัว', 'เงื่อนไขการใช้งาน'].map(link => (
            <a key={link} href="#" onClick={(e) => handleLinkClick(e, link)} className="text-white/75 no-underline text-[0.88rem] transition-colors hover:text-white font-sarabun">
              {link}
            </a>
          ))}
        </div>
        <div className="text-[0.82rem] opacity-60 font-sarabun">© 2025 Vitalhealth · สงวนลิขสิทธิ์</div>
      </div>
    </footer>
  )
}
