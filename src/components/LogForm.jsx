import { useForm } from 'react-hook-form'
import { useHealthStore } from '../store/useHealthStore'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const EXERCISE_OPTIONS = [
  { value: 'run', label: 'วิ่ง (Run)', calPerMin: 9 },
  { value: 'swim', label: 'ว่ายน้ำ (Swim)', calPerMin: 7 },
  { value: 'cycle', label: 'ปั่นจักรยาน (Cycle)', calPerMin: 6 },
  { value: 'yoga', label: 'โยคะ (Yoga)', calPerMin: 3 },
  { value: 'gym', label: 'ยกน้ำหนัก (Gym)', calPerMin: 5 },
  { value: 'walk', label: 'เดิน (Walk)', calPerMin: 3.5 },
]

export default function LogForm({ type, onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { user } = useAuth()
  const addLog = useHealthStore((state) => state.addLog)
  const { showToast } = useToast()

  const onSubmit = (data) => {
    let value = 0;
    let label = '';

    if (type === 'exercise') {
      const typeInfo = EXERCISE_OPTIONS.find(opt => opt.value === data.exerciseType);
      const minutes = parseInt(data.duration);
      value = Math.round(minutes * typeInfo.calPerMin);
      label = `${typeInfo.label} - ${minutes} นาที`;
    } else if (type === 'food') {
      value = parseInt(data.calories);
      label = data.foodName;
    } else if (type === 'sleep') {
      value = parseFloat(data.hours);
      label = `นอนหลับ ${value} ชั่วโมง`;
    } else if (type === 'steps') {
      value = parseInt(data.steps);
      label = `เดิน ${value} ก้าว`;
    }

    addLog({ type, value, label }, user?.email);
    showToast(`บันทึกข้อมูล${type === 'exercise' ? 'การออกกำลังกาย' : type === 'food' ? 'อาหาร' : type === 'sleep' ? 'การนอน' : 'จำนวนก้าว'}สำเร็จ`);
    if (onSuccess) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {type === 'exercise' && (
        <>
          <div>
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ประเภทการออกกำลังกาย</label>
            <select
              {...register('exerciseType', { required: 'กรุณาเลือกประเภท' })}
              className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:bg-white cursor-pointer ${errors.exerciseType ? 'border-red-400 focus:border-red-500' : 'border-app-border focus:border-green-mid'}`}
            >
              <option value="">— เลือกประเภท —</option>
              {EXERCISE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.exerciseType && <p className="text-red-500 text-xs mt-1 font-sarabun">{errors.exerciseType.message}</p>}
          </div>
          <div>
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ระยะเวลา (นาที)</label>
            <input
              type="number"
              {...register('duration', { required: 'กรุณาระบุระยะเวลา', min: { value: 1, message: 'ต้องมากกว่า 0' } })}
              placeholder="เช่น 30"
              className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:bg-white ${errors.duration ? 'border-red-400 focus:border-red-500' : 'border-app-border focus:border-green-mid'}`}
            />
            {errors.duration && <p className="text-red-500 text-xs mt-1 font-sarabun">{errors.duration.message}</p>}
          </div>
        </>
      )}

      {type === 'food' && (
        <>
          <div>
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ชื่ออาหาร</label>
            <input
              type="text"
              {...register('foodName', { required: 'กรุณาระบุชื่ออาหาร' })}
              placeholder="เช่น ข้าวมันไก่"
              className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:bg-white ${errors.foodName ? 'border-red-400 focus:border-red-500' : 'border-app-border focus:border-green-mid'}`}
            />
            {errors.foodName && <p className="text-red-500 text-xs mt-1 font-sarabun">{errors.foodName.message}</p>}
          </div>
          <div>
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">แคลอรี (kcal)</label>
            <input
              type="number"
              {...register('calories', { required: 'กรุณาระบุแคลอรี', min: { value: 1, message: 'ต้องมากกว่า 0' } })}
              placeholder="เช่น 450"
              className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:bg-white ${errors.calories ? 'border-red-400 focus:border-red-500' : 'border-app-border focus:border-green-mid'}`}
            />
            {errors.calories && <p className="text-red-500 text-xs mt-1 font-sarabun">{errors.calories.message}</p>}
          </div>
        </>
      )}

      {type === 'sleep' && (
        <>
          <div>
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">ระยะเวลาการนอน (ชั่วโมง)</label>
            <input
              type="number"
              step="0.5"
              {...register('hours', { required: 'กรุณาระบุชั่วโมง', min: { value: 0.5, message: 'ต้องมากกว่า 0' }, max: { value: 24, message: 'ไม่เกิน 24 ชม.' } })}
              placeholder="เช่น 7.5"
              className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:bg-white ${errors.hours ? 'border-red-400 focus:border-red-500' : 'border-app-border focus:border-green-mid'}`}
            />
            {errors.hours && <p className="text-red-500 text-xs mt-1 font-sarabun">{errors.hours.message}</p>}
          </div>
        </>
      )}
      
      {type === 'steps' && (
        <>
          <div>
            <label className="block text-[0.88rem] font-medium text-app-text2 mb-1.5 font-sarabun">จำนวนก้าว</label>
            <input
              type="number"
              {...register('steps', { required: 'กรุณาระบุจำนวนก้าว', min: { value: 1, message: 'ต้องมากกว่า 0' } })}
              placeholder="เช่น 5000"
              className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-app-sm bg-app-bg text-app-text font-sarabun text-[0.95rem] outline-none transition-colors focus:bg-white ${errors.steps ? 'border-red-400 focus:border-red-500' : 'border-app-border focus:border-green-mid'}`}
            />
            {errors.steps && <p className="text-red-500 text-xs mt-1 font-sarabun">{errors.steps.message}</p>}
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full mt-6 py-3 rounded-app-sm font-prompt font-semibold text-white text-[1rem] border-none cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-md"
        style={{ background: 'linear-gradient(135deg, var(--color-green-mid), var(--color-green-deep))' }}
      >
        บันทึกข้อมูล
      </button>
    </form>
  )
}
