const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.REACT_APP_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

console.log('DEBUG: OpenRouter API Key exists?', !!OPENROUTER_API_KEY);
console.log('DEBUG: OpenRouter Base URL:', OPENROUTER_BASE_URL);

export async function invokeAI({ 
  prompt, 
  model = 'openai/gpt-3.5-turbo',
  max_tokens = 1000,
  temperature = 0.7 
}) {
  console.log('DEBUG: invokeAI called with prompt length:', prompt.length);
  console.log('DEBUG: Model:', model);
  
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ProductSense'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens,
        temperature
      })
    });

    console.log('DEBUG: OpenRouter response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: OpenRouter API error response:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DEBUG: OpenRouter success, response length:', data.choices[0]?.message?.content?.length || 0);
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI invocation error:', error);
    throw error;
  }
}

// Alias for compatibility with your existing code
export const InvokeLLM = invokeAI;
