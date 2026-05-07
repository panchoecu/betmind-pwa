import { confColor } from '../api'
import useStore from '../store/useStore'

export default function ConfBar({ value }) {
  const { lang } = useStore()
  const color = confColor(value)
  const pct = Math.min(100, Math.max(0, parseFloat(value) || 0))
  return (
    <div className="conf-bar-wrap">
      <div className="conf-bar-bg">
        <div
          className="conf-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="conf-bar-label" style={{ color }}>
        {value}% — {pct >= 70 ? (lang === 'en' ? 'HIGH' : 'ALTA') : pct >= 60 ? (lang === 'en' ? 'MEDIUM' : 'MEDIA') : (lang === 'en' ? 'LOW' : 'BAJA')}
      </span>
    </div>
  )
}