import { getWcPoisson1x2 } from './wcPickDisplay'

export default function WcPoisson1x2({ pick, lang }) {
  const poisson = getWcPoisson1x2(pick)
  if (!poisson) return null

  return (
    <div className="poisson-section">
      <div className="section-mini-title">
        {lang === 'es' ? '📐 MODELO 1X2' : '📐 1X2 MODEL'}
      </div>
      <div className="poisson-grid">
        <div className="poisson-cell hi-home">
          <div className="poisson-value">{poisson.home}</div>
          <div className="poisson-label">{lang === 'es' ? 'LOCAL' : 'HOME'}</div>
        </div>
        <div className="poisson-cell">
          <div className="poisson-value">{poisson.draw}</div>
          <div className="poisson-label">{lang === 'es' ? 'EMPATE' : 'DRAW'}</div>
        </div>
        <div className="poisson-cell">
          <div className="poisson-value">{poisson.away}</div>
          <div className="poisson-label">{lang === 'es' ? 'VISITANTE' : 'AWAY'}</div>
        </div>
      </div>
    </div>
  )
}
