import axios from 'axios';
import Sentiment from 'sentiment';


const sentiment = new Sentiment();
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

console.log('YouTube API Key loaded:', YOUTUBE_API_KEY ? `Yes (starts with ${YOUTUBE_API_KEY.substring(0, 4)}...)` : 'No');

export const searchYouTubeVideos = async (query, maxResults = 5) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} review`,
        maxResults: maxResults,
        type: 'video',
        key: YOUTUBE_API_KEY,
        order: 'relevance'
      }
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
};

export const getVideoComments = async (videoId, maxComments = 50) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId: videoId,
        maxResults: Math.min(maxComments, 100),
        key: YOUTUBE_API_KEY,
        order: 'relevance'
      }
    });

    return response.data.items || [];
  } catch (error) {
    console.error(`Error fetching comments for video ${videoId}:`, error);
    return [];
  }
};

export const analyzeYouTubeSentiment = (comments) => {
  if (!comments || comments.length === 0) {
    return {
      overall: 0,
      overall_percentage: 50,
      positive: 0,
      neutral: 0,
      negative: 0,
      top_mentions: [],
      recent_trend: 'stable',
      total_comments_analyzed: 0
    };
  }

  let totalScore = 0;
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  const topComments = [];

  comments.forEach(comment => {
    const text = comment.snippet.topLevelComment.snippet.textDisplay;
    const result = sentiment.analyze(text);
    const score = result.comparative;

    totalScore += score;

    if (score > 0.05) {
      positiveCount++;
    } else if (score < -0.05) {
      negativeCount++;
    } else {
      neutralCount++;
    }

    let sentimentLabel = 'neutral';
    if (score > 0.1) sentimentLabel = 'positive';
    else if (score < -0.1) sentimentLabel = 'negative';

    topComments.push({
      platform: 'YouTube',
      text: text.length > 200 ? text.substring(0, 200) + '...' : text,
      sentiment: sentimentLabel,
      score: score,
      likes: comment.snippet.topLevelComment.snippet.likeCount,
      author: comment.snippet.topLevelComment.snippet.authorDisplayName,
      videoId: comment.snippet.videoId
    });
  });

  const total = comments.length;
  const overallScore = total > 0 ? totalScore / total : 0;
  const overallPercentage = Math.min(100, Math.max(0, Math.round(((overallScore + 1) / 2) * 100)));

  topComments.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return {
    overall: overallScore,
    overall_percentage: overallPercentage,
    positive: Math.round((positiveCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    negative: Math.round((negativeCount / total) * 100),
    top_mentions: topComments.slice(0, 3),
    recent_trend: 'stable',
    total_comments_analyzed: total
  };
};

export const getYouTubeSentiment = async (brand, model) => {
  try {
    const searchQuery = `${brand} ${model}`;
    console.log(`🎬 Searching YouTube for: ${searchQuery} reviews...`);

    const videos = await searchYouTubeVideos(searchQuery, 5);

    if (videos.length === 0) {
      console.log('No YouTube videos found');
      return null;
    }

    console.log(`Found ${videos.length} videos, fetching comments...`);

    let allComments = [];
    for (const video of videos.slice(0, 3)) {
      const comments = await getVideoComments(video.id.videoId, 30);
      allComments = [...allComments, ...comments];
      console.log(`- ${video.snippet.title}: ${comments.length} comments`);
    }

    console.log(`Total comments collected: ${allComments.length}`);

    if (allComments.length === 0) {
      return null;
    }

    const sentimentData = analyzeYouTubeSentiment(allComments);
    return sentimentData;
  } catch (error) {
    console.error('Error getting YouTube sentiment:', error);
    return null;
  }
};