export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { message, healthData } = req.body;

  try {
    // Calling Google API directly via fetch to avoid SDK issues
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `คุณคือ AI Coach ของ VitalHealth ข้อมูลผู้ใช้: ${JSON.stringify(healthData)}. ตอบสั้นๆ ภาษาไทย: ${message}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Google API Error ${response.status}`);
    }

    const reply = data.candidates[0].content.parts[0].text.trim();
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Gemini Fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
