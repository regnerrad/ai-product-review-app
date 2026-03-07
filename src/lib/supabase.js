import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        provider: 'email'
      }
    }
  })
  return { data, error }
}

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Profile functions
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { data, error }
}

// User session functions
export const createUserSession = async (userId, isLoggedIn = true) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert([
      { 
        user_id: userId, 
        profile_id: userId,
        is_logged_in: isLoggedIn,
        cart_items: []
      }
    ])
    .select()
  return { data, error }
}

export const updateUserSession = async (sessionId, updates) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .update(updates)
    .eq('id', sessionId)
  return { data, error }
}

export const getUserSessions = async (userId) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Search tracking
export const incrementSearchCount = async (userId) => {
  const { data, error } = await supabase.rpc('increment_search_count', {
    user_id: userId
  })
  return { data, error }
}

export const saveSearch = async (searchData) => {
  const { data, error } = await supabase
    .from('searches')
    .insert([searchData])
    .select()
  return { data, error }
}