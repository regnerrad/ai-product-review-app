import { useState, useEffect } from "react";
import { createUserSessionInSupabase, updateUserSessionInSupabase, getUserSessionFromSupabase } from "../../services/userSessionService";

export function useSessionTracking() {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      let sessionId = localStorage.getItem('productSenseSessionId');
      
      if (!sessionId) {
        // Create new session for first-time user
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('productSenseSessionId', sessionId);
      }

      // Try to find existing session
      let session = await getUserSessionFromSupabase(sessionId);
      
      if (!session) {
        // Create new session record
        session = await createUserSessionInSupabase({
          session_id: sessionId,
          search_count: 0,
          first_search_date: new Date().toISOString(),
          last_search_date: new Date().toISOString(),
          requires_signup: false
        });
      }

      setSessionData(session);
    } catch (error) {
      console.error("Session initialization error:", error);
    }
    setIsLoading(false);
  };

  const incrementSearchCount = async () => {
    if (!sessionData) return null;

    try {
      const updatedSession = await updateUserSessionInSupabase(sessionData.id, {
        search_count: (sessionData.search_count || 0) + 1,
        last_search_date: new Date().toISOString(),
        requires_signup: (sessionData.search_count || 0) >= 1 // Require signup after 1st search
      });

      setSessionData(updatedSession);
      return updatedSession;
    } catch (error) {
      console.error("Error updating search count:", error);
      return null;
    }
  };

  const allowOneMoreSearch = async () => {
    if (!sessionData) return;

    try {
      const updatedSession = await updateUserSessionInSupabase(sessionData.id, {
        requires_signup: false
      });
      setSessionData(updatedSession);
    } catch (error) {
      console.error("Error allowing one more search:", error);
    }
  };

  return {
    sessionData,
    isLoading,
    incrementSearchCount,
    allowOneMoreSearch,
    refreshSession: initializeSession
  };
}