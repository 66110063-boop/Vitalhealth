import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PageTransition from '../components/PageTransition'

import { useHealthStore } from '../store/useHealthStore'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const { physicalProfile, updatePhysicalProfile } = useHealthStore()
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || 'คุณผู้ใช้',
    email: user?.email || 'user@example.com',
    bio: user?.bio || 'รักการออกกำลังกายและดูแลสุขภาพ',
    age: physicalProfile.age,
    weight: physicalProfile.weight,
    height: physicalProfile.height,
    gender: physicalProfile.gender,
    activityLevel: physicalProfile.activityLevel || '1.2'
  })

  const handleSave = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Update Auth Context (Name, Bio)
    updateUser({ name: profile.name, bio: profile.bio })
    
    // Update Health Store (Physical Stats)
    updatePhysicalProfile({
      age: Number(profile.age),
      weight: Number(profile.weight),
      height: Number(profile.height),
      gender: profile.gender,
      activityLevel: profile.activityLevel
    }, user?.email)

    setTimeout(() => {
      showToast('อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว!')
      setLoading(false)
    }, 800)
  }

  const calculateCompleteness = () => {
    let score = 0
    const totalFields = 7 // name, bio, age, weight, height, gender, activityLevel
    if (profile.name && profile.name.trim() !== '') score += 1
    if (profile.bio && profile.bio.trim() !== '') score += 1
    if (profile.age && Number(profile.age) > 0) score += 1
    if (profile.weight && Number(profile.weight) > 0) score += 1
    if (profile.height && Number(profile.height) > 0) score += 1
    if (profile.gender) score += 1
    if (profile.activityLevel) score += 1
    return Math.round((score / totalFields) * 100)
  }

  const completeness = calculateCompleteness()

  return (
    <PageTransition>
    <div className="py-9 max-w-4xl mx-auto">
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">โปรไฟล์ส่วนตัว</h2>
        <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">จัดการข้อมูลส่วนตัวและภาพลักษณ์ของคุณ</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side - Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-app p-8 shadow-app border-[1.5px] border-app-border text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-app-bg2 border-4 border-white shadow-md overflow-hidden mb-4 relative group">
              <img 
                src={user?.avatar || 'https://www.w3schools.com/howto/img_avatar.png'} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
            </div>
            <h3 className="text-[1.2rem] font-bold font-prompt text-app-text">{profile.name}</h3>
            <p className="text-app-text3 text-sm font-sarabun mb-4">{profile.email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-pale text-green-deep text-xs font-bold rounded-full font-prompt uppercase tracking-wider">
              สมาชิกทั่วไป
            </div>
          </div>

          <div className="bg-white rounded-app p-6 shadow-app border-[1.5px] border-app-border">
            <h4 className="text-[0.95rem] font-semibold mb-4 font-prompt text-green-deep">ความคืบหน้า</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-sarabun mb-1.5">
                  <span className="text-app-text2">ความสมบูรณ์ของโปรไฟล์</span>
                  <span className="text-green-deep font-bold">{completeness}%</span>
                </div>
                <div className="h-1.5 bg-app-bg2 rounded-full overflow-hidden">
                  <div className="h-full bg-green-mid rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-app p-8 shadow-app border-[1.5px] border-app-border">
            <h3 className="text-[1.05rem] font-semibold mb-6 flex items-center gap-2 font-prompt text-green-deep border-b border-app-bg2 pb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              แก้ไขข้อมูลส่วนตัว
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="sm:col-span-2">
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ชื่อที่แสดง</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all" />
              </div>
              
              <div>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">อายุ (ปี)</label>
                <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})}
                  className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all" />
              </div>
              
              <div>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">เพศ</label>
                <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})}
                  className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all cursor-pointer">
                  <option>ชาย</option>
                  <option>หญิง</option>
                  <option>อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">น้ำหนัก (กก.)</label>
                <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: e.target.value})}
                  className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all" />
              </div>

              <div>
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ส่วนสูง (ซม.)</label>
                <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})}
                  className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ระดับกิจกรรม (Activity Level)</label>
                <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value})}
                  className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all cursor-pointer">
                  <option value="1.2">ไม่ออกกำลังกายเลย (Sedentary)</option>
                  <option value="1.375">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์ (Lightly active)</option>
                  <option value="1.55">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์ (Moderately active)</option>
                  <option value="1.725">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์ (Very active)</option>
                  <option value="1.9">ออกกำลังกายหนักมาก / ทำงานใช้แรงงาน (Extra active)</option>
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">แนะนำตัวเองสั้นๆ</label>
              <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows="3"
                className="w-full px-4 py-2.5 border-[1.5px] border-app-border rounded-app-sm bg-app-bg text-app-text font-sarabun outline-none focus:border-green-mid focus:bg-white transition-all resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-app-sm font-prompt font-semibold text-white text-[1rem] transition-all hover:opacity-90 shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--color-green-mid), var(--color-green-deep))' }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : null}
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </div>
      </form>
    </div>
    </PageTransition>
  )
}
