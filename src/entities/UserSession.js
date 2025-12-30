// src/entities/UserSession.js
export const createUserSession = (data = {}) => {
  // REQUIRED FIELD VALIDATION
  if (!data.session_id) {
    throw new Error("UserSession requires session_id");
  }

  // GENERATE SESSION ID (if not provided)
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // CALCULATE IF SIGNUP REQUIRED (after 5 searches)
  const calculateSignupRequired = (searchCount) => {
    return searchCount >= 5; // Require signup after 5 searches
  };

  // GET CURRENT TIMESTAMP
  const now = new Date().toISOString();

  // DETERMINE FIRST/LAST SEARCH DATES
  let firstSearchDate = data.first_search_date;
  let lastSearchDate = data.last_search_date;
  
  // If this is a new search, update timestamps
  if (data.is_new_search) {
    if (!firstSearchDate) {
      firstSearchDate = now;
    }
    lastSearchDate = now;
  }

  // CALCULATE SEARCH COUNT
  const searchCount = data.search_count || 0;
  const updatedSearchCount = data.is_new_search ? searchCount + 1 : searchCount;

  // RETURN COMPLETE USER SESSION OBJECT
  return {
    // Required field
    session_id: data.session_id || generateSessionId(),
    
    // Search tracking
    search_count: updatedSearchCount,
    first_search_date: firstSearchDate || now,
    last_search_date: lastSearchDate || now,
    
    // Signup logic
    requires_signup: calculateSignupRequired(updatedSearchCount),
    
    // Additional useful fields (not in JSON but helpful)
    user_id: data.user_id || "", // Empty for anonymous, filled after signup
    is_anonymous: data.user_id ? false : true,
    device_info: data.device_info || {},
    ip_address: data.ip_address || "",
    
    // Metadata
    id: data.id || `us_${Date.now()}`,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
};

// HELPER: Get or create session from browser storage
export const getBrowserSession = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('user_session_id');
  let sessionData = localStorage.getItem('user_session_data');
  
  // Create new session if none exists
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_session_id', sessionId);
    
    const newSession = createUserSession({
      session_id: sessionId,
      search_count: 0,
      is_anonymous: true
    });
    
    localStorage.setItem('user_session_data', JSON.stringify(newSession));
    return newSession;
  }
  
  // Return existing session
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    // If corrupted, create new session
    const newSession = createUserSession({
      session_id: sessionId,
      search_count: 0
    });
    
    localStorage.setItem('user_session_data', JSON.stringify(newSession));
    return newSession;
  }
};

// HELPER: Increment search count for current session
export const incrementSessionSearch = (sessionData) => {
  return createUserSession({
    ...sessionData,
    session_id: sessionData.session_id,
    search_count: sessionData.search_count,
    is_new_search: true
  });
};

// HELPER: Convert anonymous session to registered user
export const upgradeToRegisteredUser = (sessionData, userId) => {
  return createUserSession({
    ...sessionData,
    user_id: userId,
    requires_signup: false // No longer requires signup
  });
};

// HELPER: Check if session is expired (24 hours inactivity)
export const isSessionExpired = (sessionData) => {
  if (!sessionData.last_search_date) return true;
  
  const lastSearch = new Date(sessionData.last_search_date);
  const now = new Date();
  const hoursDiff = (now - lastSearch) / (1000 * 60 * 60);
  
  return hoursDiff > 24; // Expire after 24 hours of inactivity
};

// HELPER: Format session for display
export const formatSessionInfo = (sessionData) => {
  const searchesLeft = Math.max(0, 5 - sessionData.search_count);
  
  return {
    sessionId: sessionData.session_id.substring(0, 8) + '...',
    isAnonymous: !sessionData.user_id,
    searchesPerformed: sessionData.search_count,
    searchesRemaining: searchesLeft,
    requiresSignup: sessionData.requires_signup,
    lastActivity: new Date(sessionData.last_search_date).toLocaleString()
  };
};

// Template for reference
export const UserSessionTemplate = createUserSession({
  session_id: ""
});

// Default export
export default createUserSession;