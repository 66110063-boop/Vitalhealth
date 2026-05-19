import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { useHealthStore } from '../store/useHealthStore'
import PageTransition from '../components/PageTransition'

export default function SettingsPage() {
  const { showToast } = useToast()
  const { resetData, isDarkMode, toggleDarkMode, notificationSettings: notifs, updateNotificationSettings, goals, updateGoals, themeColor, setThemeColor } = useHealthStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Notification settings are now managed by Zustand store

  const handleSave = () => {
    setLoading(true)
    if (user?.email) {
      useHealthStore.getState().saveUserToCloud(user.email)
    }
    setTimeout(() => {
      showToast('บันทึกการตั้งค่าเรียบร้อยแล้ว!')
      setLoading(false)
    }, 800)
  }

  // 2. ฟังก์ชันส่งการแจ้งเตือนจริง (Actual Browser Notification)
  const sendActualNotification = (title, message) => {
    if (!("Notification" in window)) {
      showToast('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน', 'error')
      return
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico' // สามารถเปลี่ยนเป็นไอคอนของแอปได้
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico'
          })
        }
      })
    }
  }

  const toggleNotif = (key, label) => {
    const newState = !notifs[key].active
    updateNotificationSettings(key, { active: newState }, user?.email)
    
    // ถ้าผู้ใช้กด "เปิด" ให้ส่งการแจ้งเตือนจริงไปทดสอบ
    if (newState) {
      sendActualNotification(
        `เปิดการแจ้งเตือน ${label} สำเร็จ`,
        `Vitalhealth จะแจ้งเตือนคุณตามเวลาที่กำหนดไว้ครับ`
      )
      showToast(`เปิดการแจ้งเตือน ${label} แล้ว (Browser Notification)`, 'success')
    }
  }

  const updateTime = (key, time) => {
    updateNotificationSettings(key, { time }, user?.email)
  }

  const handleReset = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลสุขภาพทั้งหมดใช่หรือไม่?')) {
      resetData(user?.email)
      showToast('ล้างข้อมูลเรียบร้อยแล้ว')
    }
  }

  const Toggle = ({ active, onToggle }) => (
    <button 
      onClick={onToggle} 
      className={`w-[52px] h-[28px] rounded-full relative transition-all duration-300 focus:outline-none shadow-inner ${active ? '' : 'bg-[#e0f2f1]'}`}
      style={{ backgroundColor: active ? themeColor : undefined }}
    >
      <div className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform duration-300 ${active ? 'translate-x-[27px]' : 'translate-x-[3px]'}`} />
    </button>
  )

  const TimePicker = ({ value, onChange, label }) => (
    <div className="flex items-center gap-1.5 text-[0.75rem] text-app-text3 font-sarabun mt-1">
      <span>{label}</span>
      <input 
        type="time" 
        value={value} 
        onChange={onChange}
        onClick={(e) => {
          try {
            e.target.showPicker();
          } catch (err) {
            console.log("showPicker not supported", err);
          }
        }}
        className="px-2.5 py-1 rounded-full bg-app-bg border border-app-border hover:border-green-mid focus:border-green-mid transition-all shadow-sm font-bold text-[0.85rem] outline-none cursor-pointer"
        style={{ color: themeColor }}
      />
    </div>
  )

  return (
    <PageTransition>
    <div className="py-9">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">ตั้งค่า</h2>
        <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">ปรับแต่งหน้าตาและระบบแจ้งเตือนของคุณ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border">
            <h3 className="text-[1.05rem] font-semibold mb-6 flex items-center gap-2 font-prompt text-green-deep">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 12V4"/><path d="M12 12l4 4"/></svg>
              การแสดงผล
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[0.9rem] font-medium text-app-text font-sarabun">โหมดกลางคืน (Dark Mode)</div>
                <div className="text-[0.75rem] text-app-text3 font-sarabun mt-1">ถนอมสายตาในที่มืด</div>
              </div>
              <Toggle active={isDarkMode} onToggle={toggleDarkMode} />
            </div>
          </div>

          <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border">
            <h3 className="text-[1.05rem] font-semibold mb-6 flex items-center gap-2 font-prompt text-green-deep">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              เป้าหมายสุขภาพ
            </h3>
            <div className="space-y-5">
              {[
                { label: 'แคลอรีเผาผลาญต่อวัน', val: goals.calories, unit: 'kcal', key: 'calories' },
                { label: 'เวลานอนต่อวัน', val: goals.sleep, unit: 'ชม.', key: 'sleep' },
                { label: 'น้ำหนักเป้าหมาย', val: goals.targetWeight, unit: 'กก.', key: 'targetWeight' },
              ].map(f => (
                <div key={f.key} className="flex items-center justify-between">
                  <label className="text-[0.9rem] text-app-text2 font-sarabun">{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={f.val}
                      onChange={e => updateGoals({ [f.key]: parseFloat(e.target.value) || 0 }, user?.email)}
                      className="w-24 px-3 py-1.5 border border-app-border rounded-app-sm text-center font-sarabun text-[0.9rem] focus:border-green-mid outline-none" />
                    <span className="text-[0.85rem] text-app-text3 w-10 font-sarabun">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSave} disabled={loading}
              className="w-full mt-8 py-3.5 rounded-app-sm font-prompt font-semibold text-white text-[1rem] transition-all hover:opacity-95 shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border h-fit">
          <h3 className="text-[1.05rem] font-semibold mb-6 flex items-center gap-2 font-prompt text-green-deep border-b border-app-bg2 pb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            การแจ้งเตือน
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[0.9rem] font-medium text-app-text font-sarabun">แจ้งเตือนออกกำลังกาย</div>
                <TimePicker label="ทุกวัน" value={notifs.exercise.time} onChange={e => updateTime('exercise', e.target.value)} />
              </div>
              <Toggle active={notifs.exercise.active} onToggle={() => toggleNotif('exercise', 'ออกกำลังกาย')} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[0.9rem] font-medium text-app-text font-sarabun">แจ้งเตือนบันทึกอาหาร</div>
                <TimePicker label="ทุกวัน" value={notifs.food.time} onChange={e => updateTime('food', e.target.value)} />
              </div>
              <Toggle active={notifs.food.active} onToggle={() => toggleNotif('food', 'บันทึกอาหาร')} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[0.9rem] font-medium text-app-text font-sarabun">แจ้งเตือนเวลานอน</div>
                <TimePicker label="ทุกคืน" value={notifs.sleep.time} onChange={e => updateTime('sleep', e.target.value)} />
              </div>
              <Toggle active={notifs.sleep.active} onToggle={() => toggleNotif('sleep', 'เวลานอน')} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[0.9rem] font-medium text-app-text font-sarabun">แจ้งเตือนดื่มน้ำ</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[0.75rem] text-app-text3 font-sarabun">ทุกๆ:</span>
                  <select value={notifs.water.interval} onChange={e => updateNotificationSettings('water', { interval: e.target.value }, user?.email)}
                    className="bg-app-bg border border-app-border rounded-full px-2 py-0.5 text-[0.8rem] font-bold outline-none cursor-pointer" style={{ color: themeColor }}>
                    <option value="1">1 ชั่วโมง</option>
                    <option value="2">2 ชั่วโมง</option>
                    <option value="3">3 ชั่วโมง</option>
                  </select>
                </div>
              </div>
              <Toggle active={notifs.water.active} onToggle={() => toggleNotif('water', 'ดื่มน้ำ')} />
            </div>

            <div className="pt-6 border-t border-app-bg2 space-y-4">
              <div className="flex justify-between items-center">
                <button onClick={handleReset} className="text-red-500 text-[0.8rem] font-sarabun hover:underline opacity-70 hover:opacity-100 transition-opacity">ล้างข้อมูลสุขภาพทั้งหมด</button>
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem] text-app-text3 font-sarabun">แจ้งเตือนเมล:</span>
                  <button onClick={() => toggleNotif('emailAlert', 'อีเมล')} className={`w-7 h-3.5 rounded-full relative transition-colors ${notifs.emailAlert.active ? '' : 'bg-gray-200'}`} style={{ backgroundColor: notifs.emailAlert.active ? themeColor : undefined }}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${notifs.emailAlert.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              
              {notifs.emailAlert.active && (
                <div className="p-3 bg-app-bg rounded-lg border border-app-border text-[0.8rem] text-app-text2 font-sarabun space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span>อีเมลปลายทางที่จะส่ง:</span>
                    <strong className="text-green-deep font-semibold break-all">{user?.email || 'ไม่พบอีเมล'}</strong>
                  </div>
                  {!user?.email?.includes('@') ? (
                    <div className="text-[0.7rem] text-red-500 mt-1">
                      *โปรดล็อกอินด้วยอีเมลจริงเพื่อใช้แจ้งเตือนเมล
                    </div>
                  ) : (
                    <div className="text-[0.7rem] text-app-text3 mt-1">
                      *ระบบจะส่งแจ้งเตือนไปยังอีเมลหลักที่ใช้ลงชื่อเข้าใช้งานแอปโดยอัตโนมัติ
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
    </PageTransition>
  )
}
