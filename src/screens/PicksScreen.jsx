import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { getFlag, confColor, confLabel, evLabel, staking } from '../api'
import AppHeader from '../components/AppHeader'
import ConfBar from '../components/ConfBar'
import AIEdgeBadge from '../components/AIEdgeBadge'

const TIER_COLOR = { S: '#C0142A', A: '#D4A935', B: '#4ADE80' }

function RenderAnalysis({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim())
  const sections = []
  let current = null
  for (const line of lines) {
    const clean = line.replace(/[*_]/g, '').trim()
    if (!clean) continue
    if (clean.match(/^(🏠|✈️|📋|🔑|📅|⚽|📊|⚠️)/)) {
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
          {s.title && <div className="analysis-section-title">{s.title}</div>}
          <div className="analysis-section-text">{s.text}</div>
        </div>
      ))}
    </div>
  )
}

export default function PicksScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialIdx = location.state?.idx ?? null

  const [view, setView] = useState(initialIdx !== null ? 'detail' : 'list')
  const [selIdx, setSelIdx] = useState(initialIdx ?? 0)

  const { isPremium, picks, riskyPicks, lang } = useStore()
  const t = translations[lang]

  const mainPicks = (picks || []).map((p, i) => ({
    ...p,
    home: p.home || p.home_team,
    away: p.away || p.away_team,
    pick: p.pick || p.pick_principal,
    conf: p.conf || p.confidence,
    conservador: p.conservador || p.pick_conservador,
    locked: !isPremium && i >= 2,
  }))

  const p = mainPicks[selIdx] || {}
  const locked = p.locked
  const tierColor = TIER_COLOR[p.tier] || '#888'

  // ─── LIST VIEW ───────────────────────────────────────────
  if (view === 'list') return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{lang === 'en' ? 'PICKS OF THE DAY' : 'PICKS DEL DÍA'}</div>

      <div className="picks-count-bar">
        <span className="picks-count-label">{lang === 'en' ? 'MAIN PICKS' : 'PRINCIPALES'}</span>
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
          const tc = TIER_COLOR[pick.tier] || '#888'
          return (
            <div
              key={pick.id || i}
              className={`pick-card ${pick.locked ? 'locked' : ''} ${isTop ? 'top' : ''}`}
              style={{ borderLeftColor: tc }}
              onClick={() => { setSelIdx(i); setView('detail') }}
            >
              {/* TOP BADGE */}
              {isTop && (
                <div className="pick-card-top-badge" style={{ color: tc }}>
                  🔥 TOP · {getFlag(pick.league_id)} {pick.league}
                  {pick.tier && <span className="tier-tag" style={{ color: tc, borderColor: `${tc}44`, background: `${tc}18` }}>TIER {pick.tier}</span>}
                </div>
              )}

              {!isTop && (
                <div className="pick-card-league">
                  {getFlag(pick.league_id)} {pick.league}
                  {pick.tier && <span className="tier-tag" style={{ color: tc, borderColor: `${tc}44`, background: `${tc}18` }}>TIER {pick.tier}</span>}
                </div>
              )}

              {/* TEAMS */}
              <div className="pick-teams">
                <span className="team-name">{pick.home}</span>
                <span className="vs-text">vs</span>
                <span className="team-name">{pick.away}</span>
              </div>

              {/* FOOTER */}
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
          {lang === 'en' ? `2 of ${mainPicks.length} picks unlocked · ` : `2 de ${mainPicks.length} picks desbloqueados · `}
          <span className="link" onClick={() => navigate('/premium')}>
            {lang === 'en' ? 'Activate Premium →' : 'Activa Premium →'}
          </span>
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  )

  // ─── DETAIL VIEW ─────────────────────────────────────────
  if (view === 'detail') return (
    <div className="screen">
      <AppHeader />

      {/* MATCH HEADER CARD */}
      <div className="match-header-card" style={{ borderTopColor: tierColor }}>
        <div className="match-league">
          {getFlag(p.league_id)} {p.league}
          {p.tier && (
            <span className="tier-badge-lg" style={{ color: tierColor, background: `${tierColor}18`, borderColor: `${tierColor}44` }}>
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

      {locked ? (
        <div className="locked-box">
          <div className="locked-icon-lg">🔒</div>
          <div className="locked-title">{t.lockedPick}</div>
          <div className="locked-sub">{t.lockedSub}</div>
          <div className="locked-odds">
            Cuota: @{p.odd} · Confianza: {p.conf}%
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
            <div className="data-row">
              <span className="data-label">{t.conservativePick}</span>
              <span className="data-value" style={{ color: '#D4A935' }}>{p.conservador || '—'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.odds}</span>
              <span className="data-value">@{p.odd}</span>
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

          {/* ANALYSIS CTA */}
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
        </>
      )}

      <button className="back-btn" onClick={() => setView('list')}>
        {t.back}
      </button>
      <div className="responsible-text">{t.responsible}</div>
      <div style={{ height: 20 }} />
    </div>
  )

  // ─── ANALYSIS VIEW ───────────────────────────────────────
  return (
    <div className="screen">
      <AppHeader />

      <div className="analysis-header">
        <div className="analysis-match-title">
          {p.home} vs {p.away}
        </div>
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
            • Forma real últimos 5 partidos{'\n'}
            • Historial H2H detallado{'\n'}
            • Lesiones y bajas confirmadas{'\n'}
            • Probabilidades Poisson + Dixon-Coles{'\n'}
            • Edge vs mercado (EV){'\n'}
            • Factores tácticos y emocionales
          </div>
          <button className="btn-primary" onClick={() => navigate('/premium')}>
            {t.activatePremium}
          </button>
        </div>
      ) : (
        <div className="analysis-content">
          {p.analysis && lang === 'es' && (
  <div className="analysis-block">
    <RenderAnalysis text={p.analysis} />
  </div>
)}
{p.analysis && lang === 'en' && (
  <div className="analysis-block">
    <div className="analysis-section-title">📊 Match Data</div>
    <div className="stats-en-grid">
      <div className="stat-en"><span>Home Win</span><strong>{p.poisson?.p_home_win ?? p.p_home_win ?? '—'}%</strong></div>
      <div className="stat-en"><span>Draw</span><strong>{p.poisson?.p_draw ?? '—'}%</strong></div>
      <div className="stat-en"><span>Away Win</span><strong>{p.poisson?.p_away_win ?? p.p_away_win ?? '—'}%</strong></div>
      <div className="stat-en"><span>BTTS</span><strong>{p.poisson?.p_btts ?? p.p_btts ?? '—'}%</strong></div>
      <div className="stat-en"><span>Over 2.5</span><strong>{p.poisson?.p_over25 ?? p.p_over25 ?? '—'}%</strong></div>
      <div className="stat-en"><span>Under 2.5</span><strong>{p.poisson?.p_under25 ?? p.p_under25 ?? '—'}%</strong></div>
    </div>
    {p.factores_clave?.length > 0 && (
      <div className="key-factors">
        <div className="analysis-section-title">🔑 Key Factors</div>
        {p.factores_clave.map((f, i) => (
          <div key={i} className="factor-item">• {f}</div>
        ))}
      </div>
    )}
  </div>
)}
{!p.analysis && p.analisis?.map((block, i) => (
            <div key={i} className="analysis-block">
              <div className="analysis-block-title">{block.t}</div>
              <RenderAnalysis text={block.txt} />
            </div>
          ))}
          {p.resumen && (
            <div className="analysis-block">
              <div className="analysis-block-title">📊 Análisis</div>
              <RenderAnalysis text={p.resumen} />
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