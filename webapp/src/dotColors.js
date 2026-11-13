// Vivid, highly saturated — echoing the holographic star stickers used in
// the original in-person activity, not the muted card/background palette.
// Deliberately a wide, maximized spread across the spectrum for variety.
const PALETTE = [
  '#ff3b3b', '#ff8a00', '#ffd400', '#4cd964', '#00c2a8',
  '#2ec4ff', '#1554f0', '#7c4dff', '#d400ff', '#ff2d95',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// MurmurHash3 finalizer — spreads bits so that inputs differing only in a
// small integer (like consecutive dot indices) don't produce near-identical
// output, which a plain rolling hash does.
function fmix32(h) {
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Purely decorative color — no meaning attached to a given dot. Seeded by
 * itemId + index (not just index) so different items don't all show the
 * same color sequence — each card gets its own varied, shuffled-looking
 * order instead of every first dot being the same color.
 */
export function decorativeColor(itemId, index) {
  const base = hashString(`${itemId}#color`);
  const seed = fmix32((base ^ Math.imul(index + 1, 0x27d4eb2f)) >>> 0);
  return PALETTE[seed % PALETTE.length];
}

/** Stable color for a participant id, so the same person's dots match across cards. */
export function participantColor(participantId) {
  return PALETTE[hashString(participantId) % PALETTE.length];
}

/** Deterministic scatter position within a card's dot cluster, stable across re-renders. */
export function dotPosition(itemId, index) {
  const base = hashString(itemId);
  const seed = fmix32((base ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0);
  const x = 14 + (seed % 72);
  const y = 12 + ((seed >>> 8) % 66);
  return { left: `${x}%`, top: `${y}%` };
}
