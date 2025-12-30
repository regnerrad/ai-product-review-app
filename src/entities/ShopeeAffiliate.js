// src/entities/ShopeeAffiliate.js
export const createShopeeAffiliate = (data = {}) => {
  // REQUIRED FIELDS VALIDATION
  const required = ['brand', 'model', 'affiliate_url'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // VALIDATE SHOPEE URL
  const validateShopeeUrl = (url) => {
    if (!url) return "";
    
    // Ensure it's a valid Shopee affiliate URL
    const shopeePatterns = [
      /^https?:\/\/(www\.)?shopee\.[a-z]{2,3}\//i,
      /^https?:\/\/(www\.)?s\.shopee\.[a-z]{2,3}\//i,
      /^https?:\/\/shp\.ee\//i
    ];
    
    const isValid = shopeePatterns.some(pattern => pattern.test(url));
    
    if (!isValid) {
      console.warn(`URL may not be a valid Shopee affiliate link: ${url.substring(0, 50)}...`);
    }
    
    return url.trim();
  };

  // EXTRACT SHOPEE PRODUCT ID
  const extractProductId = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('-');
      const lastPart = pathParts[pathParts.length - 1];
      
      // Shopee product IDs are usually numbers at the end of URL
      const productId = lastPart.match(/\d+/g)?.[0];
      return productId || null;
    } catch (error) {
      return null;
    }
  };

  // EXTRACT CAMPAIGN ID
  const extractCampaignId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('c') || null;
    } catch (error) {
      return null;
    }
  };

  // EXTRACT PARTNER ID
  const extractPartnerId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('pid') || null;
    } catch (error) {
      return null;
    }
  };

  // GENERATE SHORT URL (for display)
  const generateShortUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname.substring(0, 20)}...`;
    } catch (error) {
      return url.substring(0, 30) + '...';
    }
  };

  // CALCULATE COMMISSION (estimate)
  const calculateCommission = (price) => {
    if (!price) return "N/A";
    
    // Extract numeric value from price string
    const priceMatch = price.match(/\d+(\.\d+)?/);
    if (!priceMatch) return "N/A";
    
    const priceValue = parseFloat(priceMatch[0]);
    const commissionRate = 0.05; // 5% default commission
    const commission = priceValue * commissionRate;
    
    return `$${commission.toFixed(2)} (${(commissionRate * 100).toFixed(1)}%)`;
  };

  // VALIDATED AFFILIATE URL
  const validatedAffiliateUrl = validateShopeeUrl(data.affiliate_url);
  
  // EXTRACTED DATA FROM URL
  const productId = extractProductId(validatedAffiliateUrl);
  const campaignId = extractCampaignId(validatedAffiliateUrl);
  const partnerId = extractPartnerId(validatedAffiliateUrl);

  // NOW ISO TIMESTAMP
  const now = new Date().toISOString();

  // RETURN COMPLETE SHOPEE AFFILIATE OBJECT
  const affiliate = {
    // Required fields
    brand: data.brand.trim(),
    model: data.model.trim(),
    affiliate_url: validatedAffiliateUrl,
    
    // Optional fields with defaults
    original_url: data.original_url || "",
    price: data.price || "N/A",
    availability: data.availability || "In Stock",
    is_active: data.is_active !== false, // Default true
    notes: data.notes || "",
    
    // Extracted data
    product_id: productId,
    campaign_id: campaignId,
    partner_id: partnerId,
    
    // Tracking data
    clicks: data.clicks || 0,
    conversions: data.conversions || 0,
    last_clicked: data.last_clicked || null,
    created_date: data.created_date || now,
    
    // Performance metrics
    click_through_rate: data.click_through_rate || 0,
    conversion_rate: data.conversion_rate || 0,
    estimated_revenue: data.estimated_revenue || 0,
    
    // Helper methods
    getShortUrl: () => generateShortUrl(validatedAffiliateUrl),
    getCommissionEstimate: () => calculateCommission(data.price),
    isValid: () => productId !== null && campaignId !== null,
    
    // Link generation
    getTrackingUrl: () => {
      if (!validatedAffiliateUrl) return "";
      const url = new URL(validatedAffiliateUrl);
      url.searchParams.set('utm_source', 'productsense');
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('utm_campaign', `aff_${productId || 'unknown'}`);
      return url.toString();
    },
    
    // Status methods
    getStatus: () => {
      if (!affiliate.is_active) return "inactive";
      if (affiliate.availability !== "In Stock") return "out_of_stock";
      return "active";
    },
    
    // Metadata
    id: data.id || `aff_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId: data.userId || "", // Owner of this affiliate link
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };

  return affiliate;
};

