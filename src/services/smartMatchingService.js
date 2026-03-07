// Smart matching service with preference relaxation algorithms

// Define product categories and their key attributes
const productAttributes = {
  smartphones: {
    year: { weight: 0.3 },
    tier: { weight: 0.3, values: ['budget', 'mid-range', 'flagship', 'pro'] },
    screenSize: { weight: 0.15 },
    batteryLife: { weight: 0.15 },
    camera: { weight: 0.1 }
  },
  laptops: {
    year: { weight: 0.25 },
    tier: { weight: 0.25, values: ['budget', 'mid-range', 'premium', 'workstation', 'gaming'] },
    processor: { weight: 0.2 },
    ram: { weight: 0.15 },
    storage: { weight: 0.15 }
  },
  headphones: {
    year: { weight: 0.2 },
    tier: { weight: 0.2, values: ['budget', 'mid-range', 'premium', 'audiophile'] },
    type: { weight: 0.2, values: ['in-ear', 'on-ear', 'over-ear', 'true-wireless'] },
    noiseCancelling: { weight: 0.4 }
  },
  default: {
    year: { weight: 0.4 },
    tier: { weight: 0.3, values: ['budget', 'mid-range', 'premium'] },
    popularity: { weight: 0.3 }
  }
};

// Extract year from model name (e.g., "iPhone 15 Pro Max" -> 15)
const extractYear = (model) => {
  const match = model.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

// Determine product tier from model name
const determineTier = (model) => {
  const modelLower = model.toLowerCase();
  if (modelLower.includes('pro max') || modelLower.includes('ultra')) return 'pro';
  if (modelLower.includes('pro')) return 'premium';
  if (modelLower.includes('plus') || modelLower.includes('max')) return 'mid-range';
  if (modelLower.includes('lite') || modelLower.includes('se')) return 'budget';
  return 'mid-range'; // default
};

// Extract product category
const getCategory = (brand, model) => {
  // You can expand this logic based on your brand/category mapping
  if (['Apple', 'Samsung', 'Google', 'OnePlus'].includes(brand)) {
    if (model.toLowerCase().includes('iphone') || model.toLowerCase().includes('galaxy')) {
      return 'smartphones';
    }
  }
  if (['Dell', 'HP', 'Lenovo', 'ASUS'].includes(brand)) {
    return 'laptops';
  }
  if (['Sony', 'Bose', 'Sennheiser'].includes(brand)) {
    return 'headphones';
  }
  return 'default';
};

// Calculate similarity score between two products
const calculateSimilarity = (product1, product2, category) => {
  const attributes = productAttributes[category] || productAttributes.default;
  let score = 0;
  let totalWeight = 0;

  // Year similarity (closer years = higher score)
  if (attributes.year) {
    const year1 = extractYear(product1.model) || 0;
    const year2 = extractYear(product2.model) || 0;
    const yearDiff = Math.abs(year1 - year2);
    const yearScore = yearDiff <= 1 ? 1 : yearDiff <= 2 ? 0.7 : yearDiff <= 3 ? 0.4 : 0.1;
    score += yearScore * attributes.year.weight;
    totalWeight += attributes.year.weight;
  }

  // Tier similarity
  if (attributes.tier) {
    const tier1 = determineTier(product1.model);
    const tier2 = determineTier(product2.model);
    const tierValues = attributes.tier.values;
    const tierScore = tier1 === tier2 ? 1 : 0.5; // Same tier = 1, different = 0.5
    score += tierScore * attributes.tier.weight;
    totalWeight += attributes.tier.weight;
  }

  // Brand similarity (same brand preferred)
  const brandScore = product1.brand === product2.brand ? 1 : 0.3;
  score += brandScore * 0.2; // Brand weight
  totalWeight += 0.2;

  return totalWeight > 0 ? score / totalWeight : 0;
};

// Relax constraints gradually until we find matches
export const findAlternativesWithRelaxation = (targetProduct, allProducts, minScore = 0.5) => {
  const category = getCategory(targetProduct.brand, targetProduct.model);
  
  // Filter out the target product itself
  const candidates = allProducts.filter(p => 
    p.brand !== targetProduct.brand || p.model !== targetProduct.model
  );

  // Calculate similarity scores
  const scoredCandidates = candidates.map(product => ({
    ...product,
    similarityScore: calculateSimilarity(targetProduct, product, category)
  }));

  // Sort by similarity score (highest first)
  const sorted = scoredCandidates.sort((a, b) => b.similarityScore - a.similarityScore);

  // Group by relaxation level
  const results = {
    exact: [],      // Same brand, same tier, within 1 year
    close: [],      // Same brand, similar tier, within 2 years
    related: [],    // Different brand, same tier
    alternatives: [] // Everything else above minScore
  };

  sorted.forEach(product => {
    if (product.similarityScore >= 0.8) {
      results.exact.push(product);
    } else if (product.similarityScore >= 0.7) {
      results.close.push(product);
    } else if (product.similarityScore >= 0.6) {
      results.related.push(product);
    } else if (product.similarityScore >= minScore) {
      results.alternatives.push(product);
    }
  });

  return results;
};

// Get smart recommendations based on user's selection
export const getSmartAlternatives = (brand, model, allProducts) => {
  const targetProduct = { brand, model };
  const alternatives = findAlternativesWithRelaxation(targetProduct, allProducts);
  
  // Return top 5 alternatives across all categories
  return [
    ...alternatives.exact.slice(0, 2),
    ...alternatives.close.slice(0, 2),
    ...alternatives.related.slice(0, 1)
  ].slice(0, 5);
};

// Get all products from your models data
export const getAllProducts = (modelsByBrand) => {
  const products = [];
  Object.entries(modelsByBrand).forEach(([brand, models]) => {
    models.forEach(model => {
      products.push({ brand, model });
    });
  });
  return products;
};