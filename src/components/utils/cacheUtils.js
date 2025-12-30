// Replace Base44 imports with your own services
import { 
  getCacheResultFromSupabase, 
  saveCacheToSupabase, 
  updateCacheUsage, 
  getSimilarCachedResultsFromSupabase 
} from "../../services/cacheService";

// Simple hash function for questions
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Normalize question for better cache matching
function normalizeQuestion(question) {
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Generate cache key
export function generateCacheKey(brand, model, question) {
  const normalizedQuestion = normalizeQuestion(question);
  const questionHash = hashString(normalizedQuestion);
  return `${brand.toLowerCase()}_${model.toLowerCase()}_${questionHash}`;
}

// Check if cache exists and is valid
export async function getCachedResult(brand, model, question) {
  try {
    const cacheKey = generateCacheKey(brand, model, question);
    const cached = await getCacheResultFromSupabase(cacheKey);
    
    if (!cached) return null;
    
    const now = new Date();
    const expires = new Date(cached.cache_expires);
    
    // Check if cache is expired
    if (now > expires) {
      return null;
    }
    
    // Update usage stats
    await updateCacheUsage(cached.id, {
      usage_count: (cached.usage_count || 0) + 1
    });
    
    return {
      ...cached,
      ai_response: cached.ai_response || cached.ai_response_data
    };
  } catch (error) {
    console.error("Error checking cache:", error);
    return null;
  }
}

// Save result to cache
export async function saveToCache(brand, model, question, aiPrompt, aiResponse) {
  try {
    const cacheKey = generateCacheKey(brand, model, question);
    const questionHash = hashString(normalizeQuestion(question));
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const savedCache = await saveCacheToSupabase({
      search_key: cacheKey,
      brand,
      model,
      user_question: question,
      question_hash: questionHash,
      ai_prompt: aiPrompt,
      ai_response: aiResponse,
      usage_count: 1,
      last_used: now.toISOString(),
      cache_expires: expires.toISOString()
    });
    
    return savedCache;
  } catch (error) {
    console.error("Error saving to cache:", error);
    return false;
  }
}

// Find similar cached questions for the same product
export async function findSimilarCachedResults(brand, model, question, limit = 3) {
  try {
      const questionHash = "placeholder";
    
    // First try exact match
    const exactMatch = await getCachedResult(brand, model, question);
    if (exactMatch) return [exactMatch];
    
    // Then find similar questions for same product
    const similarResults = await getSimilarCachedResultsFromSupabase(brand, model, limit);
    
    return similarResults
      .filter(result => {
        const expires = new Date(result.cache_expires);
        return new Date() <= expires; // Only return non-expired results
      })
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)) // Sort by popularity
      .slice(0, limit);
      
  } catch (error) {
    console.error("Error finding similar results:", error);
    return [];
  }
}