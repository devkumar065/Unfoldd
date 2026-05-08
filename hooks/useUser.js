'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient }
  from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export function useUser() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        // Get session
        const { data: { session }, error: sessionError } 
          = await supabase.auth.getSession()

        if (sessionError || !session) {
          if (mounted) {
            setLoading(false)
            setUser(null)
            setProfile(null)
          }
          return
        }

        if (mounted) setUser(session.user)

        // Get profile
        const { data: profileData, error: profileError } 
          = await supabase
          .from('profiles')
          .select(`
            id, full_name, email, avatar_url,
            college, year, branch, target_role,
            is_premium, premium_plan,
            streak_count, longest_streak,
            xp_points, level,
            onboarding_completed,
            last_active_at, notification_token,
            daily_time_minutes
          `)
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', 
            profileError)
          // Profile might not exist yet
          if (mounted) {
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setProfile(profileData)
          setLoading(false)

          // Update last_active_at
          supabase.from('profiles')
            .update({ 
              last_active_at: new Date().toISOString() 
            })
            .eq('id', session.user.id)
            .then(() => {}) // fire and forget
        }

      } catch(err) {
        console.error('useUser error:', err)
        if (mounted) setLoading(false)
      }
    }

    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = 
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          
          if (event === 'SIGNED_OUT' || !session) {
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }

          if (event === 'SIGNED_IN' || 
              event === 'TOKEN_REFRESHED') {
            setUser(session.user)
            loadUser()
          }
        }
      )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, profile, loading }
}

// Also export as default for compatibility
export default useUser
