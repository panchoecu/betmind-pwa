/** Lemon Squeezy checkout URLs for BetMind PWA premium plans. */

export const LEMON_CHECKOUT_PRODUCT_URL =
  'https://nura.lemonsqueezy.com/checkout/buy/ac29116a-8103-4236-9287-621edda68e5c'

export const PREMIUM_VARIANT_BY_PLAN = {
  monthly: '1481453',
  quarterly: '1481466',
  annual: '1481468',
}

export const PREMIUM_SUCCESS_URL = 'https://betmind-pwa.pages.dev?payment=success'

/** @deprecated Removed invalid Lemon variants — do not reuse */
export const REMOVED_INVALID_VARIANTS = ['1481454', '1481455']

/**
 * Build Lemon checkout URL for a specific plan variant.
 * Uses direct product link (not POST /create-checkout).
 */
export function buildPremiumCheckoutUrl({ variantId, chatId = null } = {}) {
  const id = String(variantId || '').trim()
  if (!id) {
    throw new Error('variantId required')
  }
  if (REMOVED_INVALID_VARIANTS.includes(id)) {
    throw new Error(`invalid variantId: ${id}`)
  }

  let url = `${LEMON_CHECKOUT_PRODUCT_URL}?variant=${encodeURIComponent(id)}`
  url += `&checkout[success_url]=${encodeURIComponent(PREMIUM_SUCCESS_URL)}`
  if (chatId != null && String(chatId).trim() !== '') {
    url += `&checkout[custom][chat_id]=${encodeURIComponent(String(chatId))}`
  }
  return url
}
