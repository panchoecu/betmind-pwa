import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import AppHeader from '../components/AppHeader'

const PLANS = [
  {
    id: 'monthly',
    name: 'MENSUAL',
    price: '$19',
    period: '/mes',
    variantId: '1481453',
    popular: false,
    savings: null,
  },
  {
    id: 'quarterly',
    name: 'TRIMESTRAL',
    price: '$49',
    period: '/3m',
    variantId: '1481454',
    popular: true,
    savings: 'Ahorra 14%',
  },
  {
    id: 'annual',
    name: 'ANUAL',
    price: '$149',
    period: '/año',
    variantId: '1481455',
    popular: false,
    savings: 'Ahorra 35%',
  },
]

const FEATURES = [
  { icon: '📅', title: 'Picks diarios completos', sub: '5+ picks con análisis por jornada' },
  { icon: '⚡', title: 'Análisis on-demand', sub: '15 análisis por día con pipeline IA' },
  { icon: '📋', title: 'Análisis completo', sub: 'Forma · H2H · Poisson · 7 Agentes' },
  { icon: '🏥', title: 'Lesiones en tiempo real', sub: 'Bajas confirmadas antes del partido' },
  { icon: '📊', title: 'Track record verificado', sub: 'Historial completo con resultados reales' },
  { icon: '🔔', title: 'Notificaciones push', sub: 'Picks listos a las 21:45 EC' },
]

export default function PremiumScreen() {
  const { isPremium, premiumUntil, chatId, lang } = useStore()
  const t = translations[lang]

  const handleBuy = (variantId) => {
    const base = `https://betmindai.com/checkout?variant=${variantId}`
    const url = chatId ? `${base}&chat_id=${chatId}` : base
    window.open(url, '_blank')
  }

  // ACTIVE PREMIUM VIEW
  if (isPremium) return (
    <div className="screen">
      <AppHeader />
      <div className="screen-title">{t.myAccount}</div>

      <div className="premium-active-card">
        <div className="premium-active-crown">👑</div>
        <div className="premium-active-title">{t.premiumActive}</div>
        <div className="premium-active-badge">{t.active}</div>
        {premiumUntil && (
          <div className="premium-active-until">
            {t.validUntil} {new Date(premiumUntil).toLocaleDateString(
              lang === 'es' ? 'es-EC' : 'en-US',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </div>
        )}
      </div>

      <div className="features-list">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-content">
              <div className="feature-title">{f.title}</div>
              <div className="feature-sub">{f.sub}</div>
            </div>
            <div className="feature-check">✓</div>
          </div>
        ))}
      </div>

      <div style={{ height: 20 }} />
    </div>
  )

  // UPGRADE VIEW
  return (
    <div className="screen">
      <AppHeader />

      <div className="premium-hero">
        <div className="premium-hero-icon">👑</div>
        <div className="premium-hero-title">BetMind Premium</div>
        <div className="premium-hero-sub">
          Accede a todos los picks y análisis completos de 7 agentes IA
        </div>
      </div>

      {/* PLANS */}
      <div className="plans-list">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            onClick={() => handleBuy(plan.variantId)}
          >
            {plan.popular && (
              <div className="plan-popular-badge">⭐ MÁS POPULAR</div>
            )}
            <div className="plan-header">
              <div className="plan-name">{plan.name}</div>
              {plan.savings && (
                <div className="plan-savings">{plan.savings}</div>
              )}
            </div>
            <div className="plan-price">
              {plan.price}
              <span className="plan-period">{plan.period}</span>
            </div>
            <div className="plan-cta">
              {plan.popular ? '⚡ ELEGIR PLAN' : 'Seleccionar'}
            </div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div className="features-title">¿Qué incluye Premium?</div>
      <div className="features-list">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-content">
              <div className="feature-title">{f.title}</div>
              <div className="feature-sub">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* GUARANTEE */}
      <div className="guarantee-box">
        <div className="guarantee-icon">🛡️</div>
        <div className="guarantee-text">
          <div className="guarantee-title">Winrate verificado 88.3%</div>
          <div className="guarantee-sub">
            Resultados reales · Sin picks inventados · Track record público
          </div>
        </div>
      </div>

      <div className="responsible-text">{t.responsible}</div>
      <div style={{ height: 20 }} />
    </div>
  )
}