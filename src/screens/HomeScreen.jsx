import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { getFlag, confColor, TODAY } from '../api'
import AppHeader from '../components/AppHeader'
import ConfBar from '../components/ConfBar'
import AIEdgeBadge from '../components/AIEdgeBadge'

const TIER_COLOR = { S: '#C0142A', A: '#D4A935', B: '#4ADE80' }

// Accent color por posición en el grid de stats
const STAT_ACCENTS = ['#4ADE80', '#4ADE80', '#D4A935', '#F2F2FF']

function StatCard({ label, value, sub, color, index }) {
  return (
    <div
      className="stat-card"
      style={{ borderTop: `2px solid ${color || STAT_ACCENTS[index] || '#4ADE80'}` }}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || STAT_ACCENTS[index] || '#4ADE80' }}>
        {value}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { isPremium, picks, stats, lang } = useStore()
  const t = translations[lang]

  const s = stats || { pct: 0, yield: 0, roi_mes: 0, ganados: 0, perdidos: 0 }

  const allPicks = picks.map(p => ({
    ...p,
    home: p.home || p.home_team,
    away: p.away || p.away_team,
    pick: p.pick || p.pick_principal,
    conf: p.conf || p.confidence,
  }))

  const topPick  = allPicks[0]
  const restPicks = allPicks.slice(1, isPremium ? 4 : 2)

  return (
    <div className="screen">
      <AppHeader />

      {/* DATE BAR */}
      <div className="home-datebar">
        <span className="datebar-date">{TODAY}</span>
        <span className="datebar-dot">·</span>
        <span className="datebar-picks">
          ✅ {allPicks.length} {t.picksToday}
        </span>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        <StatCard
          index={0}
          label={t.winrate}
          value={`${s.pct}%`}
          sub={`${s.ganados}W · ${s.perdidos}L`}
          color="#4ADE80"
        />
        <StatCard
          index={1}
          label={t.yield}
          value={`+${s.yield}%`}
          sub={t.performance}
          color="#4ADE80"
        />
        <StatCard
          index={2}
          label="PROFIT MES"
          value={`+${s.profit_mes ?? 0}u`}
          sub="unidades"
          color="#D4A935"
        />
        <StatCard
          index={3}
          label={t.picksCount}
          value={allPicks.length}
          sub={isPremium ? t.fullAccess : `${1} ${t.free}`}
          color="#F2F2FF"
        />
      </div>

      {/* NO PICKS */}
      {allPicks.length === 0 && (
        <div className="empty-card">
          <div className="empty-icon">🔄</div>
          <div className="empty-title">{t.preparingPicks}</div>
          <div className="empty-sub">{t.preparingSub}</div>
        </div>
      )}

      {/* TOP PICK */}
      {topPick && (
        <>
          <div className="section-label">{t.topPick}</div>
          <div
            className="top-pick-card"
            onClick={() => navigate('/picks', { state: { idx: 0 } })}
          >
            {/* TIER BADGE + LEAGUE */}
            <div className="top-pick-header">
              <div
                className="tier-badge"
                style={{
                  background: `${TIER_COLOR[topPick.tier] || '#888'}1A`,
                  color:      TIER_COLOR[topPick.tier] || '#888',
                  borderColor:`${TIER_COLOR[topPick.tier] || '#888'}44`,
                }}
              >
                🔥 TOP PICK · TIER {topPick.tier}
              </div>
              <div className="top-pick-flag">
                {getFlag(topPick.league_id)} {topPick.league}
              </div>
            </div>

            {/* TEAMS */}
            <div className="top-pick-teams">
              <span className="team-home">{topPick.home}</span>
              <span className="team-vs">vs</span>
              <span className="team-away">{topPick.away}</span>
            </div>

            {/* PICK + ODD */}
            <div className="top-pick-info">
              <span className="top-pick-pick">{topPick.pick}</span>
              <span className="top-pick-odd">@{topPick.odd}</span>
            </div>

            {/* CONF BAR + AI EDGE (Daily only — WC uses commercial fields in detail) */}
            {!topPick.is_world_cup && (
              <div style={{ padding: '0 4px 4px' }}>
                <ConfBar value={topPick.conf} />
              </div>
            )}
            {!topPick.is_world_cup && <AIEdgeBadge ev={topPick.ev} conf={topPick.conf} />}

            <div className="top-pick-arrow">
              {lang === 'en' ? 'View full analysis →' : 'Ver análisis completo →'}
            </div>
          </div>
        </>
      )}

      {/* MORE PICKS */}
      {restPicks.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 8 }}>
            {t.morePicks}
          </div>
          <div className="preview-picks">
            {restPicks.map((p, i) => {
              const locked    = !isPremium && !p.free && p.publication_tier !== 'free'
              const tierColor = TIER_COLOR[p.tier] || '#888'
              return (
                <div
                  key={p.id || i}
                  className={`preview-card ${locked ? 'locked' : ''}`}
                  style={{ borderLeftColor: tierColor }}
                  onClick={() => !locked && navigate('/picks', { state: { idx: i + 1 } })}
                >
                  <div className="preview-card-top">
                    <span className="preview-league">
                      {getFlag(p.league_id)} {p.league}
                    </span>
                    {p.tier && (
                      <span className="preview-tier" style={{ color: tierColor }}>
                        TIER {p.tier}
                      </span>
                    )}
                  </div>

                  <div className="preview-teams">
                    {p.home}
                    <span className="vs"> vs </span>
                    {p.away}
                  </div>

                  <div className="preview-footer">
                    {locked ? (
                      <>
                        <span className="preview-lock">🔒 {t.premiumOnly}</span>
                        <span className="preview-odd-lock">@{p.odd}</span>
                      </>
                    ) : (
                      <>
                        <span className="preview-pick" style={{ color: tierColor }}>
                          {p.pick}
                        </span>
                        <span className="preview-odd">@{p.odd || '—'}</span>
                        {Number.isFinite(parseFloat(p.conf)) && (
                        <span
                          className="preview-conf"
                          style={{ color: confColor(p.conf) }}
                        >
                          {parseFloat(p.conf)}%
                        </span>
                        )}
                      </>
                    )}
                    <span className="preview-arrow">›</span>
                  </div>

                  {!locked && !p.is_world_cup && <ConfBar value={p.conf} />}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* CTA PREMIUM */}
      {!isPremium && (
        <div className="home-cta" onClick={() => navigate('/premium')}>
          <div className="home-cta-icon">👑</div>
          <div className="home-cta-content">
            <div className="home-cta-title">{t.unlockPicks}</div>
            <div className="home-cta-sub">{t.unlockSub}</div>
          </div>
          <div className="home-cta-arrow">→</div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}