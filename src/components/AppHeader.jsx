import useStore from '../store/useStore'
import { translations } from '../i18n/translations'

export default function AppHeader() {
  const { isPremium, lang, setLang } = useStore()
  const t = translations[lang]

  return (
    <div className="app-header">
      <div className="brand-name">
        Bet<span className="accent">Mind</span>
      </div>
      <div className="header-right">
        <div className="lang-switcher">
          <button
            className={`lang-btn ${lang === 'es' ? 'active' : ''}`}
            onClick={() => setLang('es')}
          >ES</button>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >EN</button>
        </div>
        <div className={`plan-badge ${isPremium ? 'prem' : ''}`}>
          {isPremium ? '👑 PREMIUM' : '⚡ FREE'}
        </div>
      </div>
    </div>
  )
}