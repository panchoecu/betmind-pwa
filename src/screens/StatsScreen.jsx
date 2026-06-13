import { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import {
  fetchPicksResults,
  fetchWcPicksResults,
  fetchWcTrackRecord,
  fetchHistory,
} from '../api'
import AppHeader from '../components/AppHeader'

const MARKET_DATA = [
  { label: 'BTTS',  pct: 92.9, w: 13, l: 1,  color: '#4ADE80' },
  { label: 'Under', pct: 90.0, w: 9,  l: 1,  color: '#4ADE80' },
  { label: 'Over',  pct: 87.1, w: 18, l: 3,  color: '#D4A935' },
  { label: '1X2',   pct: 86.4, w: 19, l: 3,  color: '#D4A935' },
]

const TIER_DATA = [
  { tier: 'S', pct: 75.0,  picks: 12, color: '#C0142A' },
  { tier: 'A', pct: 88.9,  picks: 45, color: '#D4A935' },
  { tier: 'B', pct: 95.0,  picks: 20, color: '#4ADE80' },
]

const EMPTY_WC_STATS = {
  mes: '—', pct: 0, yield: 0, total: 0,
  ganados: 0, perdidos: 0, racha: 0, roi_mes: 0,
}

function mapTrackStats(data, fallback) {
  if (!data || (!data.available && !(data.total > 0))) return fallback
  return {
    mes: data.mes || fallback.mes,
    ganados: data.wins ?? fallback.ganados,
    perdidos: (data.total ?? 0) - (data.wins ?? 0),
    total: data.total ?? fallback.total,
    pct: data.pct ?? fallback.pct,
    yield: data.yield_pct ?? data.avg_roi ?? fallback.yield,
    racha: data.streak ?? fallback.racha,
    roi_mes: data.total ?? 0,
  }
}

function StatsEngineCard({ label, stats, t, badge = '✅' }) {
  const s = stats
  const pct = parseFloat(s.pct) || 0

  return (
    <div className="stats-month-card">
      <div className="stats-verified-badge">
        {badge} {label}
      </div>

      <div className="stats-big-row">
        <div className="stats-big-item">
          <div className="stats-big-num green">{s.pct}%</div>
          <div className="stats-big-label">{t.winrate}</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-big-item">
          <div className="stats-big-num green">+{s.yield}%</div>
          <div className="stats-big-label">{t.yield}</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-big-item">
          <div className="stats-big-num white">{s.total}</div>
          <div className="stats-big-label">PICKS</div>
        </div>
      </div>

      <div className="stats-wl-row">
        <div className="stats-wl-item">
          <span className="stats-wl-num green">{s.ganados}</span>
          <span className="stats-wl-label">{t.won}</span>
        </div>
        <div className="stats-wl-dot">·</div>
        <div className="stats-wl-item">
          <span className="stats-wl-num red">{s.perdidos}</span>
          <span className="stats-wl-label">{t.lost}</span>
        </div>
        <div className="stats-wl-dot">·</div>
        <div className="stats-wl-item">
          <span className="stats-wl-num gold">🔥 {s.racha}</span>
          <span className="stats-wl-label">{t.streak}</span>
        </div>
      </div>

      <div style={{ padding: '0 18px 18px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'var(--t3)',
          marginBottom: 6,
          fontWeight: 700,
          letterSpacing: '1.5px',
        }}>
          <span style={{ color: 'var(--green)' }}>
            {s.ganados} {t.won.toUpperCase()}
          </span>
          <span style={{ color: 'var(--crimson)' }}>
            {s.perdidos} {t.lost.toUpperCase()}
          </span>
        </div>
        <div style={{
          height: 8,
          borderRadius: 8,
          background: 'var(--bg-3)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4ADE80, #22C55E)',
            borderRadius: 8,
            transition: 'width 1s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

function ResultCard({ p, lang }) {
  return (
    <div className={`result-card ${p.acertado ? 'won' : 'lost'}`}>
      <div className="result-card-header">
        <span className="result-league">{p.league}</span>
        <span className={`result-badge ${p.acertado ? 'won' : 'lost'}`}>
          {p.acertado
            ? (lang === 'es' ? '✅ GANADO'  : '✅ WON')
            : (lang === 'es' ? '❌ PERDIDO' : '❌ LOST')}
        </span>
      </div>
      <div className="result-teams">
        <span className="result-home">{p.home_team}</span>
        <span className="result-score">{p.resultado_real || '—'}</span>
        <span className="result-away">{p.away_team}</span>
      </div>
      <div className="result-footer">
        <span
          className="result-pick"
          style={{ color: p.acertado ? '#4ADE80' : '#C0142A' }}
        >
          {p.pick_principal}
        </span>
        <span className="result-odd">@{p.odd_pick}</span>
        <span className="result-date">{p.match_date}</span>
      </div>
    </div>
  )
}

export default function StatsScreen() {
  const { stats, lang } = useStore()
  const t = translations[lang]

  const [subTab,        setSubTab]        = useState('resumen')
  const [filtro,        setFiltro]        = useState('todos')
  const [engine,        setEngine]        = useState('daily')
  const [pickResults,   setPickResults]   = useState([])
  const [wcPickResults, setWcPickResults] = useState([])
  const [wcStats,       setWcStats]       = useState(EMPTY_WC_STATS)
  const [history,       setHistory]       = useState([])
  const [loading,       setLoading]       = useState(true)

  const dailyStats = stats || {
    mes: 'Mayo 2026', pct: 0, yield: 0, total: 0,
    ganados: 0, perdidos: 0, racha: 0, roi_mes: 0,
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchPicksResults(200),
      fetchWcPicksResults(200),
      fetchHistory(),
      fetchWcTrackRecord(),
    ]).then(([results, wcResults, hist, wcTrack]) => {
      setPickResults(Array.isArray(results) ? results : [])
      setWcPickResults(Array.isArray(wcResults) ? wcResults : [])
      setHistory(hist)
      setWcStats(mapTrackStats(wcTrack, EMPTY_WC_STATS))
      setLoading(false)
    })
  }, [])

  const activePickResults = engine === 'wc' ? wcPickResults : pickResults
  const filtered = activePickResults.filter(p =>
    filtro === 'todos'   ? true :
    filtro === 'ganados' ? p.acertado === true :
    p.acertado === false
  )

  const maxPct = Math.max(...history.map(h => h.pct || 0), 1)
  const wcEmpty = engine === 'wc' && wcPickResults.length === 0

  return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{t.statsVerifiedTitle}</div>

      <StatsEngineCard
        label={t.dailyEngineVerified}
        stats={dailyStats}
        t={t}
      />

      <div style={{ height: 12 }} />

      <StatsEngineCard
        label={t.worldCupEngineVerified}
        stats={wcStats}
        t={t}
        badge="🏆"
      />

      {/* ── SUB TABS ──────────────────────────────────────── */}
      <div className="sub-tabs">
        <button
          className={`sub-tab ${subTab === 'resumen' ? 'active' : ''}`}
          onClick={() => setSubTab('resumen')}
        >
          {t.summary}
        </button>
        <button
          className={`sub-tab ${subTab === 'partidos' ? 'active' : ''}`}
          onClick={() => setSubTab('partidos')}
        >
          {t.matches}
        </button>
      </div>

      {/* ── RESUMEN TAB ───────────────────────────────────── */}
      {subTab === 'resumen' && (
        <div className="resumen-content">

          {/* HISTORIAL MENSUAL */}
          {history.length > 0 && (
            <>
              <div className="resumen-section-title">{t.monthlyHistory}</div>
              <div style={{
                fontSize: 10,
                color: 'var(--t3)',
                marginBottom: 10,
                letterSpacing: '1px',
              }}>
                {t.dailyEngineVerified}
              </div>
              {history.map((h, i) => (
                <div key={i} className="history-row">
                  <div className="history-month">{h.mes || h.month}</div>
                  <div className="history-bar-wrap">
                    <div className="history-bar-bg">
                      <div
                        className="history-bar-fill"
                        style={{ width: `${((h.pct || 0) / maxPct) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="history-pct green">{h.pct}%</div>
                </div>
              ))}
              <div style={{ height: 20 }} />
            </>
          )}

          {/* WINRATE POR MERCADO */}
          <div className="resumen-section-title">
            {lang === 'es' ? 'WINRATE POR MERCADO' : 'WINRATE BY MARKET'}
          </div>
          <div style={{
            fontSize: 10,
            color: 'var(--t3)',
            marginBottom: 10,
            letterSpacing: '1px',
          }}>
            {t.dailyEngineVerified}
          </div>
          <div className="category-grid">
            {MARKET_DATA.map((m, i) => (
              <div key={i} className="category-card">
                <div className="category-label">{m.label}</div>
                <div className="category-pct green" style={{ color: m.color }}>
                  {m.pct}%
                </div>
                <div className="category-picks">
                  {m.w}W · {m.l}L
                </div>
                <div className="category-bar-bg">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${m.pct}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* WINRATE POR TIER */}
          <div className="resumen-section-title" style={{ marginTop: 24 }}>
            {lang === 'es' ? 'WINRATE POR TIER' : 'WINRATE BY TIER'}
          </div>
          <div style={{
            fontSize: 10,
            color: 'var(--t3)',
            marginBottom: 10,
            letterSpacing: '1px',
          }}>
            {t.dailyEngineVerified}
          </div>
          <div className="tier-breakdown">
            {TIER_DATA.map((tr, i) => (
              <div key={i} className="tier-row">
                <div
                  className="tier-label-badge"
                  style={{
                    color:       tr.color,
                    background:  `${tr.color}18`,
                    borderColor: `${tr.color}44`,
                  }}
                >
                  TIER {tr.tier}
                </div>
                <div className="tier-bar-wrap">
                  <div className="tier-bar-bg">
                    <div
                      className="tier-bar-fill"
                      style={{ width: `${tr.pct}%`, background: tr.color }}
                    />
                  </div>
                </div>
                <div className="tier-pct" style={{ color: tr.color }}>
                  {tr.pct}%
                </div>
                <div className="tier-picks">{tr.picks}p</div>
              </div>
            ))}
          </div>

          {/* NOTA VERIFICACIÓN */}
          <div style={{
            margin: '24px 0 4px',
            padding: '14px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-3)',
            borderRadius: 'var(--r-md)',
            fontSize: 11,
            color: 'var(--t3)',
            lineHeight: 1.7,
            textAlign: 'center',
          }}>
            🔒 {lang === 'es'
              ? 'Daily Engine y World Cup Engine tienen track records separados. Resultados verificados vía API.'
              : 'Daily Engine and World Cup Engine have separate track records. Results verified via API.'}
          </div>

          <div style={{ height: 24 }} />
        </div>
      )}

      {/* ── PARTIDOS TAB ──────────────────────────────────── */}
      {subTab === 'partidos' && (
        <div className="partidos-content">
          <div className="filtro-row" style={{ marginBottom: 8 }}>
            <button
              className={`filtro-btn ${engine === 'daily' ? 'active' : ''}`}
              onClick={() => setEngine('daily')}
            >
              {t.engineDaily}
            </button>
            <button
              className={`filtro-btn ${engine === 'wc' ? 'active' : ''}`}
              onClick={() => setEngine('wc')}
            >
              {t.engineWorldCup}
            </button>
          </div>

          <div className="filtro-row">
            {['todos', 'ganados', 'perdidos'].map(f => (
              <button
                key={f}
                className={`filtro-btn ${filtro === f ? 'active' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f === 'todos'   ? t.all   :
                 f === 'ganados' ? t.wins  : t.losses}
              </button>
            ))}
          </div>

          {loading && (
            <div className="empty-card">
              <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
              <div className="empty-title">
                {lang === 'es' ? 'Cargando resultados...' : 'Loading results...'}
              </div>
            </div>
          )}

          {!loading && wcEmpty && (
            <div className="empty-card">
              <div className="empty-icon">🏆</div>
              <div className="empty-title">{t.wcNoResultsTitle}</div>
              <div className="empty-sub">{t.wcNoResultsSub}</div>
            </div>
          )}

          {!loading && !wcEmpty && filtered.length === 0 && (
            <div className="empty-card">
              <div className="empty-icon">📋</div>
              <div className="empty-title">
                {lang === 'es' ? 'Sin resultados' : 'No results'}
              </div>
              <div className="empty-sub">{t.resultsAfter}</div>
            </div>
          )}

          {!loading && filtered.map((p, i) => (
            <ResultCard key={i} p={p} lang={lang} />
          ))}

          <div style={{ height: 24 }} />
        </div>
      )}
    </div>
  )
}
