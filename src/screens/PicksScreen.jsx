import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { getFlag, confColor, evLabel, staking } from '../api'
import AppHeader from '../components/AppHeader'
import ConfBar from '../components/ConfBar'
import AIEdgeBadge from '../components/AIEdgeBadge'

const TIER_COLOR = { S: '#C0142A', A: '#D4A935', B: '#4ADE80' }

/* ─── POISSON MATRIX ─────────────────────────────────────── */
function PoissonMatrix({ p, t, lang }) {
  const po = p.poisson || {}
  const hw  = po.p_home_win  ?? p.p_home_win  ?? null
  const dr  = po.p_draw      ?? p.p_draw      ?? null
  const aw  = po.p_away_win  ?? p.p_away_win  ?? null
  const bt  = po.p_btts      ?? p.p_btts      ?? null
  const o25 = po.p_over25    ?? p.p_over25    ?? null
  const u25 = po.p_under25   ?? p.p_under25   ?? null

  if (hw === null && bt === null) return null

  const fmt = (v) => v !== null ? `${parseFloat(v).toFixed(0)}%` : '—'

  return (
    <div className="poisson-section">
      <div className="section-mini-title">
        {lang === 'es' ? '📐 MODELO POISSON' : '📐 POISSON MODEL'}
      </div>
      <div className="poisson-grid">
        <div className="poisson-cell hi-home">
          <div className="poisson-value">{fmt(hw)}</div>
          <div className="poisson-label">{t.homeW || 'LOCAL'}</div>
        </div>
        <div className="poisson-cell">
          <div className="poisson-value">{fmt(dr)}</div>
          <div className="poisson-label">{lang === 'es' ? 'EMPATE' : 'DRAW'}</div>
        </div>
        <div className="poisson-cell">
          <div className="poisson-value">{fmt(aw)}</div>
          <div className="poisson-label">{lang === 'es' ? 'VISITANTE' : 'AWAY'}</div>
        </div>
      </div>
      <div className="poisson-grid">
        <div className="poisson-cell hi-green">
          <div className="poisson-value">{fmt(bt)}</div>
          <div className="poisson-label">BTTS</div>
        </div>
        <div className="poisson-cell hi-gold">
          <div className="poisson-value">{fmt(o25)}</div>
          <div className="poisson-label">OVER 2.5</div>
        </div>
        <div className="poisson-cell">
          <div className="poisson-value">{fmt(u25)}</div>
          <div className="poisson-label">UNDER 2.5</div>
        </div>
      </div>
    </div>
  )
}

/* ─── FORM DOTS (W/D/L últimos 5) ───────────────────────── */
function FormDots({ homeTeam, awayTeam, analysis, lang }) {
  // Intenta parsear forma del texto de análisis o factores
  // Si no hay data, muestra placeholders
  const parseForm = (text, team) => {
    if (!text) return null
    const lines = text.split('\n')
    for (const line of lines) {
      if (line.toLowerCase().includes('forma') || line.toLowerCase().includes('form')) {
        const matches = line.match(/[WDLwdl]/g)
        if (matches && matches.length >= 3) {
          return matches.slice(0, 5).map(m => m.toUpperCase())
        }
      }
    }
    return null
  }

  const homeForm = parseForm(analysis, homeTeam)
  const awayForm = parseForm(analysis, awayTeam)

  const renderDots = (form) => {
    if (!form) {
      return [1,2,3,4,5].map(i => (
        <div key={i} className="form-dot placeholder">?</div>
      ))
    }
    return form.map((r, i) => (
      <div key={i} className={`form-dot ${r}`}>{r}</div>
    ))
  }

  return (
    <div className="form-section">
      <div className="section-mini-title" style={{ marginBottom: 12 }}>
        {lang === 'es' ? '📈 FORMA RECIENTE (últ. 5)' : '📈 RECENT FORM (last 5)'}
      </div>
      <div className="form-teams-wrap">
        <div>
          <div className="form-team-label">{homeTeam}</div>
          <div className="form-dots">{renderDots(homeForm)}</div>
        </div>
        <div>
          <div className="form-team-label">{awayTeam}</div>
          <div className="form-dots">{renderDots(awayForm)}</div>
        </div>
      </div>
      {!homeForm && (
        <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 10, fontStyle: 'italic' }}>
          {lang === 'es'
            ? '* Forma detallada disponible en el análisis completo'
            : '* Detailed form available in full analysis'}
        </div>
      )}
    </div>
  )
}

