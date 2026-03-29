import { getRedditSentiment } from './redditService';
import { getYouTubeSentiment } from './youtubeService';

// Combine Reddit and YouTube sentiment data
const combineSentimentData = (reddit, youtube) => {
  const redditData = reddit || { positive: 0, neutral: 0, negative: 0, total_posts_analyzed: 0, top_mentions: [], recent_trend: 'stable', overall_percentage: 50 };
  const youtubeData = youtube || { positive: 0, neutral: 0, negative: 0, total_comments_analyzed: 0, top_mentions: [], recent_trend: 'stable', overall_percentage: 50 };

  const totalPosts = redditData.total_posts_analyzed || 0;
  const totalComments = youtubeData.total_comments_analyzed || 0;
  const combinedTotal = totalPosts + totalComments;

  if (combinedTotal === 0) {
    return {
      overall: 0,
      overall_percentage: 50,
      positive: 0,
      neutral: 0,
      negative: 0,
      recent_trend: 'stable',
      top_mentions: [],
      combined_total: 0,
      reddit_posts: 0,
      youtube_comments: 0
    };
  }

  const positive = (redditData.positive * totalPosts + youtubeData.positive * totalComments) / combinedTotal;
  const neutral = (redditData.neutral * totalPosts + youtubeData.neutral * totalComments) / combinedTotal;
  const negative = (redditData.negative * totalPosts + youtubeData.negative * totalComments) / combinedTotal;

  const overall = (positive - negative) / 100;
  const overall_percentage = Math.round(((overall + 1) / 2) * 100);

  const allMentions = [
    ...(redditData.top_mentions || []).map(m => ({
      ...m,
      platform: 'Reddit',
      likes: m.score,
      text: m.text
    })),
    ...(youtubeData.top_mentions || []).map(m => ({
      ...m,
      platform: 'YouTube',
      text: m.text
    }))
  ];

  allMentions.sort((a, b) => (b.likes || b.score || 0) - (a.likes || a.score || 0));
  const topMentions = allMentions.slice(0, 3);

  const trendWeights = { rising: 1, falling: -1, stable: 0 };
  const redditTrend = trendWeights[redditData.recent_trend] || 0;
  const youtubeTrend = trendWeights[youtubeData.recent_trend] || 0;
  const combinedTrendScore = (redditTrend * totalPosts + youtubeTrend * totalComments) / combinedTotal;

  let recent_trend = 'stable';
  if (combinedTrendScore > 0.2) recent_trend = 'rising';
  else if (combinedTrendScore < -0.2) recent_trend = 'falling';

  return {
    overall,
    overall_percentage,
    positive: Math.round(positive),
    neutral: Math.round(neutral),
    negative: Math.round(negative),
    recent_trend,
    top_mentions: topMentions,
    combined_total: combinedTotal,
    reddit_posts: totalPosts,
    youtube_comments: totalComments
  };
};

export const callOpenAI = async ({ brand, model, question, category }) => {
  try {
    console.log(`Fetching Reddit sentiment for ${brand} ${model}...`);
    const redditSentiment = await getRedditSentiment(brand, model);
    console.log('Reddit sentiment:', redditSentiment);

    console.log(`Fetching YouTube sentiment for ${brand} ${model}...`);
    const youtubeSentiment = await getYouTubeSentiment(brand, model);
    console.log('YouTube sentiment:', youtubeSentiment);

    const combinedSentiment = combineSentimentData(redditSentiment, youtubeSentiment);
    console.log('Combined sentiment:', combinedSentiment);

    const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY?.trim();

    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key is not configured, using mock data with real sentiment');
      return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment, combinedSentiment);
    }

    const redditContext = redditSentiment && redditSentiment.total_posts_analyzed > 0
      ? `Reddit: ${redditSentiment.total_posts_analyzed} posts. ${redditSentiment.positive}% positive, ${redditSentiment.neutral}% neutral, ${redditSentiment.negative}% negative. Trend: ${redditSentiment.recent_trend}.`
      : 'No Reddit data.';

    const youtubeContext = youtubeSentiment && youtubeSentiment.total_comments_analyzed > 0
      ? `YouTube: ${youtubeSentiment.total_comments_analyzed} comments. ${youtubeSentiment.positive}% positive, ${youtubeSentiment.neutral}% neutral, ${youtubeSentiment.negative}% negative.`
      : 'No YouTube data.';

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
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a product expert. Analyze ${brand} ${model}${category ? ` (${category})` : ''}.

