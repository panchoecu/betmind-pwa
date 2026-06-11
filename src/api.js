const API_URL = 'https://api.tuagentevirtual.info'


export const fetchDailyPicks = async () => {
  try {
    const r = await fetch(`${API_URL}/picks`)
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export const fetchTrackRecord = async () => {
  try {
    const r = await fetch(`${API_URL}/track-record`)
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export const fetchPicksResults = async (limit = 200) => {
  try {
    const r = await fetch(`${API_URL}/picks-results?limit=${limit}`)
    if (!r.ok) return []
    return await r.json()
  } catch { return [] }
}

export const fetchUser = async (chatId) => {
  try {
    const r = await fetch(`${API_URL}/user/${chatId}`)
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export const fetchHistory = async () => {
  try {
    const r = await fetch(`${API_URL}/history`)
    if (!r.ok) return []
    const data = await r.json()
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

/** Telegram chat_id only — never Supabase user.id (UUID). */
export function resolveChatId(user) {
  const rawChatId = user?.chat_id ?? null
  if (rawChatId == null || rawChatId === '') return null
  if (Number.isInteger(rawChatId)) return rawChatId
  const parsed = Number(rawChatId)
  return Number.isInteger(parsed) ? parsed : null
}

export function getApiMessage(data, lang = 'es') {
  const fallback = lang === 'es'
    ? 'No pudimos completar el análisis en este momento.'
    : 'We could not complete the analysis right now.'

  if (typeof data?.message === 'string') return data.message
  if (typeof data?.detail === 'string') return data.detail
  if (Array.isArray(data?.detail)) {
    return data.detail[0]?.msg || fallback
  }
  return fallback
}

export const analyzeMatch = async (input, lang = 'es', user = null) => {
  const connectionMsg = lang === 'es'
    ? 'No se pudo conectar con el servidor. Intenta de nuevo.'
    : 'Could not connect to the server. Please try again.'
  try {
    const parts = input.split(' vs ')
    if (parts.length < 2) {
      return {
        error: true,
        message: lang === 'es'
          ? 'Formato inválido. Usa: Equipo1 vs Equipo2'
          : 'Invalid format. Use: Team1 vs Team2',
      }
    }
    const date = new Date().toISOString().split('T')[0]
    const chatId = resolveChatId(user)
    const r = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        home_team: parts[0].trim(),
        away_team: parts[1].trim(),
        sport: 'football',
        date,
        chat_id: chatId,
        lang,
      }),
    })
    const data = await r.json().catch(() => ({}))

    if (!r.ok) {
      const message = getApiMessage(data, lang)
      const noPick = r.status === 422
        && data.success === false
        && typeof data.message === 'string'
      const notFound = r.status === 404
        && data.success === false
        && typeof data.message === 'string'
      return {
        success: false,
        noPick,
        notFound,
        status: r.status,
        message,
      }
    }

    return {
      ...data,
      success: true,
      pick: data.pick_principal || data.pick || '',
      odd: data.odd || data.odd_pick || data.score_global || '—',
      confianza: data.confianza || data.confidence || 0,
      ev: data.value_edge || data.ev || 0,
      analisis: data.analisis || data.analysis || data.full_analysis || '',
    }
  } catch {
    return { error: true, message: connectionMsg }
  }
}

export const LEAGUE_FLAGS = {
  1:'🏆', 2:'⭐', 3:'🟠', 10:'🤝', 11:'🔵', 13:'🟡', 15:'🌐', 16:'🟢', 848:'🟣',
  39:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', 40:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', 61:'🇫🇷', 62:'🇫🇷', 71:'🇧🇷', 72:'🇧🇷',
  78:'🇩🇪', 79:'🇩🇪', 88:'🇳🇱', 89:'🇳🇱', 94:'🇵🇹', 103:'🇳🇴',
  106:'🇵🇱', 113:'🇸🇪', 119:'🇩🇰', 128:'🇦🇷', 135:'🇮🇹', 140:'🇪🇸',
  141:'🇪🇸', 144:'🇧🇪', 162:'🇦🇹', 179:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', 188:'🇦🇺', 197:'🇬🇷',
  203:'🇹🇷', 207:'🇨🇭', 208:'🇨🇭', 239:'🇨🇴', 242:'🇪🇨', 250:'🇵🇾',
  253:'🇺🇸', 262:'🇲🇽', 265:'🇨🇱', 268:'🇺🇾', 271:'🇩🇰', 281:'🇵🇪',
  344:'🇧🇴', 345:'🇨🇿'
}

export const getFlag = (leagueId) => LEAGUE_FLAGS[leagueId] || '🌍'

export const confLabel = (conf, t) => {
  if (!conf) return '—'
  const n = parseFloat(conf)
  if (n >= 70) return t.high
  if (n >= 60) return t.medium
  return t.low
}

export const confColor = (conf) => {
  if (!conf) return '#888'
  const n = parseFloat(conf)
  if (n >= 70) return '#4ADE80'
  if (n >= 60) return '#D4A935'
  return '#C0142A'
}

export const evLabel = (ev, t) => {
  if (ev === null || ev === undefined || ev === '') return '—'
  const n = parseFloat(ev)
  if (!Number.isFinite(n) || n <= 0) return '—'
  const pct = `+${n.toFixed(1)}%`
  if (n >= 15) return `📈 ${pct} — ${t.excellent}`
  if (n >= 8)  return `📈 ${pct} — ${t.good}`
  if (n > 0)   return `📈 ${pct} — ${t.moderate}`
  return '—'
}

export const staking = (conf, ev, t) => {
  const c = parseFloat(conf) || 0
  const e = parseFloat(ev) || 0
  if (c >= 70 && e >= 10) return `3 ${t.units}`
  if (c >= 65 && e >= 5)  return `2 ${t.units}`
  return `1 ${t.unit || t.units}`
}

export const TODAY = new Date().toLocaleDateString('es-EC', {
  day:'2-digit', month:'2-digit', year:'numeric'
})

export const AGENT_STEPS = [
  'Recolectando datos del partido...',
  'Analizando forma reciente...',
  'Calculando H2H histórico...',
  'Modelo Poisson + Dixon-Coles...',
  'Calculando EV vs mercado...',
  'Generando análisis narrativo...',
  'Compilando resultado final...',
]