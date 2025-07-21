import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function ensureUserProfile(user: User) {
  const supabase = createClient()
  
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking profile:', fetchError)
      return null
    }

    // If profile exists, return it
    if (existingProfile) {
      return existingProfile
    }

    // Create profile if it doesn't exist
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.email?.split('@')[0] || 
                   'User',
        avatar_url: user.user_metadata?.avatar_url || 
                    user.user_metadata?.picture || 
                    null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating profile:', insertError)
      return null
    }

    return newProfile
  } catch (error) {
    console.error('Error in ensureUserProfile:', error)
    return null
  }
}