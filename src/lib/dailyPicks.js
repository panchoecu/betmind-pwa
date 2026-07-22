/** Defensive Daily-only filter — exclude WC-tagged picks from the public UI. */

export function isWorldCupPick(pick) {
  if (!pick || typeof pick !== 'object') return false
  return (
    pick.is_world_cup === true ||
    pick.source === 'world_cup_engine' ||
    pick.engine === 'world_cup' ||
    pick.engine === 'wc'
  )
}

export function filterDailyPicks(picks) {
  if (!Array.isArray(picks)) return []
  return picks.filter((pick) => !isWorldCupPick(pick))
}
