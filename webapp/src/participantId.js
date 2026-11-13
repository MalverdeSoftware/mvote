const STORAGE_PREFIX = 'mvote:participant:';

/**
 * Returns this browser's participant id for a given board, generating and
 * persisting a new random one on first visit. No account, no server round
 * trip — the id just needs to be stable across a single participant's
 * session on this device.
 */
export function getParticipantId(boardId) {
  const key = STORAGE_PREFIX + boardId;
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
