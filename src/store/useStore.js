import { create } from 'zustand'
import { getLang, setLang } from '../i18n/translations'

const useStore = create((set) => ({
  // Auth
  isPremium: false,
  chatId: null,
  premiumUntil: null,
  remaining: null,

  // Data
  picks: [],
  riskyPicks: [],
  stats: null,

  // UI
  lang: getLang(),

  // Actions
  setIsPremium: (v) => set({ isPremium: v }),
  setChatId: (v) => set({ chatId: v }),
  setPremiumUntil: (v) => set({ premiumUntil: v }),
  setRemaining: (v) => set({ remaining: v }),
  setPicks: (v) => set({ picks: v }),
  setRiskyPicks: (v) => set({ riskyPicks: v }),
  setStats: (v) => set({ stats: v }),
  setLang: (lang) => {
    setLang(lang)
    set({ lang })
  },
}))

export default useStore