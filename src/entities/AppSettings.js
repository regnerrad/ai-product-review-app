// src/entities/AppSettings.js
export const createAppSettings = (data = {}) => {
  // DEFAULT SETTINGS TEMPLATE
  const defaultSettings = {
    shopeeAffiliateId: "",
    shopeePartnerId: "",
    shopeeApiEnabled: false,
    shopeeApiKey: "",
    shopeeApiSecret: "",
    
    // Extended settings (beyond JSON schema)
    theme: "light",
    notificationsEnabled: true,
    maxSearchesPerDay: 10,
    defaultCurrency: "SGD",
    language: "en",
    
    // Affiliate settings
    commissionRate: 0.05, // 5% default commission
    affiliateNetwork: "shopee",
    
    // UI settings
    showPrices: true,
    showReviews: true,
    showAlternatives: true,
    compactMode: false
  };

  // VALIDATE SHOPEE AFFILIATE ID FORMAT
  const validateAffiliateId = (id) => {
    if (!id) return "";
    
    // Shopee affiliate IDs are typically numbers
    const cleaned = id.toString().replace(/\D/g, '');
    
    if (cleaned.length < 6) {
      console.warn("Shopee affiliate ID seems too short:", id);
    }
    
    return cleaned;
  };

  // VALIDATE API CREDENTIALS
  const validateApiCredentials = (settings) => {
    const hasApiKey = settings.shopeeApiKey && settings.shopeeApiKey.trim().length > 0;
    const hasApiSecret = settings.shopeeApiSecret && settings.shopeeApiSecret.trim().length > 0;
    
    // If API is enabled but credentials are missing, disable API
    if (settings.shopeeApiEnabled && (!hasApiKey || !hasApiSecret)) {
      console.warn("Shopee API enabled but credentials missing. Disabling API.");
      return {
        ...settings,
        shopeeApiEnabled: false
      };
    }
    
    // If credentials exist but API is disabled, suggest enabling
    if (hasApiKey && hasApiSecret && !settings.shopeeApiEnabled) {
      console.info("Shopee API credentials found but API is disabled.");
    }
    
    return settings;
  };

  // GENERATE AFFILIATE LINK HELPER
  const generateAffiliateLink = (productUrl, settings) => {
    if (!settings.shopeeAffiliateId || !settings.shopeePartnerId) {
      return productUrl; // Return original URL if no affiliate IDs
    }
    
    try {
      const url = new URL(productUrl);
      url.searchParams.set('c', settings.shopeeAffiliateId);
      url.searchParams.set('pid', settings.shopeePartnerId);
      url.searchParams.set('utm_source', 'productsense');
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('utm_campaign', 'product_recommendation');
      
      return url.toString();
    } catch (error) {
      console.error("Error generating affiliate link:", error);
      return productUrl;
    }
  };

  // MERGE USER DATA WITH DEFAULTS
  const mergedSettings = {
    ...defaultSettings,
    ...data,
    
    // Clean affiliate IDs
    shopeeAffiliateId: validateAffiliateId(data.shopeeAffiliateId || defaultSettings.shopeeAffiliateId),
    shopeePartnerId: data.shopeePartnerId || defaultSettings.shopeePartnerId,
    
    // Ensure boolean values
    shopeeApiEnabled: Boolean(data.shopeeApiEnabled),
    notificationsEnabled: Boolean(data.notificationsEnabled !== false),
    showPrices: Boolean(data.showPrices !== false),
    showReviews: Boolean(data.showReviews !== false),
    showAlternatives: Boolean(data.showAlternatives !== false),
    compactMode: Boolean(data.compactMode)
  };

  // VALIDATE AND ADJUST SETTINGS
  const validatedSettings = validateApiCredentials(mergedSettings);

  // RETURN ENHANCED APP SETTINGS OBJECT
  return {
    // Core Shopee settings
    ...validatedSettings,
    
    // Helper methods
    generateAffiliateLink: (productUrl) => 
      generateAffiliateLink(productUrl, validatedSettings),
    
    // Validation methods
    isValid: () => {
      const hasAffiliateId = validatedSettings.shopeeAffiliateId.length > 0;
      const hasPartnerId = validatedSettings.shopeePartnerId.length > 0;
      const hasValidApi = !validatedSettings.shopeeApiEnabled || 
        (validatedSettings.shopeeApiKey && validatedSettings.shopeeApiSecret);
      
      return hasAffiliateId && hasPartnerId && hasValidApi;
    },
    
    // API status
    apiStatus: () => {
      if (!validatedSettings.shopeeApiEnabled) return "disabled";
      if (!validatedSettings.shopeeApiKey || !validatedSettings.shopeeApiSecret) return "missing_credentials";
      return "active";
    },
    
    // Affiliate info summary
    getAffiliateSummary: () => ({
      hasAffiliateIds: validatedSettings.shopeeAffiliateId && validatedSettings.shopeePartnerId,
      apiEnabled: validatedSettings.shopeeApiEnabled,
      apiStatus: validatedSettings.apiStatus(),
      commissionRate: validatedSettings.commissionRate,
      totalPossibleCommission: "5-10%" // Example calculation
    }),
    
    // Metadata
    id: data.id || `settings_${Date.now()}`,
    userId: data.userId || "", // Tied to specific user
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    version: "1.0.0"
  };
};

// HELPER: Load settings from localStorage
export const loadLocalSettings = () => {
  if (typeof window === 'undefined') return createAppSettings();
  
  try {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      return createAppSettings(JSON.parse(saved));
    }
  } catch (error) {
    console.error("Error loading settings from localStorage:", error);
  }
  
  return createAppSettings();
};

// HELPER: Save settings to localStorage
export const saveLocalSettings = (settings) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove methods before saving
    const { generateAffiliateLink, isValid, apiStatus, getAffiliateSummary, ...saveable } = settings;
    localStorage.setItem('app_settings', JSON.stringify(saveable));
  } catch (error) {
    console.error("Error saving settings to localStorage:", error);
  }
};

// HELPER: Merge partial settings update
export const updateSettings = (currentSettings, updates) => {
  const updated = createAppSettings({
    ...currentSettings,
    ...updates,
    updatedAt: new Date().toISOString()
  });
  
  saveLocalSettings(updated);
  return updated;
};

// HELPER: Reset to defaults
export const resetToDefaults = (userId = "") => {
  const defaults = createAppSettings({ userId });
  saveLocalSettings(defaults);
  return defaults;
};

// HELPER: Validate Shopee credentials
export const validateShopeeCredentials = (settings) => {
  const errors = [];
  
  if (!settings.shopeeAffiliateId) {
    errors.push("Shopee Affiliate ID is required");
  }
  
  if (!settings.shopeePartnerId) {
    errors.push("Shopee Partner ID is required");
  }
  
  if (settings.shopeeApiEnabled) {
    if (!settings.shopeeApiKey) {
      errors.push("Shopee API Key is required when API is enabled");
    }
    if (!settings.shopeeApiSecret) {
      errors.push("Shopee API Secret is required when API is enabled");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Template for reference
export const AppSettingsTemplate = createAppSettings();

// Default export
export default createAppSettings;