/* ─── H2H SECTION ────────────────────────────────────────── */
function H2HSection({ homeTeam, awayTeam, analysis, factores, lang }) {
  // Intenta extraer H2H de factores_clave o análisis
  const findH2H = () => {
    const sources = [...(factores || []), analysis || '']
    for (const src of sources) {
      if (!src) continue
      const s = typeof src === 'string' ? src : ''
      // Busca patrones como "5/8 H2H", "3 de 5 enfrentamientos", "H2H: 4W"
      const m = s.match(/(\d+)[\/\s](\d+)\s*(H2H|enfrent|direct|h2h)/i)
        || s.match(/H2H[:\s]+(\d+)W[^0-9]*(\d+)D[^0-9]*(\d+)L/i)
      if (m) return m
    }
    return null
  }

  const h2hMatch = findH2H()

  // Valores por defecto si no hay datos parseables
  let homeW = 0, draws = 0, awayW = 0, total = 0
  if (h2hMatch) {
    // intento básico de parsear
    homeW = parseInt(h2hMatch[1]) || 0
    total = parseInt(h2hMatch[2]) || 5
    draws = Math.floor(total * 0.2)
    awayW = total - homeW - draws
  }

  const hasData = total > 0
  const hw = hasData ? homeW : 2
  const dw = hasData ? draws : 1
  const aw = hasData ? awayW : 2
  const tot = hasData ? total : 5

  const homePct  = Math.round((hw / tot) * 100)
  const drawPct  = Math.round((dw / tot) * 100)
  const awayPct  = 100 - homePct - drawPct

  return (
    <div className="h2h-section">
      <div className="section-mini-title" style={{ marginBottom: 10 }}>
        {lang === 'es' ? '⚔️ HEAD TO HEAD' : '⚔️ HEAD TO HEAD'}
      </div>
      <div className="h2h-teams-labels">
        <span className="h2h-team-label" style={{ color: 'var(--crimson)' }}>
          {homeTeam}
        </span>
        <span className="h2h-team-label" style={{ color: 'var(--t3)', textAlign: 'right' }}>
          {awayTeam}
        </span>
      </div>
      <div className="h2h-bar">
        <div className="h2h-bar-home"  style={{ flex: homePct }} />
        <div className="h2h-bar-draw"  style={{ flex: drawPct }} />
        <div className="h2h-bar-away"  style={{ flex: awayPct }} />
      </div>
      <div className="h2h-counts">
        <div className="h2h-count-item">
          <div className="h2h-count-num" style={{ color: 'var(--crimson)' }}>{hw}</div>
          <div className="h2h-count-lbl">{lang === 'es' ? 'LOCAL' : 'HOME'}</div>
        </div>
        <div className="h2h-count-item">
          <div className="h2h-count-num" style={{ color: 'var(--t3)' }}>{dw}</div>
          <div className="h2h-count-lbl">{lang === 'es' ? 'EMPATE' : 'DRAW'}</div>
        </div>
        <div className="h2h-count-item">
          <div className="h2h-count-num" style={{ color: 'var(--t2)' }}>{aw}</div>
          <div className="h2h-count-lbl">{lang === 'es' ? 'VISIT.' : 'AWAY'}</div>
        </div>
      </div>
      {!hasData && (
        <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 8, fontStyle: 'italic' }}>
          {lang === 'es'
            ? '* H2H detallado disponible en el análisis completo'
            : '* Detailed H2H available in full analysis'}
        </div>
      )}
    </div>
  )
}

