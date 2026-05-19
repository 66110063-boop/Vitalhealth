import { useState } from 'react'
import PageTransition from '../components/PageTransition'

const tips = [
  {
    title: '5 วิธีปรับตารางนอนเพื่อสุขภาพที่ดี',
    summary: 'สร้างนิสัยการนอนที่สม่ำเสมอและตื่นอย่างสดชื่นด้วยเทคนิคง่าย ๆ ที่ทำได้ทุกวัน',
    detail: 'ลองตั้งเวลาเข้านอนและตื่นให้ใกล้เคียงกันทุกวัน แม้ในวันหยุด การปรับแสงและเลี่ยงหน้าจอก่อนนอน 1 ชั่วโมงช่วยให้หลับได้เร็วขึ้น',
    category: 'การนอนหลับ',
    readTime: 'อ่าน 3 นาที',
  },
  {
    title: 'อาหารที่ช่วยเพิ่มพลังใจและลดความเครียด',
    summary: 'รวมเมนูสุขภาพที่ช่วยให้คุณมีสมาธิและอารมณ์ดีขึ้นได้ตั้งแต่เช้ายันเย็น',
    detail: 'เลือกรับประทานอาหารที่มีโอเมก้า-3 ผักใบเขียว และผลไม้สด เพื่อช่วยสร้างสารเซโรโทนินในสมอง ควบคู่กับน้ำเปล่าเพื่อให้ร่างกายสดชื่น',
    category: 'โภชนาการ',
    readTime: 'อ่าน 4 นาที',
  },
  {
    title: 'ออกกำลังง่าย ๆ สำหรับคนทำงานหน้าจอ',
    summary: 'ท่าเคลื่อนไหวสั้น ๆ ที่ช่วยลดอาการปวดคอหลังและเพิ่มการไหลเวียนเลือด',
    detail: 'ทุก 45 นาที ลุกยืนยืดเส้น ยืดแขนและหลัง พร้อมท่าเดินที่โต๊ะทำงานเพื่อช่วยให้กล้ามเนื้อไม่ตึงมากเกินไป',
    category: 'การออกกำลังกาย',
    readTime: 'อ่าน 3 นาที',
  },
  {
    title: 'วิธีจัดการความเครียดด้วยการหายใจ',
    summary: 'เทคนิคหายใจเพื่อลดความตึงเครียดและสร้างสมดุลให้ร่างกายได้ทันที',
    detail: 'ลองฝึกหายใจ 4-7-8: หายใจเข้านับ 4 ออกนับ 7 และพ่นลมนับ 8 ซ้ำ 4 รอบ จะช่วยทำให้หัวใจเต้นช้าลงและความเครียดลดลง',
    category: 'สุขภาพจิต',
    readTime: 'อ่าน 2 นาที',
  },
]

export default function HealthTipsPage() {
  const [openIndexes, setOpenIndexes] = useState([])

  const toggleTip = (index) => {
    setOpenIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    )
  }

  return (
    <PageTransition>
      <div className="py-9">
        <div className="mb-7">
          <h2 className="text-[1.6rem] font-bold font-prompt text-app-text">บทความสุขภาพ</h2>
          <p className="text-app-text3 text-[0.95rem] mt-1 font-sarabun">รวมเคล็ดลับ สุขภาพดีง่าย ๆ สำหรับทุกวัน</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tips.map((tip, index) => {
            const isOpen = openIndexes.includes(index)
            return (
              <article key={tip.title} className="bg-white rounded-app p-6 border-[1.5px] border-app-border shadow-app transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-pale/80 px-3 py-1 text-[0.8rem] font-semibold text-green-deep font-sarabun">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
                    {tip.category}
                  </span>
                  <span className="text-[0.8rem] text-app-text3 font-sarabun">{tip.readTime}</span>
                </div>

                <h3 className="text-[1.15rem] font-semibold text-app-text font-prompt leading-snug mb-3">{tip.title}</h3>
                <p className="text-app-text3 text-[0.95rem] font-sarabun leading-relaxed mb-4">{tip.summary}</p>

                {isOpen && (
                  <div className="mb-5 rounded-2xl border border-green-pale/80 bg-green-pale/10 p-4 text-app-text3 text-sm font-sarabun leading-relaxed">
                    {tip.detail}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleTip(index)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-deep font-sarabun hover:text-green-mid transition"
                >
                  {isOpen ? 'ย่อข้อความ' : 'อ่านต่อ'}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isOpen ? <path d="M19 12H5"/> : <>
                      <path d="M5 12h14"/>
                      <path d="m13 6 6 6-6 6"/>
                    </>}
                  </svg>
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
