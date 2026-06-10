/**
 * PR-PWA-OD-1 — smoke tests for analyzeMatch() response mapping.
 * Run: node scripts/test-analyze-match.mjs
 */

const API_URL = 'https://api.tuagentevirtual.info'

async function analyzeMatchWithFetch(fetchImpl, input, lang = 'es', user = null) {
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
    const chatId = user?.id ?? user?.chat_id ?? null
    const r = await fetchImpl(`${API_URL}/analyze`, {
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
      const fallback = lang === 'es'
        ? 'No pudimos completar el análisis en este momento.'
        : 'We could not complete the analysis right now.'
      return {
        success: false,
        noPick: r.status === 422,
        notFound: r.status === 404,
        status: r.status,
        message: data.message || data.detail || fallback,
      }
    }

    return { ...data, success: true }
  } catch {
    return { error: true, message: connectionMsg }
  }
}

function assert(label, cond, detail = '') {
  if (!cond) throw new Error(`FAIL ${label}${detail ? `: ${detail}` : ''}`)
  console.log(`PASS ${label}`)
}

// Mock: 422 México vs Sudáfrica
const r422 = await analyzeMatchWithFetch(
  async () => ({
    ok: false,
    status: 422,
    json: async () => ({
      success: false,
      message: 'No encontramos una oportunidad con suficiente ventaja estadística para este partido.',
    }),
  }),
  'Mexico vs South Africa',
)
assert('422 noPick', r422.noPick === true && !r422.error, JSON.stringify(r422))
assert('422 not connection', !r422.error && r422.message.includes('oportunidad'))

// Mock: 404 partido inventado
const r404 = await analyzeMatchWithFetch(
  async () => ({
    ok: false,
    status: 404,
    json: async () => ({
      success: false,
      message: 'Partido no encontrado. Verifica nombres y fecha.',
    }),
  }),
  'Equipo Inventado A vs Equipo Inventado B',
)
assert('404 notFound', r404.notFound === true && !r404.error, JSON.stringify(r404))
assert('404 not connection', !r404.error && r404.message.includes('no encontrado'))

// Mock: red/timeout
const rNet = await analyzeMatchWithFetch(
  async () => { throw new TypeError('Failed to fetch') },
  'Barcelona vs Real Madrid',
)
assert('network error flag', rNet.error === true, JSON.stringify(rNet))
assert('network message', rNet.message.includes('conectar'), rNet.message)

console.log('\nAll mock tests passed.')
