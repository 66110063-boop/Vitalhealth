export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { base64Image, mimeType } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Identify the food in this image and estimate its calories and macronutrients. If the image does not contain food, return: {\"error\": \"not_food\"}. Otherwise, respond strictly with a JSON object containing keys: 'name' (Thai string), 'kcal' (number), 'protein' (number in grams), 'carbs' (number in grams), 'fat' (number in grams). Example: {\"name\": \"ข้าวมันไก่\", \"kcal\": 600, \"protein\": 20, \"carbs\": 60, \"fat\": 15}" },
            {
              inline_data: {
                mime_type: mimeType || "image/jpeg",
                data: cleanBase64
              }
            }
          ]
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
    console.error('Gemini Vision Fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
