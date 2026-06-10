import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { analyzeMatch, evLabel, staking, AGENT_STEPS } from '../api'
import AppHeader from '../components/AppHeader'
import ConfBar from '../components/ConfBar'
import AIEdgeBadge from '../components/AIEdgeBadge'

/* ─── GPT ANALYSIS RENDERER ─────────────────────────────── */
function RenderAnalysis({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim())
  const sections = []
  let current = null
  for (const line of lines) {
    const clean = line.replace(/[*_`]/g, '').replace(/[─━]+/g, '').trim()
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
          {s.title && <div className="analysis-section-title">{s.title}</div>}
          {s.text  && <div className="analysis-section-text">{s.text}</div>}
        </div>
      ))}
    </div>
  )
}

/* ─── AGENT STEPS LOADER ────────────────────────────────── */
function AgentLoader({ step, t }) {
  return (
    <div style={{
      margin: '0 18px',
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-3)',
      borderRadius: 'var(--r-lg)',
      padding: '28px 20px',
    }}>
      {/* Spinner + título */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          letterSpacing: 2,
          color: 'var(--t1)',
          marginBottom: 4,
        }}>
          {t.processing}
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{t.processingTime}</div>
      </div>

      {/* Steps */}
      <div style={{
        background: 'var(--bg-2)',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--bg-3)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {AGENT_STEPS.map((s, i) => {
          const isDone   = i < step
          const isActive = i === step
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: isDone ? 'var(--green)' : isActive ? 'var(--t1)' : 'var(--t4)',
              transition: 'color 0.3s',
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                background: isDone
                  ? 'rgba(74,222,128,0.15)'
                  : isActive
                    ? 'rgba(192,20,42,0.15)'
                    : 'var(--bg-3)',
                border: `1px solid ${isDone ? 'rgba(74,222,128,0.4)' : isActive ? 'rgba(192,20,42,0.4)' : 'var(--bg-4)'}`,
                color: isDone ? 'var(--green)' : isActive ? 'var(--crimson)' : 'var(--t4)',
              }}>
                {isDone ? '✓' : i + 1}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{s}</span>
              {isActive && (
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--crimson)',
                  boxShadow: '0 0 6px var(--crimson)',
                  animation: 'pulse 1s infinite',
                  flexShrink: 0,
                }} />
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AnalyzeScreen() {
  const navigate = useNavigate()
  const { isPremium, remaining, setRemaining, lang, user, chatId } = useStore()
  const t = translations[lang]

  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [step,    setStep]    = useState(0)

  const canAnalyze = input.includes(' vs ') && !loading &&
    (remaining === null || remaining > 0)

  useEffect(() => {
    let interval
    if (loading) {
      setStep(0)
      interval = setInterval(() => {
        setStep(s => s < AGENT_STEPS.length - 1 ? s + 1 : s)
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    setLoading(true)
    setResult(null)
    const data = await analyzeMatch(input, lang, { ...user, chat_id: chatId })
    setLoading(false)
    setResult(data)
    const isSuccess = !data.error && !data.noPick && !data.notFound && data.success !== false
    if (isSuccess && remaining !== null) {
      setRemaining(Math.max(0, remaining - 1))
    }
  }

  const isAnalyzeSuccess = result && !result.error && !result.noPick && !result.notFound && result.success !== false

  const remainingCount = remaining ?? (isPremium ? 15 : 1)

  return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{t.analyzeTitle}</div>

      {/* REMAINING BADGE */}
      <div className="analyze-remaining-bar">
        <span className="analyze-remaining-dot" />
        <span>
          <strong style={{ color: 'var(--green)' }}>{remainingCount}</strong>
          {' '}{t.analyzeRemaining}
        </span>
      </div>

      {/* INPUT */}
      <div className="analyze-form">
        <div className="analyze-input-wrap">
          <span className="analyze-input-icon">⚽</span>
          <input
            className="analyze-input"
            placeholder={t.analyzePlaceholder}
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null) }}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          />
          {input && (
            <button
              className="analyze-clear"
              onClick={() => { setInput(''); setResult(null) }}
            >
              ×
            </button>
          )}
        </div>

        <button
          className={`btn-primary analyze-btn ${!canAnalyze ? 'disabled' : ''}`}
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          style={{
            background: canAnalyze ? 'var(--crimson)' : 'var(--bg-3)',
            color: canAnalyze ? '#fff' : 'var(--t4)',
          }}
        >
          {loading ? t.analyzing : t.analyzeBtn}
        </button>

        <div className="analyze-hint">{t.analyzeHint}</div>
      </div>

      {/* FREE USER NOTE */}
      {!isPremium && (
        <div style={{
          margin: '-4px 18px 16px',
          padding: '12px 14px',
          background: 'rgba(192,20,42,0.06)',
          border: '1px solid rgba(192,20,42,0.18)',
          borderRadius: 'var(--r-md)',
          fontSize: 12,
          color: 'var(--t3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <span>🔒 {lang === 'es' ? 'Free: 1 análisis/día' : 'Free: 1 analysis/day'}</span>
          <span
            className="link"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => navigate('/premium')}
          >
            Premium: 15/{lang === 'es' ? 'día' : 'day'} →
          </span>
        </div>
      )}

      {/* LOADING — AGENT STEPS */}
      {loading && <AgentLoader step={step} t={t} />}

      {/* RESULT */}
      {isAnalyzeSuccess && !loading && (
        <div style={{ margin: '0 18px' }}>

          {/* MATCH TITLE */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            letterSpacing: 1.5,
            color: 'var(--t1)',
            marginBottom: 12,
            lineHeight: 1.1,
          }}>
            {result.home_team || result.home}
            <span style={{ color: 'var(--t4)', fontSize: 14, margin: '0 8px' }}>vs</span>
            {result.away_team || result.away}
          </div>

          {/* DATA BOX */}
          <div className="data-box" style={{ marginLeft: 0, marginRight: 0, marginBottom: 12 }}>
            <div className="data-row">
              <span className="data-label">{t.mainPick}</span>
              <span className="data-value" style={{ color: '#E8203A' }}>
                {result.pick || result.pick_principal}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.odds}</span>
              <span className="data-value" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--gold)',
              }}>
                @{result.odd}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.confidence}</span>
              <div style={{ flex: 1, marginLeft: 16 }}>
                <ConfBar value={result.confianza || result.confidence} />
              </div>
            </div>
            <div className="data-row">
              <span className="data-label">{t.edge}</span>
              <span className="data-value" style={{ color: '#4ADE80' }}>
                {evLabel(result.ev, t)}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.staking}</span>
              <span className="data-value">
                💰 {staking(result.confianza, result.ev, t)}
              </span>
            </div>
          </div>

          {/* AI EDGE */}
          <div style={{ marginBottom: 12 }}>
            <AIEdgeBadge ev={result.ev} conf={result.confianza} />
          </div>

          {/* ANÁLISIS COMPLETO (Premium) */}
          {isPremium && result.analisis ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-3)',
              borderRadius: 'var(--r-md)',
              padding: '16px',
              marginBottom: 12,
            }}>
              <div style={{
                fontSize: 10,
                letterSpacing: 2,
                color: 'var(--crimson)',
                fontWeight: 700,
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '1px solid var(--bg-3)',
                textTransform: 'uppercase',
              }}>
                🧠 {lang === 'es' ? 'ANÁLISIS COMPLETO — 7 AGENTES IA' : 'FULL ANALYSIS — 7 AI AGENTS'}
              </div>
              <RenderAnalysis text={result.analisis} />
            </div>
          ) : !isPremium && (
            <div style={{
              background: 'rgba(192,20,42,0.06)',
              border: '1px solid rgba(192,20,42,0.2)',
              borderRadius: 'var(--r-md)',
              padding: '16px',
              textAlign: 'center',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>
                {lang === 'es' ? 'Análisis completo bloqueado' : 'Full analysis locked'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14, lineHeight: 1.6 }}>
                {lang === 'es'
                  ? 'El análisis narrativo de 7 agentes IA está disponible en Premium'
                  : '7 AI agent narrative analysis available in Premium'}
              </div>
              <button className="btn-primary" onClick={() => navigate('/premium')}>
                {t.activatePremium}
              </button>
            </div>
          )}
        </div>
      )}

      {/* NO PICK — 422 */}
      {result?.noPick && !loading && (
        <div style={{ margin: '0 18px' }}>
          <div className="error-card" style={{ borderColor: 'rgba(212,169,53,0.35)' }}>
            <div className="error-icon">📊</div>
            <div className="error-text">
              {lang === 'es' ? 'Sin pick claro' : 'No clear pick'}
            </div>
            <div className="error-sub">
              {result.message || (lang === 'es'
                ? 'No encontramos una oportunidad con suficiente ventaja estadística para este partido.'
                : 'We did not find a pick with enough statistical edge for this match.')}
            </div>
          </div>
        </div>
      )}

      {/* NOT FOUND — 404 */}
      {result?.notFound && !loading && (
        <div style={{ margin: '0 18px' }}>
          <div className="error-card" style={{ borderColor: 'rgba(192,20,42,0.25)' }}>
            <div className="error-icon">🔍</div>
            <div className="error-text">
              {lang === 'es' ? 'Partido no encontrado' : 'Match not found'}
            </div>
            <div className="error-sub">
              {result.message || (lang === 'es'
                ? 'Partido no encontrado. Verifica los nombres de los equipos o la fecha.'
                : 'Match not found. Check team names or match date.')}
            </div>
          </div>
        </div>
      )}

      {/* OTHER API ERRORS */}
      {result && !loading && !result.error && !result.noPick && !result.notFound && result.success === false && result.message && (
        <div style={{ margin: '0 18px' }}>
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              {lang === 'es' ? 'No pudimos completar el análisis' : 'Analysis could not be completed'}
            </div>
            <div className="error-sub">{result.message}</div>
          </div>
        </div>
      )}

      {/* CONNECTION ERROR — red/timeout only */}
      {result?.error && !loading && (
        <div style={{ margin: '0 18px' }}>
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              {lang === 'es' ? 'Error de conexión' : 'Connection error'}
            </div>
            <div className="error-sub">
              {result.message || (lang === 'es'
                ? 'No se pudo conectar con el servidor. Intenta de nuevo.'
                : 'Could not connect to the server. Please try again.')}
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}