import { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { fetchPicksResults, fetchHistory } from '../api'
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

export default function StatsScreen() {
  const { isPremium, stats, lang } = useStore()
  const t = translations[lang]

  const [subTab,      setSubTab]      = useState('resumen')
  const [filtro,      setFiltro]      = useState('todos')
  const [pickResults, setPickResults] = useState([])
  const [history,     setHistory]     = useState([])
  const [loading,     setLoading]     = useState(true)

  const s = stats || {
    mes: 'Mayo 2026', pct: 0, yield: 0, total: 0,
    ganados: 0, perdidos: 0, racha: 0, roi_mes: 0,
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchPicksResults(200), fetchHistory()]).then(([results, hist]) => {
      setPickResults(results)
      setHistory(hist)
      setLoading(false)
    })
  }, [])

  const filtered = pickResults.filter(p =>
    filtro === 'todos'   ? true :
    filtro === 'ganados' ? p.acertado === true :
    p.acertado === false
  )

  const maxPct = Math.max(...history.map(h => h.pct || 0), 1)

  /* ── WINRATE RING (visual grande) ──────────────────────── */
  const pct     = parseFloat(s.pct) || 0
  const radius  = 52
  const circ    = 2 * Math.PI * radius
  const offset  = circ - (pct / 100) * circ

  return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{t.trackRecord}</div>

      {/* ── HERO CARD ─────────────────────────────────────── */}
      <div className="stats-month-card">
        <div className="stats-verified-badge">
          ✅ {s.mes} — {lang === 'es' ? 'Verificado' : 'Verified'}
        </div>

        {/* BIG NUMBERS ROW */}
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

        {/* W / L / RACHA */}
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

        {/* WIN PROGRESS BAR */}
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
              {s.ganados} {lang === 'es' ? 'GANADOS' : 'WON'}
            </span>
            <span style={{ color: 'var(--crimson)' }}>
              {s.perdidos} {lang === 'es' ? 'PERDIDOS' : 'LOST'}
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
              ? 'Resultados verificados automáticamente cada noche vía API. Sin edición manual.'
              : 'Results automatically verified nightly via API. No manual editing.'}
          </div>

          <div style={{ height: 24 }} />
        </div>
      )}

      {/* ── PARTIDOS TAB ──────────────────────────────────── */}
      {subTab === 'partidos' && (
        <div className="partidos-content">
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

          {!loading && filtered.length === 0 && (
            <div className="empty-card">
              <div className="empty-icon">📋</div>
              <div className="empty-title">
                {lang === 'es' ? 'Sin resultados' : 'No results'}
              </div>
              <div className="empty-sub">{t.resultsAfter}</div>
            </div>
          )}

          {filtered.map((p, i) => (
            <div key={i} className={`result-card ${p.acertado ? 'won' : 'lost'}`}>
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
          ))}

          <div style={{ height: 24 }} />
        </div>
      )}
    </div>
  )
}