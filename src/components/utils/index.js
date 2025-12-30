// Re-export all functions from cacheUtils
export { 
  generateCacheKey,
  getCachedResult, 
  saveToCache,
  findSimilarCachedResults 
} from './cacheUtils';

// Re-export all functions from shopeeUtils  
export { 
  findManualAffiliateLink,
  generateShopeeAffiliateLink,
  getShopeeAffiliateLink
} from './shopeeUtils';

// Helper function for createPageUrl (since Layout.js needs it)
export const createPageUrl = (page) => {
  const pages = {
    "Home": "/",
    "History": "/history",
    "Settings": "/settings",
    "ManageAffiliate": "/manage-affiliate"
  };
  return pages[page] || "/";
};
