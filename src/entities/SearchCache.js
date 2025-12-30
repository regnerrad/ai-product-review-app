// src/entities/SearchCache.js
export const createSearchCache = (data = {}) => {
  // REQUIRED FIELDS VALIDATION
  const required = ['search_key', 'brand', 'model', 'user_question', 'ai_response'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // QUESTION HASH GENERATION (if not provided)
  const generateQuestionHash = (question) => {
    // Simple hash for demonstration - you can use crypto if needed
    return btoa(question.toLowerCase().trim()).substring(0, 20);
  };

  // DEFAULT AI RESPONSE STRUCTURE
  const defaultAIResponse = {
    answer_to_question: "",
    detailed_summary: "",
    rating_info: {
      average_rating: 0,
      total_reviews: 0,
      rating_breakdown: {}
    },
    pros: [],
    cons: [],
    purchase_options: [],
    alternatives: []
  };

  // MERGE PROVIDED AI RESPONSE WITH DEFAULTS
  const aiResponse = {
    ...defaultAIResponse,
    ...data.ai_response,
    rating_info: {
      ...defaultAIResponse.rating_info,
      ...(data.ai_response?.rating_info || {})
    }
  };

  // CALCULATE CACHE EXPIRY (7 days from now by default)
  const calculateExpiry = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    return expiryDate.toISOString();
  };

  // RETURN COMPLETE SEARCH CACHE OBJECT
  return {
    // Required fields (validated above)
    search_key: data.search_key,
    brand: data.brand,
    model: data.model,
    user_question: data.user_question,
    ai_response: aiResponse,
    
    // Optional fields with defaults
    category: data.category || "",
    question_hash: data.question_hash || generateQuestionHash(data.user_question),
    ai_prompt: data.ai_prompt || "",
    
    // Usage tracking
    usage_count: data.usage_count || 1,
    last_used: data.last_used || new Date().toISOString(),
    cache_expires: data.cache_expires || calculateExpiry(),
    
    // Metadata
    id: data.id || `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
};

// HELPER: Generate search key from brand, model, and question
export const generateSearchKey = (brand, model, question) => {
  const normalized = `${brand.toLowerCase()}_${model.toLowerCase()}_${question.toLowerCase()}`;
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return `search_${Math.abs(hash).toString(36)}`;
};

// HELPER: Check if cache is expired
export const isCacheExpired = (cacheEntry) => {
  if (!cacheEntry.cache_expires) return true;
  return new Date() > new Date(cacheEntry.cache_expires);
};

// HELPER: Increment usage count
export const incrementUsage = (cacheEntry) => ({
  ...cacheEntry,
  usage_count: (cacheEntry.usage_count || 0) + 1,
  last_used: new Date().toISOString()
});

// Template for reference
export const SearchCacheTemplate = createSearchCache({
  search_key: "",
  brand: "",
  model: "",
  user_question: "",
  ai_response: {}
});

// Default export
export default createSearchCache;