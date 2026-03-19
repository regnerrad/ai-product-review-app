import { useState, useEffect } from "react";
import { createUserSessionInSupabase, updateUserSessionInSupabase, getUserSessionFromSupabase } from "../../services/userSessionService";
import { supabase } from "../../lib/supabase";

export function useSessionTracking() {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSession();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  const initializeSession = async () => {
    try {
      let sessionId = localStorage.getItem('productSenseSessionId');
      const user = await getCurrentUser();
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('productSenseSessionId', sessionId);
      }

      try {
        // Try to get existing session from Supabase
        let session = await getUserSessionFromSupabase(sessionId);
        
        if (!session) {
          // No existing session, create a new one
          session = await createUserSessionInSupabase({
            session_id: sessionId,
            user_id: user?.id || null,
            is_logged_in: !!user,
            search_count: 0,
            last_search_date: new Date().toISOString()
          });
        } else if (user && !session.user_id) {
          // Session exists but user just logged in - update with user_id
          session = await updateUserSessionInSupabase(session.id, {
            user_id: user.id,
            is_logged_in: true,
            last_visit: new Date().toISOString()
          });
        }

        setSessionData(session);
      } catch (supabaseError) {
        console.error("Supabase session error:", supabaseError);
        
        // Fallback: Create local session if Supabase fails
        const localSession = {
          id: `local_${Date.now()}`,
          session_id: sessionId,
          user_id: user?.id || null,
          is_logged_in: !!user,
          search_count: 0,
          first_search_date: new Date().toISOString(),
          last_search_date: new Date().toISOString(),
          requires_signup: false,
          visit_count: 1,
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString()
        };
        setSessionData(localSession);
      }
    } catch (error) {
      console.error("Session initialization error:", error);
    }
    setIsLoading(false);
  };

  const incrementSearchCount = async () => {
    if (!sessionData) return null;

    try {
      const newCount = (sessionData.search_count || 0) + 1;
      const requiresSignup = newCount >= 1;

      // Check if this is a local session (ID starts with 'local_')
      if (sessionData.id.toString().startsWith('local_')) {
        // Update local state only
        const updated = {
          ...sessionData,
          search_count: newCount,
          last_search_date: new Date().toISOString(),
          requires_signup: requiresSignup
        };
        setSessionData(updated);
        return updated;
      }

      // Try to update in Supabase
      try {
        const updatedSession = await updateUserSessionInSupabase(sessionData.id, {
          search_count: newCount,
          last_search_date: new Date().toISOString(),
          requires_signup: requiresSignup
        });

        setSessionData(updatedSession);
        return updatedSession;
      } catch (updateError) {
        console.error("Supabase update failed, using local state:", updateError);
        
        // Fallback to local state
        const updated = {
          ...sessionData,
          search_count: newCount,
          last_search_date: new Date().toISOString(),
          requires_signup: requiresSignup
        };
        setSessionData(updated);
        return updated;
      }
    } catch (error) {
      console.error("Error updating search count:", error);
      return null;
    }
  };

  const allowOneMoreSearch = async () => {
    if (!sessionData) return;

    // Check if this is a local session
    if (sessionData.id.toString().startsWith('local_')) {
      setSessionData({
        ...sessionData,
        requires_signup: false
      });
      return;
    }

    try {
      const updatedSession = await updateUserSessionInSupabase(sessionData.id, {
        requires_signup: false
      });
      setSessionData(updatedSession);
    } catch (error) {
      console.error("Error allowing one more search:", error);
      
      // Fallback: Update local state
      setSessionData({
        ...sessionData,
        requires_signup: false
      });
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