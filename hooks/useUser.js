'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase/client'
import { useUserStore } from '../store/userStore'

export function useUser() {
  const { user, profile, setUser, setProfile, isLoading, setLoading, clearUser } = useUserStore()
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function fetchSession() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        if (session?.user) {
          if (mounted) setUser(session.user)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            if (profileError.code !== 'PGRST116') throw profileError // Allow no profile initially
          }

          if (mounted) {
            setProfile(profileData || null)
            if (profileData && profileData.onboarding_completed === false) {
              router.push('/onboarding')
            }
          }
        } else {
          if (mounted) clearUser()
        }
      } catch (err) {
        if (mounted) setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profileData || null)
        if (profileData && profileData.onboarding_completed === false) {
          router.push('/onboarding')
        }
      } else {
        clearUser()
        router.push('/auth/login')
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [setUser, setProfile, setLoading, clearUser, router])

  return { user, profile, loading: isLoading, error }
}