// HELPER: Create from product search results
export const createFromProductSearch = (searchResult, affiliateUrl, userId = "") => {
  return createShopeeAffiliate({
    brand: searchResult.brand || "Unknown",
    model: searchResult.model || "Unknown",
    original_url: searchResult.url || "",
    affiliate_url: affiliateUrl,
    price: searchResult.price || "N/A",
    availability: searchResult.availability || "In Stock",
    notes: `Auto-generated from search: ${searchResult.query || ""}`,
    userId: userId
  });
};

// HELPER: Create from BulkUpload data
export const createFromBulkUpload = (rowData, userId = "") => {
  return createShopeeAffiliate({
    brand: rowData.brand || rowData.Brand || "",
    model: rowData.model || rowData.Model || "",
    original_url: rowData.original_url || rowData['Original URL'] || "",
    affiliate_url: rowData.affiliate_url || rowData['Affiliate URL'] || "",
    price: rowData.price || rowData.Price || "N/A",
    availability: rowData.availability || rowData.Availability || "In Stock",
    notes: rowData.notes || rowData.Notes || `Uploaded ${new Date().toLocaleDateString()}`,
    userId: userId
  });
};

// HELPER: Validate batch of affiliate links
export const validateBatch = (affiliates) => {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  };

  affiliates.forEach((affiliate, index) => {
    try {
      const validated = createShopeeAffiliate(affiliate);
      if (validated.isValid()) {
        results.valid.push(validated);
      } else {
        results.invalid.push({
          ...affiliate,
          error: "Invalid Shopee URL format"
        });
      }
    } catch (error) {
      results.invalid.push({
        ...affiliate,
        error: error.message
      });
      results.errors.push(`Row ${index + 1}: ${error.message}`);
    }
  });

  return results;
};

// HELPER: Track click event
export const trackClick = (affiliate) => {
  const clicks = (affiliate.clicks || 0) + 1;
  const now = new Date().toISOString();
  
  return {
    ...affiliate,
    clicks: clicks,
    last_clicked: now,
    updatedAt: now
  };
};

// HELPER: Track conversion
export const trackConversion = (affiliate, revenue = 0) => {
  const conversions = (affiliate.conversions || 0) + 1;
  const totalRevenue = (affiliate.estimated_revenue || 0) + revenue;
  const conversionRate = conversions / (affiliate.clicks || 1);
  
  return {
    ...affiliate,
    conversions: conversions,
    estimated_revenue: totalRevenue,
    conversion_rate: conversionRate,
    updatedAt: new Date().toISOString()
  };
};

// HELPER: Generate report
export const generateAffiliateReport = (affiliates) => {
  const active = affiliates.filter(a => a.is_active);
  const inactive = affiliates.filter(a => !a.is_active);
  
  const totalClicks = active.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const totalConversions = active.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const totalRevenue = active.reduce((sum, a) => sum + (a.estimated_revenue || 0), 0);
  
  return {
    summary: {
      total_affiliates: affiliates.length,
      active_affiliates: active.length,
      inactive_affiliates: inactive.length,
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      total_revenue: totalRevenue,
      overall_conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks) : 0
    },
    top_performers: active
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      .slice(0, 5)
      .map(a => ({
        brand: a.brand,
        model: a.model,
        clicks: a.clicks,
        conversions: a.conversions,
        revenue: a.estimated_revenue
      })),
    needs_attention: active.filter(a => 
      (a.clicks || 0) > 10 && (a.conversions || 0) === 0
    )
  };
};

// Template for reference
export const ShopeeAffiliateTemplate = createShopeeAffiliate({
  brand: "",
  model: "",
  affiliate_url: ""
});

// Default export
export default createShopeeAffiliate;