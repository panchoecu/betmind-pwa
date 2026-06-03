import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'
import AppHeader from '../components/AppHeader'

const getPlans = (t, lang) => [
  {
    id:        'monthly',
    name:      t.planMonthly,
    price:     '$19',
    period:    lang === 'es' ? '/mes' : '/mo',
    variantId: '1481453',
    popular:   false,
    savings:   null,
    accent:    'var(--t2)',
  },
  {
    id:        'quarterly',
    name:      t.planQuarterly,
    price:     '$49',
    period:    lang === 'es' ? '/3 meses' : '/3 months',
    variantId: '1481454',
    popular:   true,
    savings:   t.save14,
    accent:    'var(--gold)',
  },
  {
    id:        'annual',
    name:      t.planAnnual,
    price:     '$149',
    period:    lang === 'es' ? '/año' : '/year',
    variantId: '1481455',
    popular:   false,
    savings:   t.save35,
    accent:    'var(--green)',
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
  const { isPremium, premiumUntil, chatId, lang, stats } = useStore()
  const t        = translations[lang]
  const navigate = useNavigate()

  const PLANS    = getPlans(t, lang)
  const FEATURES = getFeatures(t)

  const PROOF_STATS = [
    { value: stats ? `${stats.pct}%`    : '—',   label: 'Winrate' },
    { value: stats ? `+${stats.yield}%` : '—',   label: 'Yield'   },
    { value: stats ? `${stats.total}`   : '—',    label: 'Picks'   },
    { value: stats ? `🔥 ${stats.racha}`: '—',   label: 'Racha'   },
  ]

  const handleBuy = () => {
    const base = `https://nura.lemonsqueezy.com/checkout/buy/ac29116a-8103-4236-9287-621edda68e5c`
    const successUrl = encodeURIComponent('https://betmind-pwa.pages.dev?payment=success')
    let url = `${base}?checkout[success_url]=${successUrl}`
    if (chatId) url += `&checkout[custom][chat_id]=${chatId}`
    window.open(url, '_blank')
  }

  /* ── USUARIO YA ES PREMIUM ──────────────────────────── */
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
            {t.validUntil}{' '}
            {new Date(premiumUntil).toLocaleDateString(
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
      <div style={{ height: 24 }} />
    </div>
  )

  /* ── PANTALLA DE UPGRADE ────────────────────────────── */
  return (
    <div className="screen">
      <AppHeader />

      {/* HERO */}
      <div className="premium-hero">
        <div className="premium-hero-icon">👑</div>
        <div className="premium-hero-title">BetMind Premium</div>
        <div className="premium-hero-sub">{t.premiumHero}</div>

        {/* SOCIAL PROOF — datos reales de la API */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginTop: 20,
        }}>
          {PROOF_STATS.map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--bg-3)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 4px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color: i < 2 ? 'var(--green)' : 'var(--t1)',
                lineHeight: 1,
                marginBottom: 4,
                letterSpacing: 1,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 9,
                color: 'var(--t3)',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PLANS */}
      <div className="plans-list">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            onClick={() => handleBuy()}
          >
            {plan.popular && (
              <div className="plan-popular-badge">{t.mostPopular}</div>
            )}
            <div className="plan-header">
              <div className="plan-name" style={{ color: plan.accent }}>
                {plan.name}
              </div>
              {plan.savings && (
                <div className="plan-savings">{plan.savings}</div>
              )}
            </div>
            <div className="plan-price">
              {plan.price}
              <span className="plan-period">{plan.period}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              {[t.feat1Title, t.feat2Title, t.feat3Title].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--t2)' }}>
                  <span style={{ color: plan.popular ? 'var(--gold)' : 'var(--green)', fontSize: 14 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
            <div className="plan-cta">
              {plan.popular ? t.choosePlan : t.selectPlan}
            </div>
          </div>
        ))}
      </div>

      {/* GOOGLE LOGIN NOTE */}
      <div style={{
        margin: '4px 18px 16px', padding: '14px 16px',
        background: 'var(--bg-card)', border: '1px solid var(--bg-3)',
        borderRadius: 'var(--r-md)', display: 'flex',
        alignItems: 'center', gap: 12, fontSize: 12,
        color: 'var(--t3)', lineHeight: 1.5,
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🔐</span>
        <span>
          {lang === 'es'
            ? 'Paga una vez — tu plan se sincroniza automáticamente en Telegram, Web y App con tu cuenta Google o email.'
            : 'Pay once — your plan syncs automatically on Telegram, Web and App with your Google or email account.'}
        </span>
      </div>

      {/* FEATURES LIST */}
      <div className="features-title">{t.whatsIncluded}</div>
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

      {/* GUARANTEE */}
      <div className="guarantee-box">
        <div className="guarantee-icon">🛡️</div>
        <div>
          <div className="guarantee-title">{t.guaranteeTitle}</div>
          <div className="guarantee-sub">{t.guaranteeSub}</div>
        </div>
      </div>

      <div className="responsible-text">{t.responsible}</div>
      <div style={{ height: 24 }} />
    </div>
  )
}