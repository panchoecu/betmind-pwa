import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'

export default function AppHeader() {
  const navigate = useNavigate()
  const { isPremium, lang, setLang } = useStore()
  const t = translations[lang]

  return (
    <div className="app-header">
      {/* BRAND */}
      <div
        className="brand-name"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        Bet<span className="accent">Mind</span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          color: 'var(--t4)',
          marginLeft: 6,
          verticalAlign: 'middle',
          textTransform: 'uppercase',
        }}>
          AI
        </span>
      </div>

      <div className="header-right">
        {/* LANG SWITCHER */}
        <div className="lang-switcher">
          <button
            className={`lang-btn ${lang === 'es' ? 'active' : ''}`}
            onClick={() => setLang('es')}
          >
            ES
          </button>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>

        {/* PLAN BADGE */}
        <div
          className={`plan-badge ${isPremium ? 'prem' : ''}`}
          onClick={() => !isPremium && navigate('/premium')}
          style={{ cursor: isPremium ? 'default' : 'pointer' }}
        >
          {isPremium ? '👑 PREMIUM' : '⚡ FREE'}
        </div>
      </div>
    </div>
  )
}