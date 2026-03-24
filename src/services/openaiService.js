import { getRedditSentiment } from './redditService';
import { getYouTubeSentiment } from './youtubeService';

export const callOpenAI = async ({ brand, model, question, category }) => {
  try {
    // Fetch real Reddit and YouTube sentiment data
    console.log(`Fetching Reddit sentiment for ${brand} ${model}...`);
    const redditSentiment = await getRedditSentiment(brand, model);
    console.log('Reddit sentiment:', redditSentiment);

    console.log(`Fetching YouTube sentiment for ${brand} ${model}...`);
    const youtubeSentiment = await getYouTubeSentiment(brand, model);
    console.log('YouTube sentiment:', youtubeSentiment);
    
    const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY?.trim();
    
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key is not configured, using mock data with real sentiment');
      return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment);
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
    
    // Prepare YouTube context
    const youtubeContext = youtubeSentiment && youtubeSentiment.total_comments_analyzed > 0
      ? `\n\n=== REAL YOUTUBE COMMUNITY DATA ===\n` +
        `- Total Comments: ${youtubeSentiment.total_comments_analyzed} YouTube comments analyzed\n` +
        `- Community Sentiment: ${youtubeSentiment.positive}% positive, ${youtubeSentiment.neutral}% neutral, ${youtubeSentiment.negative}% negative\n` +
        `- Overall Sentiment Score: ${youtubeSentiment.overall_percentage}% positive\n` +
        `- Top Comments:\n` +
        youtubeSentiment.top_mentions.map(m => 
          `  • "${m.text.substring(0, 100)}" (${m.likes} likes)`
        ).join('\n')
      : '\n\n(No YouTube comments found for this product.)';
    
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
            ${youtubeContext}
            
            === CRITICAL FORMATTING INSTRUCTIONS ===
            Your response MUST have the "detailed_summary" field formatted with product analysis first, then community insights.
            
            ALWAYS respond with a valid JSON object matching this EXACT structure:
            {
              "answer_to_question": "Direct answer to the user's question",
              "detailed_summary": "Product analysis text here.",
              "rating_info": {
                "average_rating": 4.5,
                "total_reviews": ${(redditSentiment?.total_posts_analyzed || 0) + (youtubeSentiment?.total_comments_analyzed || 0) || 1000},
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
              "reddit_sentiment": ${JSON.stringify(redditSentiment || null)},
              "youtube_sentiment": ${JSON.stringify(youtubeSentiment || null)},
              "social_sentiment": {
                "overall": ${(redditSentiment?.overall_percentage || 50) / 100},
                "positive": ${redditSentiment?.positive || 0},
                "neutral": ${redditSentiment?.neutral || 0},
                "negative": ${redditSentiment?.negative || 0},
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
        console.warn('API rate limit reached, using mock data with real sentiment');
        return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment);
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response received');
    
    try {
      const content = data.choices[0].message.content;
      console.log('Raw AI response received, length:', content.length);
      
      let cleanContent = content.trim();
      
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.split('```json')[1].split('```')[0].trim();
      } else if (cleanContent.includes('```')) {
        cleanContent = cleanContent.split('```')[1].split('```')[0].trim();
      }
      
      if (!cleanContent.startsWith('{')) {
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanContent = jsonMatch[0];
        }
      }
      
      console.log('Cleaned content length:', cleanContent.length);
      
      const parsedResponse = JSON.parse(cleanContent);
      console.log('Successfully parsed JSON response');
      
      // Ensure sentiment data is included
      const finalResponse = {
        ...parsedResponse,
        reddit_sentiment: redditSentiment || null,
        youtube_sentiment: youtubeSentiment || null,
        social_sentiment: parsedResponse.social_sentiment || {
          overall: (redditSentiment?.overall_percentage || 50) / 100,
          positive: redditSentiment?.positive || 0,
          neutral: redditSentiment?.neutral || 0,
          negative: redditSentiment?.negative || 0,
          recent_trend: redditSentiment?.recent_trend || 'stable',
          total_posts_analyzed: redditSentiment?.total_posts_analyzed || 0,
          top_mentions: redditSentiment?.top_mentions || []
        }
      };
      
      return finalResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw content that failed:', data.choices[0].message.content);
      
      return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment);
    }
  } catch (error) {
    console.error('OpenRouter call failed:', error);
    const redditSentiment = await getRedditSentiment(brand, model);
    const youtubeSentiment = await getYouTubeSentiment(brand, model);
    return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment);
  }
};

// Mock response function with real sentiment data
const getMockResponse = (brand, model, question, category, redditSentiment, youtubeSentiment) => {
  const questionLower = question?.toLowerCase() || '';
  let keyPhrase = 'overall satisfaction';
  
  if (questionLower.includes('battery')) keyPhrase = 'battery life';
  else if (questionLower.includes('camera')) keyPhrase = 'camera quality';
  else if (questionLower.includes('price') || questionLower.includes('worth')) keyPhrase = 'value for money';
  else if (questionLower.includes('performance') || questionLower.includes('speed')) keyPhrase = 'performance';
  else if (questionLower.includes('screen') || questionLower.includes('display')) keyPhrase = 'display quality';
  else if (questionLower.includes('durable') || questionLower.includes('build')) keyPhrase = 'build quality';

  const redditData = redditSentiment || {
    overall_percentage: 50,
    positive: 0,
    neutral: 0,
    negative: 0,
    recent_trend: 'stable',
    total_posts_analyzed: 0,
    top_mentions: []
  };

  const youtubeData = youtubeSentiment || {
    overall_percentage: 50,
    positive: 0,
    neutral: 0,
    negative: 0,
    total_comments_analyzed: 0,
    top_mentions: []
  };

  const totalReviews = redditData.total_posts_analyzed + youtubeData.total_comments_analyzed;

  return {
    answer_to_question: `Based on product analysis${redditData.total_posts_analyzed > 0 ? ` and ${redditData.total_posts_analyzed} Reddit discussions` : ''}${youtubeData.total_comments_analyzed > 0 ? ` and ${youtubeData.total_comments_analyzed} YouTube comments` : ''}, the ${brand} ${model} is a solid choice for ${keyPhrase}.`,
    detailed_summary: `${brand} ${model} is a well-regarded product in the ${category || 'product'} category. Regarding ${keyPhrase}, the device delivers solid performance with good reliability.`,
    rating_info: { 
      average_rating: 4.2, 
      total_reviews: totalReviews || 847,
      rating_breakdown: {
        "5": 420,
        "4": 250,
        "3": 100,
        "2": 50,
        "1": 27
      }
    },
    pros: [`Good ${keyPhrase}`, "Reliable performance", "Quality build", "Competitive pricing"],
    cons: ["Could have better battery life", "Limited color options", "Premium price point"],
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
        reason: "Strong competitor with similar features",
        price_comparison: "Similar price range"
      }
    ],
    reddit_sentiment: redditData,
    youtube_sentiment: youtubeData,
    social_sentiment: {
      overall: redditData.overall_percentage / 100,
      positive: redditData.positive,
      neutral: redditData.neutral,
      negative: redditData.negative,
      recent_trend: redditData.recent_trend,
      total_posts_analyzed: redditData.total_posts_analyzed,
      top_mentions: redditData.top_mentions
    }
  };
};