import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLang, setLang } from '../i18n/translations'
import { supabase } from '../lib/supabase'

const useStore = create(
  persist(
    (set) => ({
      // Auth
      user:         null,
      authLoaded:   false,
      isPremium:    false,
      chatId:       null,
      premiumUntil: null,
      remaining:    null,

      // Data
      picks:      [],
      riskyPicks: [],
      stats:      null,

      // UI
      lang: getLang(),

      // Actions
      setUser:         (v) => set({ user: v }),
      setAuthLoaded:   (v) => set({ authLoaded: v }),
      setIsPremium:    (v) => set({ isPremium: v }),
      setChatId:       (v) => set({ chatId: v }),
      setPremiumUntil: (v) => set({ premiumUntil: v }),
      setRemaining:    (v) => set({ remaining: v }),
      setPicks:        (v) => set({ picks: v }),
      setRiskyPicks:   (v) => set({ riskyPicks: v }),
      setStats:        (v) => set({ stats: v }),
      setLang: (lang) => {
        setLang(lang)
        set({ lang })
      },

      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        })
        if (error) console.error('Google login error:', error.message)
      },

      loginWithEmail: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw error
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({
          user: null, isPremium: false,
          premiumUntil: null, remaining: null, chatId: null,
          picks: [], stats: null,
        })
      },
    }),
    {
      name: 'betmind-storage',
      partialize: (state) => ({
        user:         state.user,
        isPremium:    state.isPremium,
        chatId:       state.chatId,
        premiumUntil: state.premiumUntil,
        lang:         state.lang,
      }),
    }
  )
)

export default useStore