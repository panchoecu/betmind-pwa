import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useStore from './store/useStore'
import { fetchDailyPicks, fetchTrackRecord, fetchUser } from './api'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import PicksScreen from './screens/PicksScreen'
import StatsScreen from './screens/StatsScreen'
import PremiumScreen from './screens/PremiumScreen'
import AnalyzeScreen from './screens/AnalyzeScreen'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const {
    setChatId, setIsPremium, setPremiumUntil,
    setRemaining, setPicks, setRiskyPicks, setStats
  } = useStore()

  useEffect(() => {
    // GET CHAT ID
    const urlParams = new URLSearchParams(window.location.search)
    const urlChatId = urlParams.get('chat_id')
    const savedChatId = localStorage.getItem('bm_chat_id')
    const chatId = urlChatId
      ? parseInt(urlChatId)
      : savedChatId
      ? parseInt(savedChatId)
      : null

    if (chatId) {
      setChatId(chatId)
      localStorage.setItem('bm_chat_id', chatId)

      // LOAD USER
      fetchUser(chatId).then(data => {
        if (!data) return
        if (data.plan === 'premium') {
          if (data.premium_until) {
            const exp = new Date(data.premium_until)
            if (exp > new Date()) {
              setIsPremium(true)
              setPremiumUntil(exp)
            }
          } else {
            setIsPremium(true)
          }
        }
        const limit = data.plan === 'premium' ? 15 : 1
        setRemaining(limit - (data.analyses_today || 0))
      })
    }

    // LOAD PICKS
    fetchDailyPicks().then(data => {
      if (!data) return
      if (data.top_picks?.length > 0) setPicks(data.top_picks)
      if (data.picks_arriesgados) setRiskyPicks(data.picks_arriesgados)
    })

    // LOAD STATS
    fetchTrackRecord().then(data => {
      if (!data?.available) return
      setStats({
        mes: 'Mayo 2026',
        ganados: data.wins ?? 0,
        perdidos: (data.total - data.wins) ?? 0,
        total: data.total ?? 0,
        pct: data.pct ?? 0,
        yield: data.yield_pct ?? data.avg_roi ?? 0,
        roi_mes: Math.round((data.avg_roi ?? 0) * (data.total ?? 0)),
        racha: data.streak ?? 0,
      })
    })
  }, [])

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