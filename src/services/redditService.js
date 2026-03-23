import axios from 'axios';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Reddit API base URL
const REDDIT_API_URL = 'https://www.reddit.com';
const USER_AGENT = 'FindoApp/1.0 (by /u/findo)';

export const getRedditPosts = async (brand, model, limit = 25) => {
  try {
    const searchQuery = `${brand} ${model}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Search Reddit for posts about the product
    const response = await axios.get(
      `${REDDIT_API_URL}/search.json?q=${encodedQuery}&limit=${limit}&sort=relevance&restrict_sr=false&t=all`,
      {
        headers: {
          'User-Agent': USER_AGENT
        }
      }
    );
    
    if (!response.data || !response.data.data || !response.data.data.children) {
      console.log('No Reddit posts found');
      return [];
    }
    
    const posts = response.data.data.children.map(child => {
      const data = child.data;
      return {
        id: data.id,
        title: data.title || '',
        text: data.selftext || '',
        subreddit: data.subreddit || 'unknown',
        score: data.score || 0,
        num_comments: data.num_comments || 0,
        created_utc: data.created_utc || Date.now() / 1000,
        url: data.permalink ? `https://reddit.com${data.permalink}` : '',
        author: data.author || 'unknown'
      };
    });
    
    console.log(`Found ${posts.length} Reddit posts for ${brand} ${model}`);
    return posts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
};

export const analyzeRedditSentiment = (posts) => {
  if (!posts || posts.length === 0) {
    return {
      overall: 0,
      overall_percentage: 50,
      positive: 0,
      neutral: 0,
      negative: 0,
      top_mentions: [],
      recent_trend: 'stable',
      total_posts_analyzed: 0
    };
  }
  
  let totalScore = 0;
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  const topPosts = [];
  
  posts.forEach(post => {
    // Combine title and text for analysis
    const content = `${post.title} ${post.text}`.toLowerCase();
    const result = sentiment.analyze(content);
    const score = result.comparative; // -1 to 1 scale
    
    totalScore += score;
    
    // Thresholds for sentiment classification
    if (score > 0.05) {
      positiveCount++;
    } else if (score < -0.05) {
      negativeCount++;
    } else {
      neutralCount++;
    }
    
    // Determine sentiment label
    let sentimentLabel = 'neutral';
    if (score > 0.1) sentimentLabel = 'positive';
    else if (score < -0.1) sentimentLabel = 'negative';
    
    // Store top posts by score magnitude
    topPosts.push({
      platform: 'Reddit',
      text: post.title.length > 120 ? post.title.substring(0, 120) + '...' : post.title,
      sentiment: sentimentLabel,
      score: post.score,
      comments: post.num_comments,
      subreddit: post.subreddit,
      url: post.url,
      author: post.author
    });
  });
  
  // Sort by absolute sentiment score
  topPosts.sort((a, b) => {
    const aValue = a.sentiment === 'positive' ? 1 : a.sentiment === 'negative' ? -1 : 0;
    const bValue = b.sentiment === 'positive' ? 1 : b.sentiment === 'negative' ? -1 : 0;
    return Math.abs(bValue) - Math.abs(aValue);
  });
  
  const total = posts.length;
  const overallScore = total > 0 ? totalScore / total : 0;
  
  // Determine trend based on recent posts
  const recentPosts = posts.slice(0, Math.min(10, posts.length));
  let recentScore = 0;
  recentPosts.forEach(post => {
    const content = `${post.title} ${post.text}`.toLowerCase();
    const result = sentiment.analyze(content);
    recentScore += result.comparative;
  });
  const avgRecentScore = recentPosts.length > 0 ? recentScore / recentPosts.length : overallScore;
  
  let recentTrend = 'stable';
  if (avgRecentScore > overallScore + 0.1) recentTrend = 'rising';
  else if (avgRecentScore < overallScore - 0.1) recentTrend = 'falling';
  
  // Convert overall score to percentage (0-100 scale)
  const overallPercentage = Math.min(100, Math.max(0, Math.round(((overallScore + 1) / 2) * 100)));
  
  return {
    overall: overallScore,
    overall_percentage: overallPercentage,
    positive: Math.round((positiveCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    negative: Math.round((negativeCount / total) * 100),
    top_mentions: topPosts.slice(0, 3).map(m => ({
      platform: m.platform,
      text: m.text,
      sentiment: m.sentiment,
      score: m.score,
      comments: m.comments,
      subreddit: m.subreddit,
      url: m.url
    })),
    recent_trend: recentTrend,
    total_posts_analyzed: total
  };
};

export const getRedditSentiment = async (brand, model) => {
  try {
    console.log(`Fetching Reddit posts for ${brand} ${model}...`);
    const posts = await getRedditPosts(brand, model, 50);
    
    if (posts.length === 0) {
      return {
        overall: 0,
        overall_percentage: 50,
        positive: 0,
        neutral: 0,
        negative: 0,
        top_mentions: [],
        recent_trend: 'stable',
        total_posts_analyzed: 0
      };
    }
    
    const sentimentData = analyzeRedditSentiment(posts);
    console.log('Reddit sentiment analysis complete:', sentimentData);
    return sentimentData;
  } catch (error) {
    console.error('Error getting Reddit sentiment:', error);
    return {
      overall: 0,
      overall_percentage: 50,
      positive: 0,
      neutral: 0,
      negative: 0,
      top_mentions: [],
      recent_trend: 'stable',
      total_posts_analyzed: 0
    };
  }
};