import { createContext, useContext, useState, useEffect } from 'react'

const HealthContext = createContext(null)

export function HealthProvider({ children }) {
  // โหลดข้อมูลเริ่มต้นจาก localStorage
  const [healthData, setHealthData] = useState(() => {
    const saved = localStorage.getItem('vitalhealth_data')
    return saved ? JSON.parse(saved) : {
      steps: 0,
      caloriesBurned: 0,
      caloriesIntake: 0,
      sleepHours: 0,
      logs: [] // เก็บประวัติทั้งหมด [{type, value, date, label}]
    }
  })

  // บันทึกข้อมูลลง localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem('vitalhealth_data', JSON.stringify(healthData))
  }, [healthData])

  // ฟังก์ชันบันทึกกิจกรรม
  const addLog = (entry) => {
    // entry: { type: 'exercise'|'food'|'sleep', value: number, label: string }
    const newEntry = {
      ...entry,
      id: Date.now(),
      date: new Date().toISOString()
    }

    setHealthData(prev => {
      const updated = { ...prev, logs: [newEntry, ...prev.logs] }
      
      // อัปเดตสถิติรวมของวันนี้ (แบบง่าย)
      if (entry.type === 'exercise') updated.caloriesBurned += entry.value
      if (entry.type === 'food') updated.caloriesIntake += entry.value
      if (entry.type === 'sleep') updated.sleepHours = entry.value // ใช้ค่าล่าสุดของการนอน
      if (entry.type === 'steps') updated.steps += entry.value

      return updated
    })
  }

  const resetData = () => {
    setHealthData({ steps: 0, caloriesBurned: 0, caloriesIntake: 0, sleepHours: 0, logs: [] })
  }

  return (
    <HealthContext.Provider value={{ healthData, addLog, resetData }}>
      {children}
    </HealthContext.Provider>
  )
}

export const useHealth = () => useContext(HealthContext)
