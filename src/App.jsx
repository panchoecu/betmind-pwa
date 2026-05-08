import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useStore from './store/useStore'
import { supabase } from './lib/supabase'
import { fetchDailyPicks, fetchTrackRecord, fetchUser } from './api'
import BottomNav from './components/BottomNav'
import HomeScreen    from './screens/HomeScreen'
import PicksScreen   from './screens/PicksScreen'
import StatsScreen   from './screens/StatsScreen'
import PremiumScreen from './screens/PremiumScreen'
import AnalyzeScreen from './screens/AnalyzeScreen'
import LoginScreen   from './screens/LoginScreen'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const {
    user, setUser, authLoaded, setAuthLoaded,
    setIsPremium, setPremiumUntil, setRemaining,
    setChatId, setPicks, setRiskyPicks, setStats,
  } = useStore()

  const loadMarketData = () => {
    fetchDailyPicks().then(data => {
      if (!data) return
      if (data.top_picks?.length > 0) setPicks(data.top_picks)
      if (data.picks_arriesgados) setRiskyPicks(data.picks_arriesgados)
    })
    fetchTrackRecord().then(data => {
      if (!data?.available) return
      setStats({
        mes:      'Mayo 2026',
        ganados:  data.wins ?? 0,
        perdidos: (data.total - data.wins) ?? 0,
        total:    data.total ?? 0,
        pct:      data.pct ?? 0,
        yield:    data.yield_pct ?? data.avg_roi ?? 0,
        roi_mes:  Math.round((data.avg_roi ?? 0) * (data.total ?? 0)),
        racha:    data.streak ?? 0,
      })
    })
  }

  const loadUserPlan = async (supabaseUser) => {
    const urlParams   = new URLSearchParams(window.location.search)
    const urlChatId   = urlParams.get('chat_id')
    const savedChatId = localStorage.getItem('bm_chat_id')
    const chatId      = urlChatId
      ? parseInt(urlChatId)
      : savedChatId ? parseInt(savedChatId) : null

    if (chatId) {
      setChatId(chatId)
      localStorage.setItem('bm_chat_id', chatId)
      const data = await fetchUser(chatId)
      if (data?.plan === 'premium') {
        if (data.premium_until) {
          const exp = new Date(data.premium_until)
          if (exp > new Date()) { setIsPremium(true); setPremiumUntil(exp) }
        } else {
          setIsPremium(true)
        }
        setRemaining(15 - (data.analyses_today || 0))
        return
      }
      setRemaining(1 - (data?.analyses_today || 0))
    }

    // Verificar plan por email en la API
    const email = supabaseUser?.email
    if (email) {
      try {
        const res = await fetch(`https://api.tuagentevirtual.info/user/email/${encodeURIComponent(email)}`)
        const data = await res.json()
        if (data?.plan === 'premium') {
          if (data.premium_until) {
            const exp = new Date(data.premium_until)
            if (exp > new Date()) { setIsPremium(true); setPremiumUntil(exp) }
          } else {
            setIsPremium(true)
          }
          setRemaining(15 - (data.analyses_today || 0))
        }
      } catch (e) {
        console.error('Error verificando plan por email:', e)
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserPlan(session.user)
      }
      setAuthLoaded(true)
      loadMarketData()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          if (event === 'SIGNED_IN') loadUserPlan(session.user)
        } else {
          setUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (!authLoaded) {
    return (
      <div style={{
        height: '100dvh', background: '#05050C',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, letterSpacing: 4, color: '#F2F2FF' }}>
          Bet<span style={{ color: '#C0142A' }}>Mind</span>
        </div>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #181830', borderTop: '3px solid #C0142A',
          borderRadius: '50%', animation: 'spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <div className="app">
      <div className="content">
        <Routes>
          <Route path="/"        element={<HomeScreen />} />
          <Route path="/picks"   element={<PicksScreen />} />
          <Route path="/stats"   element={<StatsScreen />} />
          <Route path="/premium" element={<PremiumScreen />} />
          <Route path="/analyze" element={<AnalyzeScreen />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}