// src/entities/ProductSearch.js
export const createProductSearch = (data = {}) => {
  // REQUIRED FIELDS - Must be provided
  const required = ['brand', 'model', 'user_question'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // CATEGORY VALIDATION
  const validCategories = [
    "smartphones", "laptops", "headphones", "cameras", "tablets",
    "smartwatches", "speakers", "gaming", "home_appliances", "other"
  ];
  
  const category = validCategories.includes(data.category) 
    ? data.category 
    : "other";

  // RETURN COMPLETE OBJECT
  return {
    // Required (from validation above)
    brand: data.brand,
    model: data.model,
    user_question: data.user_question,
    
    // Optional with defaults
    category: category,
    ai_summary: data.ai_summary || "",
    search_results: data.search_results || [],
    affiliate_links: data.affiliate_links || [],
    rating_summary: data.rating_summary || {
      average_rating: 0,
      total_reviews: 0,
      pros: [],
      cons: []
    },
    
    // Metadata (auto-generated if not provided)
    id: data.id || `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId || "",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
};

// Also export a template for reference
export const ProductSearchTemplate = createProductSearch({
  brand: "",
  model: "", 
  user_question: ""
});

// Default export (most common usage)
export default createProductSearch;