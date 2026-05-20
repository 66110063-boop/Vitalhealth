import { useState, useEffect, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import { useHealthStore } from '../store/useHealthStore'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'

const calMap = { run: 9, swim: 7, cycle: 6, yoga: 3, gym: 5, walk: 3.5 }

export default function ExercisePage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { logs, addLog, caloriesBurned } = useHealthStore()

  // Tab Control
  const [activeTab, setActiveTab] = useState('manual') // 'manual' | 'timer'

  // Manual Log Form State
  const [exType, setExType] = useState('')
  const [exStart, setExStart] = useState('06:30')
  const [exEnd, setExEnd] = useState('07:15')
  const [calories, setCalories] = useState(245)
  const [loading, setLoading] = useState(false)

  // Timer State
  const [timerExType, setTimerExType] = useState('')
  const [timerPreset, setTimerPreset] = useState('tabata') // 'tabata' | 'hiit' | 'custom'
  const [workSeconds, setWorkSeconds] = useState(20)
  const [restSeconds, setRestSeconds] = useState(10)
  const [totalRounds, setTotalRounds] = useState(8)
  const [currentRound, setCurrentRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(20)
  const [isResting, setIsResting] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const intervalRef = useRef(null)

  // Web Audio synthesizer beep
  const playBeep = (freq, duration) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Low safe volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  };

  const playVictoryChime = () => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playBeep(freq, 0.25);
      }, idx * 180);
    });
  };

  // Main countdown timer loop
  useEffect(() => {
    let timer = null;
    if (isActive && !isFinished) {
      timer = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((t) => {
            const nextTime = t - 1;
            // Warning sound on 3, 2, 1
            if (nextTime >= 1 && nextTime <= 3) {
              playBeep(600, 0.08);
            }
            return nextTime;
          });
        } else {
          // Transition on hitting 0
          if (!isResting) {
            // WORK period finished
            if (currentRound < totalRounds) {
              setIsResting(true);
              setTimeLeft(restSeconds);
              playBeep(450, 0.3); // rest sound
              showToast(`รอบที่ ${currentRound} สำเร็จ! พักผ่อนได้`, 'info');
            } else {
              // Workout complete!
              completeWorkout();
            }
          } else {
            // REST period finished -> start next WORK round
            setIsResting(false);
            setCurrentRound((r) => r + 1);
            setTimeLeft(workSeconds);
            playBeep(900, 0.12);
            setTimeout(() => playBeep(900, 0.12), 150); // work sound (double high beep)
            showToast(`เริ่มรอบที่ ${currentRound + 1}! ลุยต่อเลย!`, 'success');
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isResting, currentRound, totalRounds, workSeconds, restSeconds, isFinished]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const completeWorkout = () => {
    setIsActive(false);
    setIsFinished(true);
    playVictoryChime();

    // Calculate total duration of active WORK rounds in minutes
    const totalActiveTime = (workSeconds * totalRounds) / 60;
    const burned = Math.round(totalActiveTime * (calMap[timerExType] || 5));

    addLog({
      type: 'exercise',
      value: burned,
      label: `${timerExType.toUpperCase()} จับเวลา (${totalRounds} รอบ, ${burned} kcal)`
    }, user?.email);

    showToast(`🎉 ออกกำลังกายเสร็จสิ้น! บันทึกแล้ว ${burned} kcal`, 'success');
  };

  const selectPreset = (preset) => {
    setTimerPreset(preset);
    setIsActive(false);
    setIsFinished(false);
    setIsResting(false);
    setCurrentRound(1);

    if (preset === 'tabata') {
      setWorkSeconds(20);
      setRestSeconds(10);
      setTotalRounds(8);
      setTimeLeft(20);
    } else if (preset === 'hiit') {
      setWorkSeconds(45);
      setRestSeconds(15);
      setTotalRounds(4);
      setTimeLeft(45);
    } else {
      // Custom defaults
      setWorkSeconds(30);
      setRestSeconds(15);
      setTotalRounds(5);
      setTimeLeft(30);
    }
  };

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

  // Circular SVG computations
  const maxTimeForPeriod = isResting ? restSeconds : workSeconds;
  const ringCircumference = 2 * Math.PI * 65; // radius 65 -> circumference = 408.4

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <PageTransition>
    <div className="py-9">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">บันทึกการออกกำลังกาย</h2>
        <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">ติดตามกิจกรรมและแคลอรีที่เผาผลาญแต่ละวัน</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card */}
        <div className="bg-app-card rounded-app p-7 shadow-app border-[1.5px] border-app-border flex flex-col justify-between">
          <div>
            {/* Tab navigation */}
            <div className="flex border-b border-app-border mb-6">
              <button
                onClick={() => { setActiveTab('manual'); setIsActive(false); }}
                className={`flex-1 pb-3 font-prompt font-semibold text-[0.95rem] border-b-2 bg-transparent cursor-pointer transition-all ${
                  activeTab === 'manual' 
                    ? 'border-green-mid text-green-deep' 
                    : 'border-transparent text-app-text3 hover:text-app-text2'
                }`}
              >
                บันทึกด้วยมือ
              </button>
              <button
                onClick={() => { setActiveTab('timer'); }}
                className={`flex-1 pb-3 font-prompt font-semibold text-[0.95rem] border-b-2 bg-transparent cursor-pointer transition-all ${
                  activeTab === 'timer' 
                    ? 'border-green-mid text-green-deep' 
                    : 'border-transparent text-app-text3 hover:text-app-text2'
                }`}
              >
                ⏱️ เครื่องจับเวลา
              </button>
            </div>

            {activeTab === 'manual' ? (
              <>
                <h3 className="text-[1.05rem] font-semibold mb-5 flex items-center gap-2 font-prompt text-green-deep">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
                  บันทึกกิจกรรม
                </h3>
                <div className="mb-[18px]">
                  <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ประเภทการออกกำลังกาย</label>
                  <select
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:border-green-mid focus:bg-app-card cursor-pointer"
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
                        className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:border-green-mid focus:bg-app-card transition-all"
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
                  className="w-full py-3 rounded-app-sm font-prompt font-semibold text-white text-[1rem] border-none cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-md disabled:opacity-70 font-prompt"
                  style={{ background: 'linear-gradient(135deg, var(--color-green-mid), var(--color-green-deep))' }}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการออกกำลังกาย'}
                </button>
              </>
            ) : (
              <div className="flex flex-col">
                <h3 className="text-[1.05rem] font-semibold mb-4 flex items-center gap-2 font-prompt text-green-deep">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  เครื่องจับเวลา HIIT & Workout
                </h3>
                
                {/* Select Exercise Type */}
                <div className="mb-4">
                  <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">เลือกกิจกรรมออกกำลังกาย</label>
                  <select
                    disabled={isActive}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none focus:border-green-mid focus:bg-app-card cursor-pointer disabled:opacity-60"
                    value={timerExType}
                    onChange={e => setTimerExType(e.target.value)}
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

                {/* Preset buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { id: 'tabata', label: 'Tabata (20s/10s)' },
                    { id: 'hiit', label: 'HIIT (45s/15s)' },
                    { id: 'custom', label: 'กำหนดเอง' },
                  ].map(p => (
                    <button
                      key={p.id}
                      disabled={isActive}
                      onClick={() => selectPreset(p.id)}
                      className={`py-2 px-1 text-[0.8rem] font-prompt font-semibold rounded-lg border transition-all ${
                        timerPreset === p.id 
                          ? 'bg-green-pale text-green-deep border-green-mid shadow-sm' 
                          : 'bg-transparent text-app-text3 border-app-border hover:bg-app-bg hover:text-app-text2'
                      } disabled:opacity-60 cursor-pointer`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Settings inputs */}
                {timerPreset === 'custom' && (
                  <div className="grid grid-cols-3 gap-2.5 mb-4 p-3.5 bg-app-bg2 rounded-xl border border-app-border">
                    <div>
                      <label className="block text-[0.7rem] font-semibold text-app-text3 mb-1 text-center font-sarabun">ทำงาน (วิ)</label>
                      <input
                        type="number"
                        disabled={isActive}
                        min="5"
                        value={workSeconds}
                        onChange={e => {
                          const val = Math.max(5, parseInt(e.target.value) || 0);
                          setWorkSeconds(val);
                          if (!isResting) setTimeLeft(val);
                        }}
                        className="w-full text-center px-2 py-1.5 border border-app-border rounded bg-app-bg text-app-text font-sarabun text-[0.9rem] outline-none focus:border-green-mid"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-semibold text-app-text3 mb-1 text-center font-sarabun">พักผ่อน (วิ)</label>
                      <input
                        type="number"
                        disabled={isActive}
                        min="3"
                        value={restSeconds}
                        onChange={e => {
                          const val = Math.max(3, parseInt(e.target.value) || 0);
                          setRestSeconds(val);
                          if (isResting) setTimeLeft(val);
                        }}
                        className="w-full text-center px-2 py-1.5 border border-app-border rounded bg-app-bg text-app-text font-sarabun text-[0.9rem] outline-none focus:border-green-mid"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-semibold text-app-text3 mb-1 text-center font-sarabun">จำนวนรอบ</label>
                      <input
                        type="number"
                        disabled={isActive}
                        min="1"
                        value={totalRounds}
                        onChange={e => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-center px-2 py-1.5 border border-app-border rounded bg-app-bg text-app-text font-sarabun text-[0.9rem] outline-none focus:border-green-mid"
                      />
                    </div>
                  </div>
                )}

                {/* Timer Circular Display */}
                <div className="flex flex-col items-center py-4 bg-app-bg2 rounded-2xl border border-app-border mb-4 relative overflow-hidden">
                  <div className="w-[140px] h-[140px] relative">
                    <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                      <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-border)" strokeWidth="8" className="opacity-25" />
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke={isResting ? '#0891b2' : 'var(--color-green-mid)'}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 - (Math.min(timeLeft / maxTimeForPeriod, 1) * (2 * Math.PI * 60))}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-[2rem] font-bold font-prompt text-green-deep">{formatTime(timeLeft)}</div>
                      <div className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold font-prompt uppercase text-white ${isResting ? 'bg-cyan-600' : 'bg-green-mid'}`}>
                        {isResting ? 'REST' : 'WORK'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[0.82rem] mt-2.5 font-prompt font-semibold text-app-text2">
                    รอบ {currentRound} / {totalRounds}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                  {isFinished ? (
                    <button
                      onClick={() => {
                        setIsFinished(false);
                        setCurrentRound(1);
                        setTimeLeft(workSeconds);
                        setIsResting(false);
                      }}
                      className="flex-1 py-3 rounded-xl font-prompt font-semibold bg-green-deep text-white border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-md"
                    >
                      ออกกำลังกายรอบใหม่
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (!timerExType) {
                            showToast('กรุณาเลือกประเภทการออกกำลังกายก่อนเริ่มจับเวลา', 'warning');
                            return;
                          }
                          setIsActive(!isActive);
                        }}
                        className={`flex-1 py-3 rounded-xl font-prompt font-semibold border-none cursor-pointer text-white shadow-md active:scale-95 transition-all ${
                          isActive 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'bg-green-mid hover:bg-green-deep'
                        }`}
                      >
                        {isActive ? 'Pause (พักชั่วคราว)' : 'Start (เริ่มจับเวลา)'}
                      </button>
                      <button
                        onClick={() => {
                          setIsActive(false);
                          setCurrentRound(1);
                          setTimeLeft(workSeconds);
                          setIsResting(false);
                          setIsFinished(false);
                        }}
                        className="px-5 py-3 rounded-xl font-prompt font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 cursor-pointer active:scale-95 transition-all"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right card - chart */}
        <div className="bg-app-card rounded-app p-7 shadow-app border-[1.5px] border-app-border">
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

