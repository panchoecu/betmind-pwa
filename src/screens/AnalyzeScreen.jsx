import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { analyzeMatch, evLabel, staking, AGENT_STEPS } from '../api'
import AppHeader from '../components/AppHeader'
import ConfBar from '../components/ConfBar'
import AIEdgeBadge from '../components/AIEdgeBadge'

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

export default function AnalyzeScreen() {
  const navigate = useNavigate()
  const { isPremium, remaining, setRemaining, lang } = useStore()
  const t = translations[lang]

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)

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
    const data = await analyzeMatch(input)
    setLoading(false)
    setResult(data)
    if (!data.error && remaining !== null) {
      setRemaining(Math.max(0, remaining - 1))
    }
  }

  return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{t.analyzeTitle}</div>

      {/* REMAINING BADGE */}
      <div className="analyze-remaining-bar">
        <span className="analyze-remaining-dot" />
        <span className="analyze-remaining-text">
          {remaining ?? (isPremium ? 15 : 1)} {t.analyzeRemaining}
        </span>
      </div>

      {/* INPUT FORM */}
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
            >×</button>
          )}
        </div>

        <button
          className={`btn-primary analyze-btn ${!canAnalyze ? 'disabled' : ''}`}
          onClick={handleAnalyze}
          disabled={!canAnalyze}
        >
          {loading ? t.analyzing : t.analyzeBtn}
        </button>

        <div className="analyze-hint">{t.analyzeHint}</div>
      </div>

      {/* NOT PREMIUM */}
      {!isPremium && (
        <div className="analyze-free-note">
          <span>🔒 Free: 1 análisis/día · </span>
          <span className="link" onClick={() => navigate('/premium')}>
            Premium: 15/día →
          </span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="loading-card">
          <div className="loading-spinner" />
          <div className="loading-title">{t.processing}</div>
          <div className="loading-sub">{t.processingTime}</div>
          <div className="agent-steps">
            {AGENT_STEPS.map((s, i) => (
              <div
                key={i}
                className={`agent-step ${i < step ? 'done' : i === step ? 'active' : ''}`}
              >
                <span className="agent-step-icon">
                  {i < step ? '✓' : i === step ? '▶' : '·'}
                </span>
                <span className="agent-step-text">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && !loading && !result.error && (
        <div className="result-card">
          <div className="result-match-header">
            {result.home_team || result.home} vs {result.away_team || result.away}
          </div>

          <div className="data-box" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--bg-3)', margin: 0 }}>
            <div className="data-row">
              <span className="data-label">{t.mainPick}</span>
              <span className="data-value" style={{ color: '#E8203A' }}>
                {result.pick || result.pick_principal}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">{t.odds}</span>
              <span className="data-value">@{result.odd}</span>
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

          <div style={{ padding: '14px 18px' }}>
            <AIEdgeBadge ev={result.ev} conf={result.confianza} />
          </div>

          {isPremium && result.analisis ? (
            <div className="result-analysis">
              <RenderAnalysis text={result.analisis} />
            </div>
          ) : !isPremium && (
            <div className="result-locked-note">
              🔒 Análisis completo disponible con Premium{' '}
              <span className="link" onClick={() => navigate('/premium')}>
                Ver planes →
              </span>
            </div>
          )}
        </div>
      )}

      {/* ERROR */}
      {result?.error && (
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <div className="error-text">Error al conectar con la API</div>
          <div className="error-sub">Verifica el formato: Equipo1 vs Equipo2</div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}