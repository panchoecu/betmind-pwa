import { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { fetchPicksResults, fetchHistory } from '../api'
import AppHeader from '../components/AppHeader'

export default function StatsScreen() {
  const { isPremium, stats, lang } = useStore()
  const t = translations[lang]

  const [subTab, setSubTab] = useState('resumen')
  const [filtro, setFiltro] = useState('todos')
  const [pickResults, setPickResults] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const s = stats || {
    mes: 'Mayo 2026', pct: 0, yield: 0, total: 0,
    ganados: 0, perdidos: 0, racha: 0, roi_mes: 0
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchPicksResults(100),
      fetchHistory()
    ]).then(([results, hist]) => {
      setPickResults(results)
      setHistory(hist)
      setLoading(false)
    })
  }, [])

  const filtered = pickResults.filter(p =>
    filtro === 'todos' ? true :
    filtro === 'ganados' ? p.acertado === true :
    p.acertado === false
  )

  const maxPct = Math.max(...history.map(h => h.pct || 0), 1)

  return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{t.trackRecord}</div>

      {/* MAIN STATS CARD */}
      <div className="stats-month-card">
        <div className="stats-verified-badge">
          ✅ {s.mes} — {t.verified}
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
      </div>

      {/* SUB TABS */}
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

      {/* RESUMEN TAB */}
      {subTab === 'resumen' && (
        <div className="resumen-content">

          {/* WINRATE BY CATEGORY */}
          <div className="resumen-section-title">{t.monthlyHistory}</div>

          {history.length === 0 && !loading && (
            <div className="empty-card">
              <div className="empty-icon">📊</div>
              <div className="empty-title">Sin historial aún</div>
            </div>
          )}

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

          {/* CATEGORY BREAKDOWN */}
          <div className="resumen-section-title" style={{ marginTop: 20 }}>
            WINRATE POR MERCADO
          </div>
          <div className="category-grid">
            {[
              { label: 'BTTS', pct: 92.9, picks: 14 },
              { label: 'Under', pct: 90.0, picks: 10 },
              { label: '1X2', pct: 86.4, picks: 22 },
              { label: 'Over', pct: 87.1, picks: 31 },
            ].map((c, i) => (
              <div key={i} className="category-card">
                <div className="category-label">{c.label}</div>
                <div className="category-pct green">{c.pct}%</div>
                <div className="category-picks">{c.picks} picks</div>
                <div className="category-bar-bg">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* TIER BREAKDOWN */}
          <div className="resumen-section-title" style={{ marginTop: 20 }}>
            WINRATE POR TIER
          </div>
          <div className="tier-breakdown">
            {[
              { tier: 'S', pct: 75, picks: 12, color: '#C0142A' },
              { tier: 'A', pct: 88.9, picks: 45, color: '#D4A935' },
              { tier: 'B', pct: 95.0, picks: 20, color: '#4ADE80' },
            ].map((tr, i) => (
              <div key={i} className="tier-row">
                <div
                  className="tier-label-badge"
                  style={{ color: tr.color, background: `${tr.color}18`, borderColor: `${tr.color}44` }}
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
                <div className="tier-pct" style={{ color: tr.color }}>{tr.pct}%</div>
                <div className="tier-picks">{tr.picks}p</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARTIDOS TAB */}
      {subTab === 'partidos' && (
        <div className="partidos-content">
          <div className="filtro-row">
            {['todos', 'ganados', 'perdidos'].map(f => (
              <button
                key={f}
                className={`filtro-btn ${filtro === f ? 'active' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f === 'todos' ? t.all : f === 'ganados' ? t.wins : t.losses}
              </button>
            ))}
          </div>

          {loading && (
            <div className="empty-card">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Cargando resultados...</div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="empty-card">
              <div className="empty-icon">📋</div>
              <div className="empty-title">Sin resultados</div>
              <div className="empty-sub">{t.resultsAfter}</div>
            </div>
          )}

          {filtered.map((p, i) => (
            <div
              key={i}
              className={`result-card ${p.acertado ? 'won' : 'lost'}`}
            >
              <div className="result-card-header">
                <span className="result-league">{p.league}</span>
                <span className={`result-badge ${p.acertado ? 'won' : 'lost'}`}>
                  {p.acertado ? '✅ GANADO' : '❌ PERDIDO'}
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

          <div style={{ height: 20 }} />
        </div>
      )}
    </div>
  )
}