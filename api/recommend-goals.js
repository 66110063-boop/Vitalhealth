export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { physicalProfile } = req.body;

  if (!physicalProfile) {
    return res.status(400).json({ error: 'physicalProfile is required' });
  }

  const { age, weight, height, gender, activityLevel } = physicalProfile;

  try {
    const prompt = `คุณคือแพทย์ผู้เชี่ยวชาญด้านเวชศาสตร์การกีฬาและนักกำหนดอาหารระดับสูงของ VitalHealth 
จงประเมินข้อมูลร่างกายของผู้ใช้งานรายนี้ด้วยความแม่นยำทางวิทยาศาสตร์และวิทยาศาสตร์การกีฬา:
- อายุ: ${age} ปี
- น้ำหนักปัจจุบัน: ${weight} กก.
- ส่วนสูง: ${height} ซม.
- เพศ: ${gender}
- ระดับกิจกรรม (Activity Level Multiplier): ${activityLevel}

สูตรการคำนวณและข้อกำหนด:
1. ค่าดัชนีมวลกายปัจจุบัน (BMI) = น้ำหนัก (กก.) / (ส่วนสูง (ม.)^2)
2. ค่า BMR (Basal Metabolic Rate):
   - เพศชาย: BMR = (10 * น้ำหนัก) + (6.25 * ส่วนสูง) - (5 * อายุ) + 5
   - เพศหญิง: BMR = (10 * น้ำหนัก) + (6.25 * ส่วนสูง) - (5 * อายุ) - 161
3. ค่า TDEE (Total Daily Energy Expenditure) = BMR * ${activityLevel}
4. แนะนำ "แคลอรีที่ควรเผาผลาญต่อวันในการทำกิจกรรมเพิ่มเติมและออกกำลังกายเพื่อรักษาสุขภาพที่ดี" (ค่า 'calories'): 
   - แนะนำเป้าหมายการเคลื่อนไหว/ออกกำลังกายที่เหมาะสมในแต่ละวัน (Active Calories Burned Target) โดยทั่วไปจะอยู่ที่ประมาณ 250 - 500 kcal ขึ้นอยู่กับน้ำหนักและระดับกิจกรรม (ระบุเป็นตัวเลขจำนวนเต็มหลักร้อยที่เหมาะสมกับสภาพร่างกายเขา)
5. แนะนำเวลานอนต่อวัน (ค่า 'sleep') เป็นหน่วยชั่วโมง (เช่น 7.5 หรือ 8 หรือ 8.5) ที่จะช่วยฟื้นฟูร่างกายได้มีประสิทธิภาพสูงสุด
6. แนะนำน้ำหนักตัวเป้าหมายที่เป็นไปได้และปลอดภัย (ค่า 'targetWeight') อิงตามเกณฑ์ดัชนีมวลกายเอเชียที่ดีต่อสุขภาพ (Healthy Asian BMI ระหว่าง 18.5 - 22.9) หากน้ำหนักปัจจุบันปกติอยู่แล้วสามารถใช้น้ำหนักปัจจุบันหรือปรับเล็กน้อยตามเป้าหมาย

จงวิเคราะห์ข้อมูลเหล่านี้อย่างเป็นระบบ และตอบกลับมาเป็น JSON Object เท่านั้น โดยมีรูปแบบคีย์ดังต่อไปนี้ ห้ามมีตัวอักษรอื่นนอกเหนือจาก JSON:
{
  "calories": 350,
  "sleep": 8,
  "targetWeight": 62,
  "explanation": "วิเคราะห์สุขภาพของคุณ:\\n1. **ดัชนีมวลกายปัจจุบัน:** ปัจจุบัน BMI ของคุณคือ X (อธิบายสั้นๆ ว่าอ้วน/สมส่วน/ผอม)...\\n2. **BMR และ TDEE:** ร่างกายของคุณเผาผลาญขั้นพื้นฐาน BMR อยู่ที่ X kcal และมีอัตราการใช้พลังงานรวม TDEE ประมาณ Y kcal ต่อวัน...\\n3. **เหตุผลที่แนะนำเป้าหมายแคลอรีเผาผลาญ:** แนะนำเป้าหมายที่ X kcal เพราะ...\\n4. **เหตุผลที่แนะนำเวลานอนและน้ำหนักตัว:** แนะนำนอน Y ชั่วโมง เพื่อการฟื้นฟูกล้ามเนื้อและระดับฮอร์โมนที่สมดุล และเป้าหมายน้ำหนักที่ Z กก. สอดคล้องกับค่าดัชนีมวลกายที่ดีต่อสุขภาพ"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Google API Error ${response.status}`);
    }

    const textContent = data.candidates[0].content.parts[0].text.trim();
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error('Invalid AI response format');
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    return res.status(200).json(analysisResult);

  } catch (error) {
    console.error('Gemini Recommendation Fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
