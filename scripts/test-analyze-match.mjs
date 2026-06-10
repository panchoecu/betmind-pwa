/**
 * PR-PWA-OD-1B — smoke tests for analyzeMatch() response mapping.
 * Run: node scripts/test-analyze-match.mjs
 */

import { analyzeMatch, resolveChatId, getApiMessage } from '../src/api.js'

function assert(label, cond, detail = '') {
  if (!cond) throw new Error(`FAIL ${label}${detail ? `: ${detail}` : ''}`)
  console.log(`PASS ${label}`)
}

function assertStringMessage(label, message) {
  assert(`${label} message is string`, typeof message === 'string', String(message))
  assert(`${label} message not object`, !Array.isArray(message) && typeof message !== 'object')
}

async function withMockFetch(fetchImpl, fn) {
  const original = globalThis.fetch
  globalThis.fetch = fetchImpl
  try {
    return await fn()
  } finally {
    globalThis.fetch = original
  }
}

// --- resolveChatId ---
assert('resolveChatId uses chat_id not id', resolveChatId({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  chat_id: 12345,
}) === 12345)

assert('resolveChatId UUID id only → null', resolveChatId({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
}) === null)

assert('resolveChatId numeric string', resolveChatId({ chat_id: '98765' }) === 98765)

assert('resolveChatId rejects UUID chat_id', resolveChatId({
  chat_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
}) === null)

// --- getApiMessage ---
assert('getApiMessage detail array', getApiMessage({
  detail: [{ msg: 'Input should be a valid integer' }],
}, 'es') === 'Input should be a valid integer')

assert('getApiMessage business message', getApiMessage({
  success: false,
  message: 'No encontramos una oportunidad con suficiente ventaja estadística para este partido.',
}, 'es').includes('oportunidad'))

// --- UUID user: never send UUID as chat_id ---
let capturedBody = null
const rUuidOnly = await withMockFetch(
  async (_url, opts) => {
    capturedBody = JSON.parse(opts.body)
    return {
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        message: 'No encontramos una oportunidad con suficiente ventaja estadística para este partido.',
      }),
    }
  },
  () => analyzeMatch(
    'Mexico vs South Africa',
    'es',
    { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
  ),
)
assert('UUID-only payload chat_id null', capturedBody.chat_id === null)
assert('UUID-only payload no UUID', !Object.values(capturedBody).includes('a1b2c3d4-e5f6-7890-abcd-ef1234567890'))
assertStringMessage('UUID-only response', rUuidOnly.message)
assert('UUID-only noPick', rUuidOnly.noPick === true)

// --- 422 validation detail array: controlled error, not noPick ---
const rVal422 = await withMockFetch(
  async () => ({
    ok: false,
    status: 422,
    json: async () => ({
      detail: [{ type: 'int_parsing', msg: 'Input should be a valid integer' }],
    }),
  }),
  () => analyzeMatch('Mexico vs South Africa', 'es', { id: 'uuid-only' }),
)
assert('validation 422 not noPick', rVal422.noPick !== true, JSON.stringify(rVal422))
assert('validation 422 success false', rVal422.success === false)
assertStringMessage('validation 422', rVal422.message)

// --- 422 business no pick → UI "Sin pick claro" ---
const r422 = await withMockFetch(
  async () => ({
    ok: false,
    status: 422,
    json: async () => ({
      success: false,
      message: 'No encontramos una oportunidad con suficiente ventaja estadística para este partido.',
    }),
  }),
  () => analyzeMatch('Mexico vs South Africa', 'es'),
)
assert('422 business noPick', r422.noPick === true && !r422.error, JSON.stringify(r422))
assertStringMessage('422 business', r422.message)

// --- 404 not found → UI "Partido no encontrado" ---
const r404 = await withMockFetch(
  async () => ({
    ok: false,
    status: 404,
    json: async () => ({
      success: false,
      message: 'Partido no encontrado. Verifica nombres y fecha.',
    }),
  }),
  () => analyzeMatch('Equipo Inventado A vs Equipo Inventado B', 'es'),
)
assert('404 notFound', r404.notFound === true && !r404.error, JSON.stringify(r404))
assertStringMessage('404', r404.message)

// --- network error → connection message ---
const rNet = await withMockFetch(
  async () => { throw new TypeError('Failed to fetch') },
  () => analyzeMatch('Barcelona vs Real Madrid', 'es'),
)
assert('network error flag', rNet.error === true, JSON.stringify(rNet))
assert('network message', rNet.message.includes('conectar'), rNet.message)
assertStringMessage('network', rNet.message)

console.log('\nAll tests passed.')
