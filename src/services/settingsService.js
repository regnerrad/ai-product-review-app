import { supabase } from './supabaseClient';

export const getAppSettingsFromSupabase = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching settings:", error);
    throw error;
  }
  
  return data || null;
};

export const saveAppSettingsToSupabase = async (settings) => {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert([{
      shopee_affiliate_id: settings.shopee_affiliate_id,
      shopee_partner_id: settings.shopee_partner_id,
      shopee_api_enabled: settings.shopee_api_enabled,
      shopee_api_key: settings.shopee_api_key,
      shopee_api_secret: settings.shopee_api_secret,
      user_id: settings.userId
    }])
    .select()
    .single();

  if (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
  
  return data;
};