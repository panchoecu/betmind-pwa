import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'

const TABS = [
  {
    id: 'home',
    path: '/',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    id: 'picks',
    path: '/picks',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10,8 16,12 10,16"/>
      </svg>
    ),
  },
  {
    id: 'stats',
    path: '/stats',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="9" width="3" height="10"/>
        <rect x="10.5" y="5" width="3" height="14"/>
        <rect x="16" y="13" width="3" height="6"/>
      </svg>
    ),
  },
  {
    id: 'premium',
    path: '/premium',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.1-2h9.8l.9-5.1-3.3 3.4L12 8.1l-2.5 4.2-3.3-3.4.9 5.1z"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/>
      </svg>
    ),
  },
  {
    id: 'analyze',
    path: '/analyze',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { lang, isPremium } = useStore()
  const t = translations[lang]

  const labels = {
    home:    t.home,
    picks:   t.picks,
    stats:   t.stats,
    premium: t.premium,
    analyze: t.analysis,
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const active = isActive(tab.path)
        const isPremTab = tab.id === 'premium'

        return (
          <button
            key={tab.id}
            className={`nav-btn ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <div className="nav-icon-wrap">
              {/* Icono con color según estado */}
              <span style={{
                color: active
                  ? 'var(--crimson)'
                  : isPremTab && isPremium
                    ? 'var(--gold)'
                    : 'var(--t3)',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}>
                {active ? tab.iconActive : tab.iconInactive}
              </span>

              {/* Punto activo */}
              {active && <div className="nav-active-dot" />}

              {/* Indicador premium en tab de premium */}
              {isPremTab && isPremium && !active && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 2,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  border: '1.5px solid var(--bg)',
                }} />
              )}
            </div>

            <span className="nav-label" style={{
              color: active
                ? 'var(--crimson)'
                : isPremTab && isPremium
                  ? 'var(--gold)'
                  : 'var(--t3)',
            }}>
              {labels[tab.id]}
            </span>
          </button>
        )
      })}
    </nav>
  )
}