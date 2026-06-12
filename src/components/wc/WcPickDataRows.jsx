import {
  getWcBetmindScore,
  getWcScoreLabel,
  getWcProb,
  getWcEdge,
  getWcEv,
  getWcRiskNote,
  getWcValueCommercial,
  getWcStakeSuggested,
  getWcAnalysisShort,
} from './wcPickDisplay'

export default function WcPickDataRows({ pick, lang }) {
  const analysisShort = getWcAnalysisShort(pick, lang)
  const score = getWcBetmindScore(pick)
  const label = getWcScoreLabel(pick)
  const prob = getWcProb(pick)
  const edge = getWcEdge(pick)
  const ev = getWcEv(pick)
  const valueCommercial = getWcValueCommercial(pick)
  const stakeSuggested = getWcStakeSuggested(pick, lang)
  const risk = getWcRiskNote(pick)

  return (
    <>
      {analysisShort && (
        <div className="data-row wc-data-row-short">
          <span className="data-label">{lang === 'es' ? 'Resumen' : 'Summary'}</span>
          <span className="data-value wc-data-value-short">{analysisShort}</span>
        </div>
      )}

      {score && (
        <div className="data-row">
          <span className="data-label">{lang === 'es' ? 'BetMind Score' : 'BetMind Score'}</span>
          <span className="data-value" style={{ color: '#D4A935', fontFamily: 'var(--font-display)', fontSize: 20 }}>
            {score}
            {label ? ` · ${label}` : ''}
          </span>
        </div>
      )}

      {!score && label && (
        <div className="data-row">
          <span className="data-label">{lang === 'es' ? 'Lectura BetMind' : 'BetMind read'}</span>
          <span className="data-value" style={{ color: '#4ADE80' }}>{label}</span>
        </div>
      )}

      {prob && (
        <div className="data-row">
          <span className="data-label">{lang === 'es' ? 'Probabilidad IA' : 'AI probability'}</span>
          <span className="data-value">{prob}</span>
        </div>
      )}

      {edge && (
        <div className="data-row">
          <span className="data-label">Edge</span>
          <span className="data-value" style={{ color: '#4ADE80' }}>{edge}</span>
        </div>
      )}

      {ev && (
        <div className="data-row">
          <span className="data-label">EV</span>
          <span className="data-value" style={{ color: '#4ADE80' }}>{ev}</span>
        </div>
      )}

      {valueCommercial && (
        <div className="data-row">
          <span className="data-label">{lang === 'es' ? 'Valor comercial' : 'Commercial value'}</span>
          <span className="data-value">{valueCommercial}</span>
        </div>
      )}

      {stakeSuggested && (
        <div className="data-row">
          <span className="data-label">{lang === 'es' ? 'Stake sugerido' : 'Suggested stake'}</span>
          <span className="data-value">{stakeSuggested}</span>
        </div>
      )}

      {risk && (
        <div className="wc-risk-box">
          <div className="wc-risk-title">
            {lang === 'es' ? '⚠️ Riesgo clave' : '⚠️ Key risk'}
          </div>
          <div className="wc-risk-text">{risk}</div>
        </div>
      )}
    </>
  )
}
