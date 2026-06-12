const BAD_STRINGS = new Set(['—', '-', 'n/a', 'na', 'null', 'undefined', 'none'])

export function finitePositive(value) {
  if (value === null || value === undefined || value === '') return null
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function validString(value) {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  if (!s || BAD_STRINGS.has(s.toLowerCase())) return null
  if (/^(null|undefined|nan)$/i.test(s)) return null
  return s
}

export function getWcBetmindScore(pick) {
  const n = finitePositive(pick?.wc_confidence_score_v21)
  if (!n) return null
  return `${n.toFixed(1)}/10`
}

export function getWcScoreLabel(pick) {
  return validString(pick?.wc_confidence_label_v21)
}

export function getWcProb(pick) {
  const raw = pick?.prob ?? pick?.prob_modelo ?? pick?.math?.prob_modelo
  const n = parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  const pct = n <= 1 ? n * 100 : n
  return `${pct.toFixed(1)}%`
}

export function getWcEdge(pick) {
  const n = finitePositive(pick?.edge_real_pp)
  if (!n) return null
  return `+${n.toFixed(1)} pp`
}

export function getWcEv(pick) {
  const n = finitePositive(pick?.ev_real)
  if (!n) return null
  const pct = Math.abs(n) <= 1 ? n * 100 : n
  return `+${pct.toFixed(1)}%`
}

export function getWcRiskNote(pick) {
  const note = validString(pick?.analysis_risk_note)
  if (!note) return null
  const line = note.split('\n').map((l) => l.trim()).find(Boolean)
  if (!line) return null
  return line.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '')
}

export function getWcValueCommercial(pick) {
  return validString(
    pick?.wc_value_commercial ||
      pick?.wc_confidence_commercial ||
      pick?.premium_analysis?.sections?.value_commercial
  )
}

export function getWcStakeSuggested(pick, lang) {
  const raw = validString(
    pick?.wc_stake_suggested || pick?.premium_analysis?.sections?.stake_suggested
  )
  if (!raw) return null
  if (/^bajo$/i.test(raw)) {
    return lang === 'en' ? 'Controlled stake' : 'Stake controlado'
  }
  return raw
}

function sanitizeStakeInAnalysisShort(text, lang) {
  const replacement = lang === 'en' ? 'Controlled stake' : 'Stake controlado'
  return text
    .replace(/Stake\s+Bajo/gi, replacement)
    .replace(/Stake\s*:\s*Bajo/gi, replacement)
    .replace(/(·\s*)Bajo(\s*$)/i, (_, sep, tail) =>
      /stake/i.test(text) ? `${sep}${replacement}${tail}` : `${sep}Bajo${tail}`
    )
}

export function getWcAnalysisShort(pick, lang = 'es') {
  const raw = validString(pick?.analysis_short)
  if (!raw) return null
  return sanitizeStakeInAnalysisShort(raw, lang)
}

export function getWcPoisson1x2(pick) {
  const po = pick?.poisson || {}
  const hw = parseFloat(po.p_home_win)
  const dr = parseFloat(po.p_draw)
  const aw = parseFloat(po.p_away_win)
  if (![hw, dr, aw].every((v) => Number.isFinite(v) && v > 0)) return null
  const fmt = (v) => `${v.toFixed(0)}%`
  return { home: fmt(hw), draw: fmt(dr), away: fmt(aw) }
}

export function getWcOdd(pick) {
  const n = finitePositive(pick?.odd)
  if (!n) return null
  return `@${n.toFixed(2).replace(/\.00$/, '')}`
}

export function getWcDisplayFields(pick, lang) {
  const score = getWcBetmindScore(pick)
  const label = getWcScoreLabel(pick)
  const prob = getWcProb(pick)
  const edge = getWcEdge(pick)
  const ev = getWcEv(pick)
  const risk = getWcRiskNote(pick)
  const valueCommercial = getWcValueCommercial(pick)
  const stakeSuggested = getWcStakeSuggested(pick, lang)
  const analysisShort = getWcAnalysisShort(pick, lang)
  const poisson = getWcPoisson1x2(pick)
  const odd = getWcOdd(pick)

  const shown = []
  const hidden = []

  if (getPickDisplay(pick)) shown.push('pick_principal')
  if (odd) shown.push('odd')
  else hidden.push('odd')
  if (analysisShort) shown.push('analysis_short')
  else hidden.push('analysis_short')
  if (score) shown.push('wc_confidence_score_v21')
  else hidden.push('wc_confidence_score_v21')
  if (label) shown.push('wc_confidence_label_v21')
  else hidden.push('wc_confidence_label_v21')
  if (prob) shown.push('prob')
  else hidden.push('prob')
  if (edge) shown.push('edge_real_pp')
  else hidden.push('edge_real_pp')
  if (ev) shown.push('ev_real')
  else hidden.push('ev_real')
  if (valueCommercial) shown.push('value_commercial')
  else hidden.push('value_commercial')
  if (stakeSuggested) shown.push('stake_suggested')
  else hidden.push('stake_suggested')
  if (risk) shown.push('analysis_risk_note')
  else hidden.push('analysis_risk_note')
  if (poisson) shown.push('poisson_1x2')
  else hidden.push('poisson_1x2')

  hidden.push('conf', 'ev_legacy', 'h2h', 'form_dots', 'poisson_btts_o25')

  return {
    score,
    label,
    prob,
    edge,
    ev,
    risk,
    valueCommercial,
    stakeSuggested,
    analysisShort,
    poisson,
    odd,
    shown,
    hidden,
  }
}

function getPickDisplay(pick) {
  return (
    pick?.pick_display ||
    pick?.pick_label_es ||
    pick?.wc_pick_label ||
    pick?.pick_commercial ||
    pick?.pick ||
    null
  )
}
