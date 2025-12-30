// api/openai.js - Updated for OpenRouter

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Use OpenRouter instead of OpenAI
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000', // Optional but recommended
        'X-Title': 'Productsense App', // Optional
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // You can change this to any OpenRouter model
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // OpenRouter returns similar structure to OpenAI
    res.status(200).json(data.choices[0].message);
  } catch (error) {
    console.error('OpenRouter API error:', error);
    res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
  }
}
