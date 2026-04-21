import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ user: null, profile: null }),
  setLoading: (isLoading) => set({ isLoading }),
}))