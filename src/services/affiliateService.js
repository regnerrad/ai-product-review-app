import { supabase } from './supabaseClient';

// ============================================
// Affiliate Link Generator for Findo
// Shopee Affiliate ID: 14316220003
// Amazon Associates ID: findoapp-22
// ============================================

const SHOPEE_AFFILIATE_ID = '14316220003';
const AMAZON_ASSOCIATE_ID = 'findoapp-22';

/**
 * Generates a Shopee affiliate search URL for a given brand + model
 */
export const getShopeeAffiliateLink = (brand, model) => {
  const searchQuery = `${brand} ${model}`;
  const shopeeSearchUrl = `https://shopee.sg/search?keyword=${encodeURIComponent(searchQuery)}`;
  return `https://s.shopee.sg/an_redir?origin_link=${shopeeSearchUrl}&affiliate_id=${SHOPEE_AFFILIATE_ID}&sub_id=findo`;
};

/**
 * Generates an Amazon.sg affiliate search URL for a given brand + model
 */
export const getAmazonAffiliateLink = (brand, model) => {
  const searchQuery = `${brand} ${model}`;
  return `https://www.amazon.sg/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_ASSOCIATE_ID}`;
};

/**
 * Returns both purchase options with affiliate links, ready to inject into AI response
 */
export const getAffiliatePurchaseOptions = (brand, model) => {
  return [
    {
      store: 'Shopee',
      price: 'Check Price',
      availability: 'In Stock',
      url: getShopeeAffiliateLink(brand, model),
      is_shopee: true
    },
    {
      store: 'Amazon',
      price: 'Check Price',
      availability: 'In Stock',
      url: getAmazonAffiliateLink(brand, model),
      is_shopee: false
    }
  ];
};

// ============================================
// Legacy Supabase functions (kept for backward compatibility)
// Used by shopeeUtils.js, BulkUpload.js, ManageAffiliate.js
// ============================================

export const findAffiliateLinkByBrandModel = async (brand, model) => {
  const { data, error } = await supabase
    .from('shopee_affiliates')
    .select('*')
    .eq('brand', brand)
    .eq('model', model)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error finding affiliate link:", error);
    throw error;
  }

  return data;
};

export const createAffiliateLinkInSupabase = async (linkData) => {
  const { data, error } = await supabase
    .from('shopee_affiliates')
    .insert(linkData)
    .select()
    .single();

  if (error) {
    console.error("Error creating affiliate link:", error);
    throw error;
  }

  return data;
};