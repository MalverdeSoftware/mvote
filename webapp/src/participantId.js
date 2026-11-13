const STORAGE_PREFIX = 'mvote:participant:';

// Used when the browser blocks storage (some private modes): the id then
// lasts until the page is reloaded.
const memoryIds = new Map();

/**
 * Returns this browser's participant id for a given board, generating and
 * persisting a new random one on first visit. No account, no server round
 * trip — the id just needs to be stable across a single participant's
 * session on this device.
 */
export function getParticipantId(boardId) {
  const key = STORAGE_PREFIX + boardId;
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    if (!memoryIds.has(key)) memoryIds.set(key, crypto.randomUUID());
    return memoryIds.get(key);
  }
}
