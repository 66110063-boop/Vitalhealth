import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useHealthStore } from '../store/useHealthStore'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'

const tips = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>, title: 'ปรับอุณหภูมิห้อง', desc: 'ห้องที่เย็นประมาณ 18-22°C ช่วยให้นอนหลับได้ดีขึ้น' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>, title: 'งดหน้าจอก่อนนอน', desc: 'หลีกเลี่ยงการใช้โทรศัพท์อย่างน้อย 30 นาทีก่อนนอน' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>, title: 'ลดคาเฟอีน', desc: 'ไม่ควรดื่มกาแฟหลัง 14:00 น. เพื่อการนอนที่ดีขึ้น' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 9.5a14 14 0 1 0 11 0"/></svg>, title: 'ผ่อนคลายก่อนนอน', desc: 'ลองทำสมาธิหรือยืดเส้นเบาๆ 10 นาทีก่อนนอน' },
]

export default function SleepPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { logs, addLog } = useHealthStore()
  const [sleepStart, setSleepStart] = useState('22:30')
  const [sleepEnd, setSleepEnd] = useState('06:00')
  const [hours, setHours] = useState('7.5')
  const [stars, setStars] = useState(4)
  const [loading, setLoading] = useState(false)

  const calcSleep = (s, e) => {
    if (!s || !e) return
    const [sh, sm] = s.split(':').map(Number)
    const [eh, em] = e.split(':').map(Number)
    let mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins < 0) mins += 24 * 60
    setHours((mins / 60).toFixed(1))
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      addLog({
        type: 'sleep',
        value: parseFloat(hours),
        label: `นอน ${hours} ชม. (คุณภาพ ${stars}/5)`
      }, user?.email)
      showToast('บันทึกการนอนสำเร็จ!')
      setLoading(false)
    }, 800)
  }

  const pct = Math.min((parseFloat(hours) / 8) * 100, 100)
  const circumference = 2 * Math.PI * 58
  const offset = circumference - (pct / 100) * circumference

  const starLabels = ['', 'แย่', 'พอใช้', 'ปานกลาง', 'ดี', 'ยอดเยี่ยม']

  const recentSleep = logs.filter(log => log.type === 'sleep').slice(0, 3)

  return (
    <PageTransition>
    <div className="py-9">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">บันทึกการนอนหลับ</h2>
        <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">ติดตามคุณภาพการนอนเพื่อพลังงานที่ดีขึ้น</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border">
          <h3 className="text-[1.05rem] font-semibold mb-5 flex items-center gap-2 font-prompt text-green-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            บันทึกการนอน
          </h3>
          {/* Ring */}
          <div className="text-center py-5">
            <div className="w-[140px] h-[140px] mx-auto mb-4 relative">
              <svg width="140" height="140" viewBox="0 0 140 140" className="sleep-ring-svg">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#e6f7f0" strokeWidth="14"/>
                <circle cx="70" cy="70" r="58" fill="none" stroke="url(#sleepGrad)" strokeWidth="14"
                  strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
                <defs>
                  <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0891b2"/>
                    <stop offset="100%" stopColor="#16a97a"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.6rem] font-bold text-green-deep font-prompt">{hours}</span>
                <span className="text-[0.75rem] text-app-text3 font-sarabun">ชั่วโมง</span>
              </div>
            </div>
            <div className="text-[0.85rem] text-app-text3 font-sarabun">เป้าหมาย: 8 ชั่วโมง</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-[18px]">
            {[
              { label: 'เวลานอน', val: sleepStart, set: v => { setSleepStart(v); calcSleep(v, sleepEnd) } },
              { label: 'เวลาตื่น', val: sleepEnd, set: v => { setSleepEnd(v); calcSleep(sleepStart, v) } },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">{f.label}</label>
                <input type="time" value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none focus:border-green-mid focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>
          <div className="mb-[18px]">
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1 text-center font-sarabun">คุณภาพการนอน</label>
            <p className="text-[0.72rem] text-app-text3 text-center mb-3 font-sarabun">ประเมินจากความรู้สึกของคุณเมื่อตื่นนอน</p>
            <div className="flex gap-2 justify-center mb-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setStars(n)}
                  className={`text-[1.8rem] bg-transparent border-none cursor-pointer transition-all duration-150 select-none ${n <= stars ? 'scale-110 text-yellow-400 drop-shadow-sm' : 'text-gray-200 grayscale'}`}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={n <= stars ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              ))}
            </div>
            <div className="text-center text-[0.85rem] font-bold text-green-deep font-sarabun">{starLabels[stars]}</div>
            <div className="text-center text-[0.78rem] text-app-text3 mt-1.5 px-3 font-sarabun leading-relaxed min-h-[36px]">
              {[
                '',
                '💤 รู้สึกอ่อนเพลียมาก นอนไม่หลับ ตื่นกลางดึกบ่อย',
                '🥱 หลับ ๆ ตื่น ๆ รู้สึกตัวบ่อย ตื่นมายังเพลียอยู่บ้าง',
                '😐 หลับได้ปานกลาง ตื่นตามเวลา รู้สึกกึ่งสดชื่นกึ่งอ่อนล้า',
                '😊 หลับสนิทเกือบตลอดคืน ตื่นมารู้สึกสดชื่น มีพลังงาน',
                '✨ หลับสนิทลึกรวดเดียว ตื่นเช้ามาสดชื่นกระปรี้กระเปร่าที่สุด!'
              ][stars]}
            </div>
          </div>
          <button onClick={handleSave} disabled={loading}
            className="w-full py-3 rounded-app-sm font-prompt font-semibold text-white text-[1rem] border-none cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px shadow-md disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #16a97a, #0891b2)' }}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกการนอน'}
          </button>
        </div>
        <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border">
          <h3 className="text-[1.05rem] font-semibold mb-5 flex items-center gap-2 font-prompt text-green-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            คำแนะนำการนอน
          </h3>
          
          <div className="mb-6">
            <div className="text-[0.85rem] text-app-text3 mb-2.5 font-sarabun">บันทึกล่าสุด</div>
            {recentSleep.length > 0 ? (
              <div className="space-y-2">
                {recentSleep.map(sl => (
                  <div key={sl.id} className="flex justify-between items-center p-3 bg-app-bg2 rounded-app-sm border border-app-border">
                    <span className="text-[0.9rem] font-medium text-app-text font-sarabun">{sl.label}</span>
                    <span className="text-[0.8rem] text-app-text3 font-sarabun">{new Date(sl.date).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[0.85rem] text-app-text3 bg-app-bg2 rounded-app-sm border border-dashed border-app-border">
                ยังไม่มีข้อมูลการนอน
              </div>
            )}
          </div>

          <ul className="list-none p-0 m-0">
            {tips.map((t, i) => (
              <li key={i} className={`flex items-start gap-3.5 py-4 text-[0.9rem] font-sarabun ${i < tips.length - 1 ? 'border-b border-app-bg2' : ''}`}>
                <div className="text-green-mid flex-shrink-0 mt-1">{t.icon}</div>
                <div>
                  <strong className="text-app-text font-semibold">{t.title}</strong>
                  <div className="text-app-text3 text-[0.85rem] mt-0.5 leading-relaxed">{t.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
