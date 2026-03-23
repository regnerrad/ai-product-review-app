import { getRedditSentiment } from './redditService';

export const callOpenAI = async ({ brand, model, question, category }) => {
  try {
    // Fetch real Reddit sentiment data
    console.log(`Fetching Reddit sentiment for ${brand} ${model}...`);
    const redditSentiment = await getRedditSentiment(brand, model);
    console.log('Reddit sentiment:', redditSentiment);
    
    const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY?.trim();
    
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key is not configured, using mock data with real Reddit sentiment');
      return getMockResponse(brand, model, question, category, redditSentiment);
    }

    // Prepare Reddit context
    const redditContext = redditSentiment && redditSentiment.total_posts_analyzed > 0
      ? `\n\n=== REAL REDDIT COMMUNITY DATA ===\n` +
        `- Total Discussions: ${redditSentiment.total_posts_analyzed} Reddit posts analyzed\n` +
        `- Community Sentiment: ${redditSentiment.positive}% positive, ${redditSentiment.neutral}% neutral, ${redditSentiment.negative}% negative\n` +
        `- Overall Sentiment Score: ${redditSentiment.overall_percentage}% positive\n` +
        `- Trend: ${redditSentiment.recent_trend}\n` +
        `- Top Discussions:\n` +
        redditSentiment.top_mentions.map(m => 
          `  • "${m.text.substring(0, 100)}" (r/${m.subreddit}, ${m.score} upvotes)`
        ).join('\n')
      : '\n\n(No Reddit discussions found for this product.)';
    
    console.log('Calling OpenRouter API for:', { brand, model, question, category });
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin || 'https://findoapp.co',
        'X-Title': 'Findo App',
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a product expert analyzing ${brand} ${model}${category ? ` in the ${category} category` : ''}. 
            Provide comprehensive product analysis based on the user's question.
            
            ${redditContext}
            
            === CRITICAL FORMATTING INSTRUCTIONS ===
            Your response MUST have the "detailed_summary" field formatted EXACTLY like this:
            
            [Write 2-3 sentences about the product based on general knowledge, features, and specifications.]
            
            Then add a new paragraph with Reddit insights.
            
            IMPORTANT: 
            - Keep product analysis separate from Reddit insights
            - Don't use markdown formatting in the JSON string
            
            ALWAYS respond with a valid JSON object matching this EXACT structure:
            {
              "answer_to_question": "Direct answer to the user's question",
              "detailed_summary": "Product analysis text here. Then a new paragraph with Reddit insights here.",
              "rating_info": {
                "average_rating": 4.5,
                "total_reviews": ${redditSentiment?.total_posts_analyzed || 1000},
                "rating_breakdown": {}
              },
              "pros": ["Pro 1", "Pro 2", "Pro 3"],
              "cons": ["Con 1", "Con 2"],
              "purchase_options": [
                {
                  "store": "Store name",
                  "price": "$XXX",
                  "availability": "In Stock/Out of Stock",
                  "url": "https://example.com",
                  "is_shopee": true/false
                }
              ],
              "alternatives": [
                {
                  "brand": "Alternative brand",
                  "model": "Alternative model", 
                  "reason": "Why it's a good alternative",
                  "price_comparison": "Price comparison info"
                }
              ],
              "social_sentiment": {
                "overall": ${(redditSentiment?.overall_percentage || 50) / 100},
                "positive": ${redditSentiment?.positive || 65},
                "neutral": ${redditSentiment?.neutral || 20},
                "negative": ${redditSentiment?.negative || 15},
                "recent_trend": "${redditSentiment?.recent_trend || 'stable'}",
                "total_posts_analyzed": ${redditSentiment?.total_posts_analyzed || 0},
                "top_mentions": ${JSON.stringify(redditSentiment?.top_mentions || [])}
              }
            }
            
            IMPORTANT: Return ONLY the JSON object, no additional text, no explanations, no code blocks.`
          },
          { 
            role: "user", 
            content: `Analyze ${brand} ${model}. User's specific question: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 429 || response.status === 402) {
        console.warn('API rate limit reached, using mock data with real Reddit sentiment');
        return getMockResponse(brand, model, question, category, redditSentiment);
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response received');
    
    try {
      const content = data.choices[0].message.content;
      console.log('Raw AI response received, length:', content.length);
      
      // Clean the content - remove any markdown code blocks and extract JSON
      let cleanContent = content.trim();
      
      // Remove markdown code blocks
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.split('```json')[1].split('```')[0].trim();
      } else if (cleanContent.includes('```')) {
        cleanContent = cleanContent.split('```')[1].split('```')[0].trim();
      }
      
      // Try to find JSON object in the text if it's not pure JSON
      if (!cleanContent.startsWith('{')) {
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanContent = jsonMatch[0];
        }
      }
      
      console.log('Cleaned content length:', cleanContent.length);
      
      // Parse the JSON
      const parsedResponse = JSON.parse(cleanContent);
      console.log('Successfully parsed JSON response');
      
      // Ensure social_sentiment is properly structured
      if (!parsedResponse.social_sentiment || typeof parsedResponse.social_sentiment !== 'object') {
        parsedResponse.social_sentiment = redditSentiment || {
          overall: 0.65,
          positive: 65,
          neutral: 20,
          negative: 15,
          recent_trend: 'stable',
          total_posts_analyzed: 0,
          top_mentions: []
        };
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw content that failed:', data.choices[0].message.content);
      
      // Return mock response with real Reddit data
      return getMockResponse(brand, model, question, category, redditSentiment);
    }
  } catch (error) {
    console.error('OpenRouter call failed:', error);
    const redditSentiment = await getRedditSentiment(brand, model);
    return getMockResponse(brand, model, question, category, redditSentiment);
  }
};