Community data:
${redditContext}
${youtubeContext}

Return ONLY a valid JSON object — no markdown, no code blocks, no extra text:
{
  "answer_to_question": "brief answer",
  "detailed_summary": "5-6 sentence in-depth analysis covering build quality, performance, key features, value proposition, and how community sentiment aligns with expert opinion",
  "rating_info": {
    "average_rating": 4.5,
    "total_reviews": 1000
  },
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "purchase_options": [
    {
      "store": "Store name",
      "price": "$XXX",
      "availability": "In Stock",
      "url": "https://example.com",
      "is_shopee": false
    }
  ],
  "alternatives": [
    {
      "brand": "Brand",
      "model": "Model",
      "reason": "Why this is a good alternative",
      "price_comparison": "Price comparison"
    }
  ]
}

Rules:
- pros: exactly 3 items
- cons: exactly 2 items
- purchase_options: exactly 2 stores
- alternatives: exactly 1 item
- rating_info: only average_rating and total_reviews, no breakdown`
          },
          {
            role: "user",
            content: `Question: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);

      if (response.status === 429 || response.status === 402) {
        console.warn('API rate limit reached, using mock data with real sentiment');
        return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment, combinedSentiment);
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

      // Truncation guard — if JSON doesn't close properly, fall back to mock
      if (!cleanContent.endsWith('}')) {
        console.warn('Response appears truncated, falling back to mock');
        return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment, combinedSentiment);
      }

      const parsedResponse = JSON.parse(cleanContent);
      console.log('Successfully parsed JSON response');

      const finalResponse = {
        ...parsedResponse,
        reddit_sentiment: redditSentiment || null,
        youtube_sentiment: youtubeSentiment || null,
        social_sentiment: combinedSentiment
      };

      return finalResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw content that failed (first 500 chars):', data.choices[0].message.content.substring(0, 500));
      return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment, combinedSentiment);
    }
  } catch (error) {
    console.error('OpenRouter call failed:', error);
    const redditSentiment = await getRedditSentiment(brand, model);
    const youtubeSentiment = await getYouTubeSentiment(brand, model);
    const combinedSentiment = combineSentimentData(redditSentiment, youtubeSentiment);
    return getMockResponse(brand, model, question, category, redditSentiment, youtubeSentiment, combinedSentiment);
  }
};

const getMockResponse = (brand, model, question, category, redditSentiment, youtubeSentiment, combinedSentiment) => {
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
  const combined = combinedSentiment || { positive: 0, neutral: 0, negative: 0, combined_total: 0 };

  return {
    answer_to_question: `Based on analysis of ${combined.combined_total || 0} community discussions, the ${brand} ${model} is a strong choice for users prioritizing ${keyPhrase}. Community feedback shows ${combined.positive}% positive sentiment, indicating general satisfaction with the product's performance and reliability.`,
    detailed_summary: `The ${brand} ${model} delivers impressive performance in the ${category || 'product'} category. Key strengths include excellent ${keyPhrase}, reliable build quality, and competitive pricing. Community feedback from ${redditData.total_posts_analyzed} Reddit discussions and ${youtubeData.total_comments_analyzed} YouTube comments shows ${combined.positive}% positive sentiment. Users consistently praise the device's ${keyPhrase} and overall user experience, while noting some minor concerns about battery life and premium pricing for higher-end configurations.`,
    rating_info: {
      average_rating: combined.positive > 0 ? (combined.positive / 20) : 4.2,
      total_reviews: totalReviews || 847
    },
    pros: [
      `Excellent ${keyPhrase} performance with consistent results`,
      "Reliable build quality and durable construction",
      "Competitive pricing for the features offered"
    ],
    cons: [
      "Battery life could be improved for heavy usage",
      "Premium price point for higher-end models"
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
        model: brand === "Apple" ? "Galaxy S25 Ultra" : "iPhone 16 Pro",
        reason: `Strong competitor with comparable ${keyPhrase} performance and similar feature set`,
        price_comparison: "Similar price range"
      }
    ],
    reddit_sentiment: redditData,
    youtube_sentiment: youtubeData,
    social_sentiment: combinedSentiment || {
      overall: 0,
      overall_percentage: 50,
      positive: 0,
      neutral: 0,
      negative: 0,
      recent_trend: 'stable',
      top_mentions: [],
      combined_total: 0,
      reddit_posts: 0,
      youtube_comments: 0
    }
  };
};