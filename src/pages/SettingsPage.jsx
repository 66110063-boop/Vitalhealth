import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { useHealthStore } from '../store/useHealthStore'
import PageTransition from '../components/PageTransition'

export default function SettingsPage() {
  const { showToast } = useToast()
  const { resetData, isDarkMode, toggleDarkMode, notificationSettings: notifs, updateNotificationSettings, goals, updateGoals, themeColor, setThemeColor, physicalProfile } = useHealthStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState('')
  const [aiExplanation, setAiExplanation] = useState('')

  // สังเคราะห์เสียงด้วย Web Audio API ตอนเริ่มวิเคราะห์
  const playWarmUpSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  // สังเคราะห์เสียงด้วย Web Audio API เมื่อประมวลผลแนะนำเป้าหมาย AI สำเร็จ
  const playSuccessSparkleSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (major arpeggio)
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const startTime = now + (index * 0.08);
        const duration = 0.45;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  const handleAIRecommend = async () => {
    if (!physicalProfile || !physicalProfile.weight || !physicalProfile.height) {
      showToast('กรุณากรอกข้อมูลส่วนตัวในหน้าโปรไฟล์ก่อนเพื่อรับคำแนะนำ', 'error');
      return;
    }

    setAiLoading(true);
    setAiExplanation('');
    playWarmUpSound();

    const statusUpdates = [
      'กำลังตรวจสอบข้อมูลร่างกาย...',
      'กำลังประเมินค่า BMR และ TDEE...',
      'กำลังหาช่วงน้ำหนักตามเกณฑ์ดัชนีมวลกายเอเชีย...',
      'กำลังเรียบเรียงแผนแนะนำเป้าหมายสุขภาพ...'
    ];

    let step = 0;
    setAiStatus(statusUpdates[0]);
    const statusInterval = setInterval(() => {
      if (step < statusUpdates.length - 1) {
        step++;
        setAiStatus(statusUpdates[step]);
      }
    }, 1200);

    try {
      const response = await fetch('/api/recommend-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physicalProfile })
      });

      clearInterval(statusInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถรับข้อมูลแนะนำเป้าหมายได้');
      }

      const data = await response.json();
      
      // อัปเดตเป้าหมายใน Zustand Store
      updateGoals({
        calories: Number(data.calories) || goals.calories,
        sleep: Number(data.sleep) || goals.sleep,
        targetWeight: Number(data.targetWeight) || goals.targetWeight
      }, user?.email);

      setAiExplanation(data.explanation);
      playSuccessSparkleSound();
      showToast('คำนวณและปรับเปลี่ยนเป้าหมายสุขภาพเรียบร้อยแล้ว!', 'success');

    } catch (err) {
      clearInterval(statusInterval);
      showToast(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI', 'error');
    } finally {
      setAiLoading(false);
      setAiStatus('');
    }
  };

  // เรนเดอร์คำอธิบายที่ได้จาก AI รองรับ Bold Markdown **
  const renderExplanation = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/\*\*(.*?)\*\//g);
      return (
        <div key={idx} className="mb-1 text-[0.82rem] leading-relaxed">
          {parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return <strong key={pIdx} className="font-bold text-green-deep dark:text-[#52d3a2]">{part}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

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

          <div className="bg-white rounded-app p-7 shadow-app border-[1.5px] border-app-border relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-app-bg2 pb-4">
              <h3 className="text-[1.05rem] font-semibold flex items-center gap-2 font-prompt text-green-deep">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                เป้าหมายสุขภาพ
              </h3>
              <button
                onClick={handleAIRecommend}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.8rem] font-prompt font-semibold text-white transition-all shadow-sm hover:opacity-90 disabled:opacity-50 active:scale-95 cursor-pointer"
                style={{ backgroundColor: themeColor }}
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{aiStatus || 'กำลังวิเคราะห์...'}</span>
                  </>
                ) : (
                  <>
                    <span>🤖 แนะนำโดย AI</span>
                  </>
                )}
              </button>
            </div>

            {aiExplanation && (
              <div className="mb-6 p-4 bg-[#f0faf7] dark:bg-[#0a2018] border border-green-mid/30 dark:border-green-mid/10 rounded-app shadow-sm relative transition-all duration-500 ease-in-out">
                <button 
                  onClick={() => setAiExplanation('')}
                  className="absolute top-2.5 right-3 text-app-text3 hover:text-red-500 transition-colors text-[0.95rem] font-bold p-1 cursor-pointer"
                  title="ปิด"
                >
                  ✕
                </button>
                <div className="flex items-start gap-2.5">
                  <div className="text-[1.3rem] mt-0.5 animate-bounce">🤖</div>
                  <div className="flex-1 font-sarabun text-[0.88rem] leading-relaxed text-app-text2">
                    <h4 className="font-prompt font-bold text-green-deep dark:text-[#52d3a2] text-[0.92rem] mb-2 flex items-center gap-1.5">
                      ผลการวิเคราะห์เป้าหมายโดย AI
                    </h4>
                    <div className="whitespace-pre-line text-[0.82rem] leading-relaxed text-app-text2/90 space-y-1">
                      {renderExplanation(aiExplanation)}
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-green-mid/10 flex items-center justify-between text-[0.72rem] text-app-text3">
                      <span>*วิเคราะห์จาก Mifflin-St Jeor & Asian BMI</span>
                      <button 
                        onClick={() => setAiExplanation('')}
                        className="font-bold font-prompt text-green-deep hover:underline cursor-pointer"
                      >
                        ตกลง
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
