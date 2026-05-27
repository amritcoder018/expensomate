import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK.
// Vercel automatically finds and injects your process.env.GEMINI_API_KEY.
const ai = new GoogleGenAI({});

export default async function handler(req, res) {
  // 1. Only allow secure POST requests from your frontend
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method Not Allowed. Use POST requests.' });
  }

  try {
    // 2. Extract the prompt sent by your Vite frontend
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res
        .status(400)
        .json({ error: 'A valid text prompt is required.' });
    }

    // 3. Make a secure backend call to the official Gemini model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Google's fast, default workhorse model
      contents: prompt,
    });

    // 4. Return the text response cleanly to your React application
    return res.status(200).json({ text: response.text });

  } catch (error) {
    // 5. Handle fallback API or quota errors gracefully
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to communicate with Gemini.', 
      details: error.message 
    });
  }
}
