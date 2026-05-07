import { useState } from 'react'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'

const PROOF = [
  { value: '88.3%', label: 'Winrate' },
  { value: '+18.7%', label: 'Yield' },
  { value: '77+', label: 'Picks' },
  { value: '🔥 6', label: 'Racha' },
]

export default function LoginScreen() {
  const { loginWithGoogle, loginWithEmail, lang, setLang } = useStore()
  const t = translations[lang]

  const [view,    setView]    = useState('main')   // main | email
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    await loginWithGoogle()
    // Supabase redirige — no necesita más lógica aquí
  }

  const handleEmail = async () => {
    if (!email.includes('@')) return
    setLoading(true)
    setError(null)
    try {
      await loginWithEmail(email)
      setSent(true)
    } catch (e) {
      setError(lang === 'es'
        ? 'Error enviando el link. Intenta de nuevo.'
        : 'Error sending link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── MAGIC LINK ENVIADO ─────────────────────────────── */
  if (sent) return (
    <div style={styles.screen}>
      <LangToggle lang={lang} setLang={setLang} />
      <div style={styles.center}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>📩</div>
        <div style={styles.title}>
          {lang === 'es' ? 'Revisa tu email' : 'Check your email'}
        </div>
        <div style={styles.sub}>
          {lang === 'es'
            ? `Enviamos un link de acceso a ${email}. Haz clic en él para entrar.`
            : `We sent an access link to ${email}. Click it to sign in.`}
        </div>
        <button
          style={{ ...styles.btnSecondary, marginTop: 24 }}
          onClick={() => { setSent(false); setView('main') }}
        >
          {lang === 'es' ? '← Volver' : '← Back'}
        </button>
      </div>
    </div>
  )

  /* ── EMAIL FORM ─────────────────────────────────────── */
  if (view === 'email') return (
    <div style={styles.screen}>
      <LangToggle lang={lang} setLang={setLang} />
      <div style={styles.center}>
        <div style={styles.logo}>
          Bet<span style={{ color: '#C0142A' }}>Mind</span>
          <span style={styles.logoAI}>AI</span>
        </div>

        <div style={{ ...styles.title, fontSize: 22, marginBottom: 8 }}>
          {lang === 'es' ? 'Continuar con Email' : 'Continue with Email'}
        </div>
        <div style={{ ...styles.sub, marginBottom: 24 }}>
          {lang === 'es'
            ? 'Te enviamos un link mágico — sin contraseña'
            : 'We\'ll send you a magic link — no password needed'}
        </div>

        <input
          style={styles.input}
          type="email"
          placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEmail()}
          autoFocus
        />

        {error && (
          <div style={styles.errorNote}>{error}</div>
        )}

        <button
          style={{
            ...styles.btnPrimary,
            opacity: loading || !email.includes('@') ? 0.5 : 1,
          }}
          onClick={handleEmail}
          disabled={loading || !email.includes('@')}
        >
          {loading
            ? (lang === 'es' ? 'Enviando...' : 'Sending...')
            : (lang === 'es' ? '📩 Enviar link de acceso' : '📩 Send access link')}
        </button>

        <button
          style={{ ...styles.btnSecondary, marginTop: 10 }}
          onClick={() => { setView('main'); setError(null) }}
        >
          {lang === 'es' ? '← Volver' : '← Back'}
        </button>
      </div>
    </div>
  )

  /* ── MAIN LOGIN ─────────────────────────────────────── */
  return (
    <div style={styles.screen}>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={styles.center}>
        {/* LOGO */}
        <div style={styles.logo}>
          Bet<span style={{ color: '#C0142A' }}>Mind</span>
          <span style={styles.logoAI}>AI</span>
        </div>

        {/* HEADLINE */}
        <div style={styles.headline}>
          {lang === 'es'
            ? 'El modelo más\npreciso del fútbol'
            : 'The most accurate\nfootball model'}
        </div>
        <div style={styles.sub}>
          {lang === 'es'
            ? 'Picks verificados con matemáticas reales. Sin humo.'
            : 'Verified picks with real mathematics. No noise.'}
        </div>

        {/* PROOF GRID */}
        <div style={styles.proofGrid}>
          {PROOF.map((p, i) => (
            <div key={i} style={styles.proofCard}>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 22,
                color: i < 2 ? '#4ADE80' : '#F2F2FF',
                lineHeight: 1,
                marginBottom: 4,
              }}>
                {p.value}
              </div>
              <div style={styles.proofLabel}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* AUTH BUTTONS */}
        <div style={styles.authButtons}>
          {/* GOOGLE */}
          <button
            style={{ ...styles.btnGoogle, opacity: loading ? 0.7 : 1 }}
            onClick={handleGoogle}
            disabled={loading}
          >
            <GoogleIcon />
            {lang === 'es' ? 'Continuar con Google' : 'Continue with Google'}
          </button>

          {/* DIVIDER */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>{lang === 'es' ? 'o' : 'or'}</span>
            <div style={styles.dividerLine} />
          </div>

          {/* EMAIL */}
          <button
            style={styles.btnEmail}
            onClick={() => setView('email')}
            disabled={loading}
          >
            ✉️ {lang === 'es' ? 'Continuar con Email' : 'Continue with Email'}
          </button>
        </div>

        {/* SYNC NOTE */}
        <div style={styles.syncNote}>
          🔐 {lang === 'es'
            ? 'Tu plan se sincroniza en Telegram, Web y App automáticamente'
            : 'Your plan syncs on Telegram, Web and App automatically'}
        </div>

        {/* LEGAL */}
        <div style={styles.legal}>
          {lang === 'es'
            ? 'Apuesta con responsabilidad · Solo mayores de 18 años'
            : 'Bet responsibly · Must be 18+'}
        </div>
      </div>
    </div>
  )
}

/* ── LANG TOGGLE ──────────────────────────────────────────── */
function LangToggle({ lang, setLang }) {
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 18,
      display: 'flex',
      background: '#101022',
      borderRadius: 7,
      border: '1px solid #181830',
      overflow: 'hidden',
    }}>
      {['es', 'en'].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          background:    lang === l ? '#C0142A' : 'transparent',
          color:         lang === l ? '#fff' : '#7878A0',
          border:        'none',
          padding:       '5px 9px',
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: '1.5px',
          cursor:        'pointer',
        }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/* ── GOOGLE ICON ──────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/* ── STYLES ───────────────────────────────────────────────── */
const styles = {
  screen: {
    minHeight:       '100dvh',
    background:      '#05050C',
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '24px 18px',
    position:        'relative',
    fontFamily:      "'DM Sans', system-ui, sans-serif",
  },
  center: {
    width:     '100%',
    maxWidth:  420,
    display:   'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    fontFamily:    "'Bebas Neue', cursive",
    fontSize:      36,
    letterSpacing: 4,
    color:         '#F2F2FF',
    marginBottom:  28,
    lineHeight:    1,
  },
  logoAI: {
    fontFamily:    "'DM Sans', system-ui, sans-serif",
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: 2,
    color:         '#303050',
    marginLeft:    6,
    verticalAlign: 'middle',
  },
  headline: {
    fontFamily:    "'Bebas Neue', cursive",
    fontSize:      42,
    letterSpacing: 2,
    color:         '#F2F2FF',
    textAlign:     'center',
    lineHeight:    1.1,
    marginBottom:  12,
    whiteSpace:    'pre-line',
  },
  sub: {
    fontSize:     13,
    color:        '#7878A0',
    textAlign:    'center',
    lineHeight:   1.6,
    marginBottom: 24,
  },
  proofGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 8,
    width:               '100%',
    marginBottom:        28,
  },
  proofCard: {
    background:   '#101022',
    border:       '1px solid #181830',
    borderRadius: 10,
    padding:      '10px 4px',
    textAlign:    'center',
  },
  proofLabel: {
    fontSize:      9,
    color:         '#7878A0',
    fontWeight:    700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  authButtons: {
    width:         '100%',
    display:       'flex',
    flexDirection: 'column',
    gap:           0,
    marginBottom:  20,
  },
  btnGoogle: {
    width:          '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    background:     '#fff',
    color:          '#1a1a1a',
    border:         'none',
    borderRadius:   12,
    padding:        '14px',
    fontSize:       14,
    fontWeight:     600,
    cursor:         'pointer',
    fontFamily:     "'DM Sans', system-ui, sans-serif",
    marginBottom:   10,
    transition:     'opacity 0.2s',
  },
  divider: {
    display:        'flex',
    alignItems:     'center',
    gap:            10,
    marginBottom:   10,
  },
  dividerLine: {
    flex:       1,
    height:     1,
    background: '#181830',
  },
  dividerText: {
    fontSize: 11,
    color:    '#303050',
  },
  btnEmail: {
    width:          '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    background:     '#101022',
    color:          '#C0C0DC',
    border:         '1px solid #181830',
    borderRadius:   12,
    padding:        '14px',
    fontSize:       14,
    fontWeight:     500,
    cursor:         'pointer',
    fontFamily:     "'DM Sans', system-ui, sans-serif",
    transition:     'opacity 0.2s',
  },
  btnPrimary: {
    width:          '100%',
    background:     '#C0142A',
    color:          '#fff',
    border:         'none',
    borderRadius:   12,
    padding:        '14px',
    fontSize:       13,
    fontWeight:     700,
    letterSpacing:  '1.5px',
    textTransform:  'uppercase',
    cursor:         'pointer',
    fontFamily:     "'DM Sans', system-ui, sans-serif",
    marginBottom:   0,
    transition:     'opacity 0.2s',
  },
  btnSecondary: {
    background:    'transparent',
    color:         '#C0142A',
    border:        'none',
    padding:       '10px',
    fontSize:      13,
    fontWeight:    700,
    cursor:        'pointer',
    fontFamily:    "'DM Sans', system-ui, sans-serif",
  },
  input: {
    width:         '100%',
    background:    '#101022',
    border:        '1px solid #181830',
    borderRadius:  12,
    padding:       '14px 16px',
    fontSize:      14,
    color:         '#F2F2FF',
    fontFamily:    "'DM Sans', system-ui, sans-serif",
    marginBottom:  12,
    outline:       'none',
    boxSizing:     'border-box',
  },
  errorNote: {
    width:        '100%',
    padding:      '10px 14px',
    background:   'rgba(192,20,42,0.1)',
    border:       '1px solid rgba(192,20,42,0.3)',
    borderRadius: 8,
    fontSize:     12,
    color:        '#E8203A',
    marginBottom: 10,
    textAlign:    'center',
  },
  syncNote: {
    fontSize:     11,
    color:        '#303050',
    textAlign:    'center',
    lineHeight:   1.6,
    marginBottom: 16,
    padding:      '10px 14px',
    background:   '#101022',
    borderRadius: 8,
    border:       '1px solid #181830',
    width:        '100%',
  },
  legal: {
    fontSize:   10,
    color:      '#303050',
    textAlign:  'center',
    letterSpacing: '0.3px',
  },
}