import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import AppHeader from '../components/AppHeader'

const getPlans = (t) => [
  {
    id: 'monthly',
    name: t.planMonthly,
    price: '$19',
    period: '/mes',
    variantId: '1481453',
    popular: false,
    savings: null,
  },
  {
    id: 'quarterly',
    name: t.planQuarterly,
    price: '$49',
    period: '/3m',
    variantId: '1481454',
    popular: true,
    savings: t.save14,
  },
  {
    id: 'annual',
    name: t.planAnnual,
    price: '$149',
    period: '/año',
    variantId: '1481455',
    popular: false,
    savings: t.save35,
  },
]

const getFeatures = (t) => [
  { icon: '📅', title: t.feat1Title, sub: t.feat1Sub },
  { icon: '⚡', title: t.feat2Title, sub: t.feat2Sub },
  { icon: '📋', title: t.feat3Title, sub: t.feat3Sub },
  { icon: '🏥', title: t.feat4Title, sub: t.feat4Sub },
  { icon: '📊', title: t.feat5Title, sub: t.feat5Sub },
  { icon: '🔔', title: t.feat6Title, sub: t.feat6Sub },
]

export default function PremiumScreen() {
  const { isPremium, premiumUntil, chatId, lang } = useStore()
  const t = translations[lang]
  const navigate = useNavigate()

  const PLANS = getPlans(t)
  const FEATURES = getFeatures(t)

  const handleBuy = (variantId) => {
    const base = `https://betmindai.com/checkout?variant=${variantId}`
    const url = chatId ? `${base}&chat_id=${chatId}` : base
    window.open(url, '_blank')
  }

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

  return (
    <div className="screen">
      <AppHeader />
      <div className="premium-hero">
        <div className="premium-hero-icon">👑</div>
        <div className="premium-hero-title">BetMind Premium</div>
        <div className="premium-hero-sub">{t.premiumHero}</div>
      </div>

      <div className="plans-list">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            onClick={() => handleBuy(plan.variantId)}
          >
            {plan.popular && (
              <div className="plan-popular-badge">{t.mostPopular}</div>
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
              {plan.popular ? t.choosePlan : t.selectPlan}
            </div>
          </div>
        ))}
      </div>

      <div className="features-title">{t.whatsIncluded}</div>
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

      <div className="guarantee-box">
        <div className="guarantee-icon">🛡️</div>
        <div className="guarantee-text">
          <div className="guarantee-title">{t.guaranteeTitle}</div>
          <div className="guarantee-sub">{t.guaranteeSub}</div>
        </div>
      </div>

      <div className="responsible-text">{t.responsible}</div>
      <div style={{ height: 20 }} />
    </div>
  )
}