import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Get or create a persistent session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('findo_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('findo_session_id', sessionId);
  }
  return sessionId;
};

// Get page referrer
const getReferrer = () => {
  return document.referrer || 'direct';
};

// Core tracking function
export const trackEvent = async (eventType, eventName, metadata = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const event = {
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_type: eventType,
      event_name: eventName,
      page_url: window.location.pathname + window.location.search,
      metadata: {
        ...metadata,
        referrer: getReferrer(),
        user_agent: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      }
    };
    
    // Fire and forget - don't await to avoid blocking UI
    supabase.from('user_events').insert([event]).then();
    
  } catch (error) {
    console.error('Tracking error:', error);
  }
};

// Page view tracking
export const trackPageView = (pageName) => {
  trackEvent('page_view', pageName);
};

// Click tracking
export const trackClick = (elementId, elementText, additionalMetadata = {}) => {
  trackEvent('click', elementId, {
    element_text: elementText,
    ...additionalMetadata
  });
};

// Search tracking
export const trackSearch = (brand, model, question, category = 'general') => {
  trackEvent('search', 'product_search', {
    brand,
    model,
    question,
    category,
    question_length: question?.length || 0
  });
};

// Purchase option clicks
export const trackPurchaseClick = (store, price, brand, model) => {
  trackEvent('click', 'purchase_option', {
    store,
    price,
    brand,
    model
  });
};

// Review link clicks
export const trackReviewLinkClick = (site, url, brand, model, linkType) => {
  trackEvent('click', 'review_link', {
    site,
    url,
    brand,
    model,
    link_type: linkType // 'expert', 'video', 'community', 'shopping'
  });
};

// Sign up tracking
export const trackSignUp = (method = 'email') => {
  trackEvent('conversion', 'sign_up', {
    method
  });
};

// Sign in tracking
export const trackSignIn = (method = 'email') => {
  trackEvent('conversion', 'sign_in', {
    method
  });
};

// Alternative product clicks
export const trackAlternativeClick = (altBrand, altModel, similarityScore) => {
  trackEvent('click', 'alternative_product', {
    brand: altBrand,
    model: altModel,
    similarity_score: similarityScore
  });
};

// Time on page tracking
export const trackTimeOnPage = (pageName, timeSeconds) => {
  trackEvent('engagement', 'time_on_page', {
    page: pageName,
    seconds: timeSeconds
  });
};

// Error tracking
export const trackError = (errorType, errorMessage, componentName) => {
  trackEvent('error', errorType, {
    message: errorMessage,
    component: componentName
  });
};