// Mock response function with real Reddit sentiment data
const getMockResponse = (brand, model, question, category, redditSentiment) => {
  const questionLower = question?.toLowerCase() || '';
  let keyPhrase = 'overall satisfaction';
  
  if (questionLower.includes('battery')) keyPhrase = 'battery life';
  else if (questionLower.includes('camera')) keyPhrase = 'camera quality';
  else if (questionLower.includes('price') || questionLower.includes('worth')) keyPhrase = 'value for money';
  else if (questionLower.includes('performance') || questionLower.includes('speed')) keyPhrase = 'performance';
  else if (questionLower.includes('screen') || questionLower.includes('display')) keyPhrase = 'display quality';
  else if (questionLower.includes('durable') || questionLower.includes('build')) keyPhrase = 'build quality';

  // Use real Reddit sentiment data if available
  const sentimentData = redditSentiment || {
    overall: 0.65,
    overall_percentage: 65,
    positive: 65,
    neutral: 20,
    negative: 15,
    recent_trend: 'stable',
    top_mentions: [],
    total_posts_analyzed: 0
  };

  // Build detailed summary
  let productAnalysis = `${brand} ${model} is a well-regarded product in the ${category || 'product'} category. `;
  productAnalysis += `Regarding ${keyPhrase}, the device delivers solid performance with good reliability and build quality. `;
  productAnalysis += `The features are competitive within its segment, offering good value for the price point.`;
  
  let redditInsights = '';
  if (sentimentData.total_posts_analyzed > 0) {
    const subreddits = [...new Set(sentimentData.top_mentions.map(m => m.subreddit))];
    redditInsights = ` Based on ${sentimentData.total_posts_analyzed} Reddit discussions across r/${subreddits.slice(0, 3).join(', r/')}, ${sentimentData.positive}% of posts are positive, ${sentimentData.negative}% express concerns. Community sentiment is ${sentimentData.recent_trend}.`;
  } else {
    redditInsights = ` No Reddit discussions found for this product yet.`;
  }

  const detailedSummary = productAnalysis + redditInsights;

  return {
    answer_to_question: `Based on general product analysis${sentimentData.total_posts_analyzed > 0 ? ` and ${sentimentData.total_posts_analyzed} Reddit discussions` : ''}, the ${brand} ${model} is a solid choice for ${keyPhrase}.`,
    detailed_summary: detailedSummary,
    rating_info: { 
      average_rating: sentimentData.total_posts_analyzed > 0 ? 3.5 + (sentimentData.overall_percentage / 100) : 4.2, 
      total_reviews: sentimentData.total_posts_analyzed || 847,
      rating_breakdown: {
        "5": Math.round(sentimentData.positive * 0.6),
        "4": Math.round(sentimentData.positive * 0.3),
        "3": Math.round(sentimentData.neutral),
        "2": Math.round(sentimentData.negative * 0.6),
        "1": Math.round(sentimentData.negative * 0.4)
      }
    },
    pros: [
      `Good ${keyPhrase}`,
      "Reliable performance",
      "Quality build",
      "Competitive pricing"
    ],
    cons: [
      "Could have better battery life",
      "Limited color options",
      "Premium price point"
    ],
    purchase_options: [
      {
        store: "Shopee",
        price: "$299-$399",
        availability: "In Stock",
        url: `https://shopee.sg/search?keyword=${encodeURIComponent(brand + ' ' + model)}`,
        is_shopee: true
      },
      {
        store: "Amazon",
        price: "$349",
        availability: "In Stock",
        url: `https://www.amazon.com/s?k=${encodeURIComponent(brand + ' ' + model)}`,
        is_shopee: false
      },
      {
        store: "Lazada",
        price: "$329",
        availability: "In Stock",
        url: `https://www.lazada.sg/catalog/?q=${encodeURIComponent(brand + ' ' + model)}`,
        is_shopee: false
      }
    ],
    alternatives: [
      {
        brand: brand === "Apple" ? "Samsung" : "Apple",
        model: brand === "Apple" ? "Galaxy S25" : "iPhone 16",
        reason: `Strong competitor with similar features`,
        price_comparison: "Similar price range"
      },
      {
        brand: brand,
        model: model + " Pro",
        reason: "Higher-end version with more features",
        price_comparison: "Premium version, ~$100 more"
      }
    ],
    social_sentiment: {
      overall: sentimentData.overall_percentage / 100,
      positive: sentimentData.positive,
      neutral: sentimentData.neutral,
      negative: sentimentData.negative,
      recent_trend: sentimentData.recent_trend,
      total_posts_analyzed: sentimentData.total_posts_analyzed,
      top_mentions: sentimentData.top_mentions.length > 0 ? sentimentData.top_mentions : []
    }
  };
};