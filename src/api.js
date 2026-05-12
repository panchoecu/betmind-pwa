const API_URL = 'https://api.tuagentevirtual.info'
const WEBHOOK_URL = 'https://webhook.tuagentevirtual.info'

export const fetchDailyPicks = async () => {
  try {
    const r = await fetch(`${API_URL}/picks`)
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export const fetchTrackRecord = async () => {
  try {
    const r = await fetch(`${WEBHOOK_URL}/track-record`)
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export const fetchPicksResults = async (limit = 100) => {
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

export const analyzeMatch = async (input, lang = 'es', user = null) => {
  try {
    const parts = input.split(' vs ')
    if (parts.length < 2) throw new Error('Formato inválido')
    const r = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        home_team: parts[0].trim(),
        away_team: parts[1].trim(),
        league: 'Auto',
        match_date: new Date().toISOString().split('T')[0],
        odds: { home: 0, draw: 0, away: 0 },
        lang: lang
      })
    })
    if (!r.ok) throw new Error('API error')
    const data = await r.json()
    return {
      ...data,
      pick: data.pick_principal || data.pick || '',
      odd: data.odd || data.odd_pick || data.score_global || '—',
      confianza: data.confianza || data.confidence || 0,
      ev: data.value_edge || data.ev || 0,
      analisis: data.analisis || data.analysis || data.full_analysis || '',
    }
  } catch (e) { return { error: e.message } }
}

export const LEAGUE_FLAGS = {
  39:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', 40:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', 61:'🇫🇷', 78:'🇩🇪', 79:'🇩🇪',
  88:'🇳🇱', 89:'🇳🇱', 94:'🇵🇹', 135:'🇮🇹', 140:'🇪🇸', 141:'🇪🇸',
  144:'🇧🇪', 162:'🇨🇷', 179:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', 188:'🇦🇺', 203:'🇹🇷',
  207:'🇨🇭', 210:'🇭🇷', 218:'🇦🇹', 239:'🇨🇴', 242:'🇪🇨', 250:'🇵🇾',
  253:'🇺🇸', 262:'🇲🇽', 265:'🇨🇱', 268:'🇺🇾', 281:'🇵🇪', 344:'🇧🇴',
  2:'🇪🇺', 3:'🇪🇺', 11:'🌎', 13:'🌎', 848:'🇪🇺'
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
  if (!ev) return '—'
  const n = parseFloat(ev)
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