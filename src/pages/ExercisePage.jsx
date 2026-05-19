import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useHealthStore } from '../store/useHealthStore'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'

const calMap = { run: 9, swim: 7, cycle: 6, yoga: 3, gym: 5, walk: 3.5 }

export default function ExercisePage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { logs, addLog, caloriesBurned } = useHealthStore()
  const [exType, setExType] = useState('')
  const [exStart, setExStart] = useState('06:30')
  const [exEnd, setExEnd] = useState('07:15')
  const [calories, setCalories] = useState(245)
  const [loading, setLoading] = useState(false)

  const calcCalories = (type, start, end) => {
    if (!type || !start || !end) return
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    let mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins < 0) mins += 24 * 60
    setCalories(Math.round(mins * (calMap[type] || 5)))
  }

  const handleSave = () => {
    if (!exType) {
      showToast('กรุณาเลือกประเภทการออกกำลังกาย')
      return
    }
    setLoading(true)
    setTimeout(() => {
      addLog({
        type: 'exercise',
        value: calories,
        label: `${exType.toUpperCase()} (${calories} kcal)`
      }, user?.email)
      showToast('บันทึกการออกกำลังกายสำเร็จ!')
      setLoading(false)
    }, 800)
  }

  const bars = [
    { day: 'จ', h: 60, color: 'linear-gradient(180deg,#22d6a0,#16a97a)' },
    { day: 'อ', h: 80, color: 'linear-gradient(180deg,#22d6a0,#16a97a)' },
    { day: 'พ', h: 45, color: 'linear-gradient(180deg,#67e8f9,#0891b2)' },
    { day: 'พฤ', h: 90, color: 'linear-gradient(180deg,#22d6a0,#16a97a)' },
    { day: 'ศ', h: 30, color: 'linear-gradient(180deg,#ffd166,#ff6b6b)' },
    { day: 'ส', h: 70, color: 'linear-gradient(180deg,#22d6a0,#16a97a)' },
    { day: 'อา', h: 55, color: 'linear-gradient(180deg,#22d6a0,#16a97a)', opacity: 0.5 },
  ]

  const recentExercises = logs.filter(log => log.type === 'exercise').slice(0, 3)

  return (
    <PageTransition>
    <div className="py-9">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">บันทึกการออกกำลังกาย</h2>
        <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">ติดตามกิจกรรมและแคลอรีที่เผาผลาญแต่ละวัน</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card */}
        <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border">
          <h3 className="text-[1.05rem] font-semibold mb-5 flex items-center gap-2 font-prompt text-green-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
            บันทึกกิจกรรม
          </h3>
          <div className="mb-[18px]">
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ประเภทการออกกำลังกาย</label>
            <select
              className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:border-green-mid focus:bg-white cursor-pointer"
              value={exType}
              onChange={e => { setExType(e.target.value); calcCalories(e.target.value, exStart, exEnd) }}
            >
              <option value="">— เลือกประเภท —</option>
              <option value="run">วิ่ง</option>
              <option value="swim">ว่ายน้ำ</option>
              <option value="cycle">ปั่นจักรยาน</option>
              <option value="yoga">โยคะ</option>
              <option value="gym">ยกน้ำหนัก</option>
              <option value="walk">เดิน</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-[18px]">
            {[
              { label: 'เวลาเริ่มต้น', val: exStart, set: v => { setExStart(v); calcCalories(exType, v, exEnd) }, id: 'ex-start' },
              { label: 'เวลาสิ้นสุด', val: exEnd, set: v => { setExEnd(v); calcCalories(exType, exStart, v) }, id: 'ex-end' },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">{f.label}</label>
                <input type="time" value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:border-green-mid focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>
          <div className="bg-green-pale rounded-app-sm p-4 text-center mb-[18px] border-[1.5px] border-app-border">
            <div className="text-[2rem] font-bold text-green-deep font-prompt">{calories}</div>
            <div className="text-[0.82rem] text-app-text3 font-sarabun">แคลอรีที่เผาผลาญ (kcal) — คำนวณอัตโนมัติ</div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-app-sm font-prompt font-semibold text-white text-[1rem] border-none cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-md disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, var(--color-green-mid), var(--color-green-deep))' }}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกการออกกำลังกาย'}
          </button>
        </div>

        {/* Right card - chart */}
        <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border">
          <h3 className="text-[1.05rem] font-semibold mb-5 flex items-center gap-2 font-prompt text-green-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            ประวัติและสถิติ
          </h3>
          
          {/* History List */}
          <div className="mb-6">
            <div className="text-[0.85rem] text-app-text3 mb-2.5 font-sarabun">กิจกรรมล่าสุด</div>
            {recentExercises.length > 0 ? (
              <div className="space-y-2">
                {recentExercises.map(ex => (
                  <div key={ex.id} className="flex justify-between items-center p-3 bg-app-bg2 rounded-app-sm border border-app-border">
                    <span className="text-[0.9rem] font-medium text-app-text font-sarabun">{ex.label}</span>
                    <span className="text-[0.8rem] text-app-text3 font-sarabun">{new Date(ex.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[0.85rem] text-app-text3 bg-app-bg2 rounded-app-sm border border-dashed border-app-border">
                ยังไม่มีข้อมูลการออกกำลังกาย
              </div>
            )}
          </div>

          <div className="flex items-end gap-2.5 h-[100px] px-1 mb-4">
            {bars.map((b, i) => (
              <div key={i} className="bar-item flex-1">
                <div className="bar transition-all duration-500" style={{ height: `${b.h}%`, background: b.color, opacity: b.opacity || 1 }} />
                <span className="text-[0.72rem] text-app-text3 font-sarabun">{b.day}</span>
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-app-bg2 rounded-app-sm">
            <div className="text-[0.85rem] text-app-text3 mb-2 font-sarabun">สรุปสัปดาห์นี้</div>
            <div className="flex gap-5 font-prompt">
              {[{ v: '5', u: 'วัน' }, { v: caloriesBurned.toLocaleString(), u: 'kcal' }, { v: '4.5', u: 'ชม.' }].map((s, i) => (
                <div key={i}>
                  <span className="text-[1.2rem] font-bold text-green-deep">{s.v}</span>{' '}
                  <span className="text-[0.8rem] text-app-text3 font-sarabun">{s.u}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
