import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface SupabaseAnalysis {
  id: string
  user_id: string
  original_text: string
  prediction: string
  confidence: number
  overall_score: number
  flags: string[]
  signals: {
    ml_score: number
    sentiment_score: number
    clickbait_score: number
    source_score: number
    bias_score: number
  }
  source_domain?: string
  source_credibility?: string
  url?: string
  created_at: string
}

// Helper functions
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const getOrCreateAnonymousUser = async (): Promise<string> => {
  try {
    // Try to get existing user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      return user.id
    }

    // If no user, sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error('Error signing in anonymously:', error)
      throw error
    }

    return data.user?.id || ''
  } catch (error) {
    console.error('Error in getOrCreateAnonymousUser:', error)
    throw error
  }
}