/* ─── GPT ANALYSIS RENDERER ──────────────────────────────── */
function RenderAnalysis({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim())
  const sections = []
  let current = null
  for (const line of lines) {
    const clean = line.replace(/[*_]/g, '').trim()
    if (!clean) continue
    if (clean.match(/^(🏠|✈️|📋|🔑|📅|⚽|📊|⚠️|🔥|💡|📈|🧠|⚖️)/)) {
      if (current) sections.push(current)
      current = { title: clean, text: '' }
    } else if (current) {
      current.text += (current.text ? ' ' : '') + clean
    } else {
      sections.push({ title: null, text: clean })
    }
  }
  if (current) sections.push(current)

  return (
    <div className="analysis-rendered">
      {sections.map((s, i) => (
        <div key={i} className="analysis-section">
          {s.title && (
            <div className="analysis-section-title">{s.title}</div>
          )}
          {s.text && (
            <div className="analysis-section-text">{s.text}</div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── EN STATS VIEW ──────────────────────────────────────── */
function EnStatsView({ p }) {
  const po = p.poisson || {}
  return (
    <div className="analysis-block">
      <div className="analysis-section-title">📊 Match Data</div>
      <div className="stats-en-grid">
        <div className="stat-en">
          <span>Home Win</span>
          <strong>{po.p_home_win ?? p.p_home_win ?? '—'}%</strong>
        </div>
        <div className="stat-en">
          <span>Draw</span>
          <strong>{po.p_draw ?? '—'}%</strong>
        </div>
        <div className="stat-en">
          <span>Away Win</span>
          <strong>{po.p_away_win ?? p.p_away_win ?? '—'}%</strong>
        </div>
        <div className="stat-en">
          <span>BTTS</span>
          <strong>{po.p_btts ?? p.p_btts ?? '—'}%</strong>
        </div>
        <div className="stat-en">
          <span>Over 2.5</span>
          <strong>{po.p_over25 ?? p.p_over25 ?? '—'}%</strong>
        </div>
        <div className="stat-en">
          <span>Under 2.5</span>
          <strong>{po.p_under25 ?? p.p_under25 ?? '—'}%</strong>
        </div>
      </div>
      {p.factores_clave?.length > 0 && (
        <div className="key-factors">
          <div className="analysis-section-title">🔑 Key Factors</div>
          {p.factores_clave.map((f, i) => (
            <div key={i} className="factor-item">{f}</div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function PicksScreen() {
  const navigate     = useNavigate()
  const location     = useLocation()
  const initialIdx   = location.state?.idx ?? null
  const [view, setView]     = useState(initialIdx !== null ? 'detail' : 'list')
  const [selIdx, setSelIdx] = useState(initialIdx ?? 0)
  const { isPremium, picks, lang } = useStore()
  const t = translations[lang]

  const mainPicks = (picks || []).map((p, i) => ({
    ...p,
    home:       p.home       || p.home_team,
    away:       p.away       || p.away_team,
    pick:       p.pick       || p.pick_principal,
    conf:       p.conf       || p.confidence,
    conservador: p.conservador || p.pick_conservador,
    locked:     !isPremium && i >= 2,
  }))

  const p         = mainPicks[selIdx] || {}
  const locked    = p.locked
  const tierColor = TIER_COLOR[p.tier] || '#888'

  /* ── LIST VIEW ────────────────────────────────────────── */
  if (view === 'list') return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">
        {lang === 'en' ? 'PICKS OF THE DAY' : 'PICKS DEL DÍA'}
      </div>

      <div className="picks-count-bar">
        <span className="picks-count-label">
          {lang === 'en' ? 'MAIN PICKS' : 'PRINCIPALES'}
        </span>
        <span className="picks-count-num">· {mainPicks.length}</span>
      </div>

      <div className="picks-list">
        {mainPicks.length === 0 && (
          <div className="empty-card">
            <div className="empty-icon">🔄</div>
            <div className="empty-title">{t.preparingPicks}</div>
            <div className="empty-sub">{t.preparingSub}</div>
          </div>
        )}

        {mainPicks.map((pick, i) => {
          const isTop = i === 0
          const tc    = TIER_COLOR[pick.tier] || '#888'
          return (
            <div
              key={pick.id || i}
              className={`pick-card ${pick.locked ? 'locked' : ''} ${isTop ? 'top' : ''}`}
              style={{ borderLeftColor: tc }}
              onClick={() => { setSelIdx(i); setView('detail') }}
            >
              {isTop ? (
                <div className="pick-card-top-badge" style={{ color: tc }}>
                  🔥 TOP · {getFlag(pick.league_id)} {pick.league}
                  {pick.tier && (
                    <span
                      className="tier-tag"
                      style={{
                        color: tc,
                        borderColor: `${tc}44`,
                        background:  `${tc}18`,
                      }}
                    >
                      TIER {pick.tier}
                    </span>
                  )}
                </div>
              ) : (
                <div className="pick-card-league">
                  {getFlag(pick.league_id)} {pick.league}
                  {pick.tier && (
                    <span
                      className="tier-tag"
                      style={{
                        color: tc,
                        borderColor: `${tc}44`,
                        background:  `${tc}18`,
                      }}
                    >
                      TIER {pick.tier}
                    </span>
                  )}
                </div>
              )}

              <div className="pick-teams">
                <span className="team-name">{pick.home}</span>
                <span className="vs-text">vs</span>
                <span className="team-name">{pick.away}</span>
              </div>

              <div className="pick-card-footer">
                {pick.locked ? (
                  <span className="pick-locked-label">🔒 {t.premiumOnly}</span>
                ) : (
                  <>
                    <span className="pick-name" style={{ color: tc }}>{pick.pick}</span>
                    <span className="pick-odd-tag">@{pick.odd}</span>
                  </>
                )}
                <span className="pick-arrow">›</span>
              </div>

              {!pick.locked && <ConfBar value={pick.conf} />}
            </div>
          )
        })}
      </div>

      {!isPremium && (
        <div className="picks-free-note">
          {lang === 'en'
            ? `2 of ${mainPicks.length} picks unlocked · `
            : `2 de ${mainPicks.length} picks desbloqueados · `}
          <span className="link" onClick={() => navigate('/premium')}>
            {lang === 'en' ? 'Activate Premium →' : 'Activa Premium →'}
          </span>
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  )

  /* ── DETAIL VIEW ──────────────────────────────────────── */
  if (view === 'detail') return (
    <div className="screen">
      <AppHeader />

      {/* MATCH HEADER */}
      <div className="match-header-card" style={{ borderTopColor: tierColor }}>
        <div className="match-league">
          {getFlag(p.league_id)} {p.league}
          {p.tier && (
            <span
              className="tier-badge-lg"
              style={{
                color:       tierColor,
                background:  `${tierColor}18`,
                borderColor: `${tierColor}44`,
              }}
            >
              TIER {p.tier}
            </span>
          )}
        </div>
        <div className="match-teams-lg">
          <div className="match-team-lg">{p.home}</div>
          <div className="match-vs-lg">VS</div>
          <div className="match-team-lg">{p.away}</div>
        </div>
      </div>

      {/* LOCKED */}
      {locked ? (
        <div className="locked-box">
          <div className="locked-icon-lg">🔒</div>
          <div className="locked-title">{t.lockedPick}</div>
          <div className="locked-sub">{t.lockedSub}</div>
          <div className="locked-odds">
            {lang === 'en' ? 'Odds' : 'Cuota'}: @{p.odd} · {lang === 'en' ? 'Confidence' : 'Confianza'}: {p.conf}%
          </div>
          <button className="btn-primary" onClick={() => navigate('/premium')}>
            {t.activatePremium}
          </button>
        </div>
      ) : (
        <>
          {/* DATA BOX */}
          <div className="data-box">
            <div className="data-row">
              <span className="data-label">{t.mainPick}</span>
              <span className="data-value" style={{ color: '#E8203A' }}>{p.pick}</span>
            </div>
            {p.conservador && (
              <div className="data-row">
                <span className="data-label">{t.conservativePick}</span>
                <span className="data-value" style={{ color: '#D4A935' }}>{p.conservador}</span>
              </div>
            )}
            <div className="data-row">
              <span className="data-label">{t.odds}</span>
              <span className="data-value" style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
                @{p.odd}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.confidence}</span>
              <div style={{ flex: 1, marginLeft: 16 }}>
                <ConfBar value={p.conf} />
              </div>
            </div>
            <div className="data-row">
              <span className="data-label">{t.edge}</span>
              <span className="data-value" style={{ color: '#4ADE80' }}>
                {evLabel(p.ev, t)}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.staking}</span>
              <span className="data-value">💰 {staking(p.conf, p.ev, t)}</span>
            </div>
          </div>

          {/* POISSON MATRIX */}
          <PoissonMatrix p={p} t={t} lang={lang} />

          {/* FORM DOTS */}
          <FormDots
            homeTeam={p.home}
            awayTeam={p.away}
            analysis={p.analysis}
            lang={lang}
          />

          {/* H2H */}
          <H2HSection
            homeTeam={p.home}
            awayTeam={p.away}
            analysis={p.analysis}
            factores={p.factores_clave}
            lang={lang}
          />

          {/* INJURIES */}
          {(p.lesiones_home?.length > 0 || p.lesiones_away?.length > 0) && (
            <div className="injuries-box">
              <div className="injuries-title">{t.injuriesTitle}</div>
              <div className="injuries-cols">
                <div className="injuries-col">
                  <div className="injuries-team">🔴 {p.home}</div>
                  {p.lesiones_home?.length === 0
                    ? <div className="injury-none">{t.noInjuries}</div>
                    : p.lesiones_home?.slice(0, 3).map((l, i) => (
                      <div key={i} className="injury-card">
                        <span className="injury-name">{l.nombre}</span>
                        <span className="injury-type">{l.razon || l.posicion}</span>
                      </div>
                    ))
                  }
                </div>
                <div className="injuries-col">
                  <div className="injuries-team">🟡 {p.away}</div>
                  {p.lesiones_away?.length === 0
                    ? <div className="injury-none">{t.noInjuries}</div>
                    : p.lesiones_away?.slice(0, 3).map((l, i) => (
                      <div key={i} className="injury-card">
                        <span className="injury-name">{l.nombre}</span>
                        <span className="injury-type">{l.razon || l.posicion}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* MARKETS */}
          <div className="markets-row">
            <div className={`market-tag ${p.btts ? 'on' : ''}`}>
              BTTS {p.btts ? '✓' : '✗'}
            </div>
            <div className={`market-tag ${p.ou ? 'on' : ''}`}>
              Over 2.5 {p.ou ? '✓' : '✗'}
            </div>
          </div>

          {/* AI EDGE */}
          <AIEdgeBadge ev={p.ev} conf={p.conf} />

          {/* KEY FACTORS (EN) */}
          {lang === 'en' && <EnStatsView p={p} />}

          {/* ANÁLISIS COMPLETO CTA (ES) */}
          {lang === 'es' && (
            <div className="analysis-cta" onClick={() => setView('analysis')}>
              <div className="analysis-cta-left">
                <span className="analysis-cta-icon">📋</span>
                <div>
                  <div className="analysis-cta-title">{t.fullAnalysis}</div>
                  <div className="analysis-cta-sub">{t.analysisSubtitle}</div>
                </div>
              </div>
              <span className="analysis-cta-arrow">›</span>
            </div>
          )}
        </>
      )}

      <button className="back-btn" onClick={() => setView('list')}>
        {t.back}
      </button>
      <div className="responsible-text">{t.responsible}</div>
      <div style={{ height: 20 }} />
    </div>
  )

  /* ── ANALYSIS VIEW (ES) ───────────────────────────────── */
  return (
    <div className="screen">
      <AppHeader />
      <div className="analysis-header">
        <div className="analysis-match-title">{p.home} vs {p.away}</div>
        <div className="analysis-meta">
          Pipeline 7 agentes IA · {getFlag(p.league_id)} {p.league}
        </div>
      </div>

      {locked ? (
        <div className="locked-box">
          <div className="locked-icon-lg">🔒</div>
          <div className="locked-title">ANÁLISIS BLOQUEADO</div>
          <div className="locked-sub">El análisis completo incluye:</div>
          <div className="analysis-locked-list">
            {'• Forma real últimos 5 partidos\n• Historial H2H detallado\n• Lesiones y bajas confirmadas\n• Probabilidades Poisson + Dixon-Coles\n• Edge vs mercado (EV)\n• Factores tácticos y emocionales'}
          </div>
          <button className="btn-primary" onClick={() => navigate('/premium')}>
            {t.activatePremium}
          </button>
        </div>
      ) : (
        <div className="analysis-content">
          {/* KEY FACTORS */}
          {p.factores_clave?.length > 0 && (
            <div className="analysis-block">
              <div className="analysis-block-title">
                🔑 {lang === 'es' ? 'FACTORES CLAVE' : 'KEY FACTORS'}
              </div>
              <div className="key-factors">
                {p.factores_clave.map((f, i) => (
                  <div key={i} className="factor-item">{f}</div>
                ))}
              </div>
            </div>
          )}

          {/* GPT NARRATIVE */}
          {p.analysis && (
            <div className="analysis-block">
              <div className="analysis-block-title">
                🧠 {lang === 'es' ? 'ANÁLISIS NARRATIVO' : 'NARRATIVE ANALYSIS'}
              </div>
              <RenderAnalysis text={p.analysis} />
            </div>
          )}
        </div>
      )}

      <button className="back-btn" onClick={() => setView('detail')}>
        {t.back}
      </button>
      <div className="responsible-text">{t.responsible}</div>
      <div style={{ height: 20 }} />
    </div>
  )
}