'use client'

import { create } from 'zustand'
import { createClientComponentClient }
  from '@supabase/auth-helpers-nextjs'

const useUserStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return
    
    const supabase = createClientComponentClient()
    
    try {
      const { data: { session } } = 
        await supabase.auth.getSession()
      
      if (!session) {
        set({ loading: false, initialized: true })
        return
      }

      set({ user: session.user })

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      set({ 
        profile, 
        loading: false,
        initialized: true 
      })
    } catch(e) {
      console.error('Store init error:', e)
      set({ loading: false, initialized: true })
    }
  },

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ 
    user: null, 
    profile: null,
    initialized: false 
  }),
  
  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createClientComponentClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) set({ profile })
  }
}))

export { useUserStore }
export default useUserStore
