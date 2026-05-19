export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error listing models' });
    }

    // Return list of model names to see what's available
    const modelNames = data.models.map(m => m.name);
    return res.status(200).json({ availableModels: modelNames });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
