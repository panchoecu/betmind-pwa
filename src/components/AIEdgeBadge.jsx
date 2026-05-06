import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import { confLabel, confColor } from '../api'

export default function AIEdgeBadge({ ev, conf }) {
  const { lang } = useStore()
  const t = translations[lang]
  const n = parseFloat(ev) || 0
  const evScore = Math.min(10, (n / 2)).toFixed(1)

  return (
    <div className="ai-edge-badge">
      <div className="ai-edge-item">
        <div className="ai-edge-label">{t.aiEdge}</div>
        <div className="ai-edge-value green">{evScore}/10</div>
      </div>
      <div className="ai-edge-sep" />
      <div className="ai-edge-item">
        <div className="ai-edge-label">{t.confidence}</div>
        <div
          className="ai-edge-value"
          style={{ color: confColor(conf) }}
        >
          {confLabel(conf, t)}
        </div>
      </div>
      <div className="ai-edge-sep" />
      <div className="ai-edge-item">
        <div className="ai-edge-label">{t.evEdge}</div>
        <div className="ai-edge-value green">
          {n > 0 ? `+${n.toFixed(1)}%` : '—'}
        </div>
      </div>
    </div>
  )
}