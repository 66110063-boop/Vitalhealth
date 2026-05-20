import { useState, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import { useHealthStore } from '../store/useHealthStore'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'

const recipes = [
  { name: 'สลัดอกไก่ย่าง', cal: 320, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', tag: 'โปรตีนสูง' },
  { name: 'ข้าวผัดควินัว', cal: 450, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', tag: 'ใยอาหารสูง' },
  { name: 'สมูทตี้เบอร์รี่', cal: 180, img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80', tag: 'วิตามินซี' },
]

export default function FoodPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { logs, addLog } = useHealthStore()
  const [foodName, setFoodName] = useState('')
  const [foodCal, setFoodCal] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [macros, setMacros] = useState(null)
  const fileInputRef = useRef(null)

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const processFile = async (file) => {
    if (!file) return

    setAnalyzing(true)
    setMacros(null)
    showToast('กำลังบีบอัดและวิเคราะห์รูปภาพ...', 'info')

    try {
      const base64Data = await compressImage(file)
      setImagePreview(base64Data)

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Image: base64Data,
          mimeType: file.type
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'API Error')
      }
      
      const data = await response.json()
      
      if (data.error === 'not_food') {
        throw new Error('ไม่พบอาหารในรูปภาพ ลองถ่ายใหม่อีกครั้งครับ')
      }

      if (data.name && data.kcal !== undefined) {
        setFoodName(data.name)
        setFoodCal(data.kcal.toString())
        if (data.protein !== undefined) {
          setMacros({
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat
          })
        }
        showToast('วิเคราะห์สำเร็จ!', 'success')
      } else {
        throw new Error('ข้อมูลไม่ครบถ้วน')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      showToast(`ผิดพลาด: ${error.message}`, 'error')
      setImagePreview(null)
    } finally {
      setAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImageUpload = (e) => {
    processFile(e.target.files[0])
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleAdd = () => {
    if (!foodName || !foodCal) {
      showToast('กรุณากรอกชื่ออาหารและแคลอรี')
      return
    }
    setLoading(true)
    setTimeout(() => {
      addLog({
        type: 'food',
        value: parseInt(foodCal),
        label: `${foodName} (${foodCal} kcal)`
      }, user?.email)
      showToast(`บันทึก ${foodName} เรียบร้อย!`)
      resetState()
      setLoading(false)
    }, 600)
  }

  const resetState = () => {
    setFoodName('')
    setFoodCal('')
    setImagePreview(null)
    setMacros(null)
  }

  const selectRecipe = (r) => {
    setFoodName(r.name)
    setFoodCal(r.cal.toString())
    setImagePreview(r.img)
    setMacros(null)
    showToast(`เลือก ${r.name} แล้ว`)
  }

  const recentFood = logs.filter(log => log.type === 'food').slice(0, 3)

  return (
    <PageTransition>
    <div className="py-9">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">บันทึกอาหาร</h2>
        <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">ติดตามปริมาณพลังงานและสารอาหารของคุณ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Card */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* AI Scanner Area */}
          <div className="bg-app-card rounded-app p-6 shadow-app border-[1.5px] border-app-border h-fit">
            <h3 className="text-[1.05rem] font-semibold mb-4 flex items-center gap-2 font-prompt text-green-deep">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              แสกนอาหารด้วย AI
            </h3>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden" 
            />

            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className="w-full h-48 border-2 border-dashed border-app-border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-mid hover:bg-green-pale/30 transition-all text-app-text3 group"
              >
                <div className="w-12 h-12 rounded-full bg-app-bg2 flex items-center justify-center group-hover:bg-green-pale group-hover:text-green-deep transition-all">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="text-center">
                  <p className="font-sarabun font-medium text-app-text2">แตะเพื่อถ่ายรูป หรืออัปโหลด</p>
                  <p className="font-sarabun text-[0.8rem] mt-1">รองรับรูปภาพและถ่ายภาพโดยตรง</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border-[1.5px] border-app-border bg-black">
                <img src={imagePreview} alt="Food preview" className="w-full h-full object-cover opacity-90" />
                
                {analyzing && (
                  <>
                    <div className="absolute inset-0 bg-green-deep/20 backdrop-blur-[1px]"></div>
                    {/* Laser scan animation */}
                    <div className="absolute left-0 right-0 h-[2px] bg-green-mid shadow-[0_0_10px_#16a97a] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 px-4 py-2 rounded-full font-sarabun text-[0.85rem] font-medium text-green-deep shadow-lg flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        กำลังวิเคราะห์...
                      </div>
                    </div>
                  </>
                )}
                
                {!analyzing && (
                  <button 
                    onClick={resetState}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
              </div>
            )}
            
            <style>{`
              @keyframes scan {
                0% { top: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            `}</style>
          </div>

          {/* Result Card */}
          <div className="bg-app-card rounded-app p-6 shadow-app border-[1.5px] border-app-border">
            <div className="space-y-4">
              <div>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ชื่ออาหาร</label>
                <input 
                  type="text" 
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="เช่น ข้าวมันไก่" 
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none focus:border-green-mid focus:bg-app-card transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">แคลอรี (kcal)</label>
                <input 
                  type="number" 
                  value={foodCal}
                  onChange={e => setFoodCal(e.target.value)}
                  placeholder="0" 
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none focus:border-green-mid focus:bg-app-card transition-all font-semibold"
                />
              </div>

              {macros && (
                <div className="pt-2">
                  <label className="block text-[0.88rem] font-medium text-app-text2 mb-2 font-sarabun">ข้อมูลโภชนาการ (โดยประมาณ)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#f8f0f0] border border-[#f5dbdb] rounded-lg p-2.5 text-center">
                      <div className="text-[0.7rem] text-[#d65f5f] font-semibold mb-1">โปรตีน</div>
                      <div className="font-prompt font-bold text-app-text">{macros.protein}g</div>
                    </div>
                    <div className="bg-[#f0f4f8] border border-[#dbe6f5] rounded-lg p-2.5 text-center">
                      <div className="text-[0.7rem] text-[#5b87c7] font-semibold mb-1">คาร์บ</div>
                      <div className="font-prompt font-bold text-app-text">{macros.carbs}g</div>
                    </div>
                    <div className="bg-[#fffdf0] border border-[#f5f1db] rounded-lg p-2.5 text-center">
                      <div className="text-[0.7rem] text-[#d4b944] font-semibold mb-1">ไขมัน</div>
                      <div className="font-prompt font-bold text-app-text">{macros.fat}g</div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleAdd}
                disabled={loading || analyzing}
                className="w-full py-3 rounded-app-sm font-prompt font-semibold text-white text-[1rem] transition-all hover:opacity-90 hover:-translate-y-px shadow-md disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--color-green-mid), var(--color-green-deep))' }}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกอาหาร'}
              </button>
            </div>
          </div>
          
          {/* Recent Food */}
          <div className="bg-app-card rounded-app p-6 shadow-app border-[1.5px] border-app-border">
            <h3 className="text-[1.05rem] font-semibold mb-4 font-prompt text-app-text">มื้อล่าสุด</h3>
            {recentFood.length > 0 ? (
              <div className="space-y-2">
                {recentFood.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 bg-app-bg2 rounded-app-sm border border-app-border">
                    <span className="text-[0.85rem] font-medium text-app-text font-sarabun truncate max-w-[120px]">{f.label}</span>
                    <span className="text-[0.75rem] text-app-text3 font-sarabun">{new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[0.85rem] text-app-text3 bg-app-bg2 rounded-app-sm border border-dashed border-app-border">
                ยังไม่มีข้อมูลอาหาร
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[1.05rem] font-semibold flex items-center gap-2 font-prompt text-green-deep">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              เมนูแนะนำเพื่อสุขภาพ
            </h3>
            <button className="text-[0.85rem] text-green-mid hover:text-green-deep font-sarabun font-medium">ดูทั้งหมด</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {recipes.map((r, i) => (
              <div key={i} 
                onClick={() => selectRecipe(r)}
                className="group flex bg-app-card rounded-app overflow-hidden shadow-app border-[1.5px] border-app-border cursor-pointer transition-all hover:border-green-mid hover:-translate-x-1"
              >
                <div className="w-40 h-32 overflow-hidden">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-prompt font-semibold text-app-text text-[1.1rem]">{r.name}</h4>
                    <span className="text-green-deep font-bold font-prompt">{r.cal} kcal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-pale text-green-deep text-[0.7rem] rounded-full font-sarabun border border-green-mid/20">{r.tag}</span>
                    <span className="text-[0.75rem] text-app-text3 font-sarabun">ใช้เวลาเตรียม 15 นาที</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
