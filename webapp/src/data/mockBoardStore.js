import { TRACK_PARTICIPANT_COLORS } from '../config.js';

const STARTING_DOTS = 8;
const REUP_DOTS = 4;

const DEMO_ITEMS = [
  { id: 'school_connectedness', label: 'School connectedness', description: 'Belonging, closeness, acceptance, and feeling valued as a member of the school community.' },
  { id: 'bullying', label: 'Bullying', description: 'Bullying and harassment, including verbal, physical, relational, online, and identity-based experiences.' },
  { id: 'sleep', label: 'Sleep', description: 'Sleep duration, bedtime and waking schedules, and reported sleep difficulties.' },
  { id: 'anxiety', label: 'Anxiety', description: 'Worry, nervousness, panic, fear, tension, and difficulty relaxing.' },
  { id: 'depressive_symptoms', label: 'Depressive symptoms', description: 'Self-reported sadness, hopelessness, loss of interest, and related depressive symptoms.' },
  { id: 'self_efficacy', label: 'Self-efficacy', description: "Confidence in one's abilities and capacity to succeed or handle challenges." },
];

const boards = new Map();
const participants = new Map();
const voteListeners = new Map();
const statusListeners = new Map();

function participantKey(boardId, participantId) {
  return `${boardId}:${participantId}`;
}

function ensureBoard(boardId) {
  if (!boards.has(boardId)) {
    const votes = {};
    for (const item of DEMO_ITEMS) votes[item.id] = { count: 0, placements: [] };
    boards.set(boardId, {
      boardId,
      title: 'Demo board (mock data)',
      items: DEMO_ITEMS,
      votes,
      closed: false,
    });
  }
  return boards.get(boardId);
}

function notifyVoteListeners(boardId) {
  const board = ensureBoard(boardId);
  const listeners = voteListeners.get(boardId) || [];
  for (const cb of listeners) cb({ ...board.votes });
}

export async function loadBoard(boardId) {
  const board = ensureBoard(boardId);
  return { boardId: board.boardId, title: board.title, items: board.items, closed: board.closed };
}

export function subscribeBoardStatus(boardId, callback) {
  if (!statusListeners.has(boardId)) statusListeners.set(boardId, []);
  statusListeners.get(boardId).push(callback);
  callback(ensureBoard(boardId).closed);
  return () => {
    statusListeners.set(boardId, statusListeners.get(boardId).filter((cb) => cb !== callback));
  };
}

// Stands in for `mvote close` / `mvote reopen` in tests and the local demo.
export function setBoardClosed(boardId, closed) {
  ensureBoard(boardId).closed = closed;
  for (const cb of statusListeners.get(boardId) || []) cb(closed);
}

function assertOpen(boardId) {
  if (ensureBoard(boardId).closed) throw new Error('This session is closed.');
}

export function subscribeVotes(boardId, callback) {
  if (!voteListeners.has(boardId)) voteListeners.set(boardId, []);
  voteListeners.get(boardId).push(callback);
  callback({ ...ensureBoard(boardId).votes });
  return () => {
    voteListeners.set(boardId, voteListeners.get(boardId).filter((cb) => cb !== callback));
  };
}

export async function joinParticipant(boardId, participantId) {
  const key = participantKey(boardId, participantId);
  if (!participants.has(key)) {
    participants.set(key, { remainingDots: STARTING_DOTS, votes: {} });
  }
  return { ...participants.get(key) };
}

export async function castVote(boardId, participantId, itemId) {
  assertOpen(boardId);
  const key = participantKey(boardId, participantId);
  const participant = participants.get(key);
  if (!participant || participant.remainingDots <= 0) {
    throw new Error('No dots remaining.');
  }
  participant.remainingDots -= 1;
  participant.votes[itemId] = (participant.votes[itemId] || 0) + 1;
  const board = ensureBoard(boardId);
  const itemVotes = board.votes[itemId] || { count: 0, placements: [] };
  itemVotes.count += 1;
  if (TRACK_PARTICIPANT_COLORS) itemVotes.placements.push(participantId);
  board.votes[itemId] = itemVotes;
  notifyVoteListeners(boardId);
  return { ...participant };
}

export async function requestMoreDots(boardId, participantId) {
  assertOpen(boardId);
  const key = participantKey(boardId, participantId);
  const participant = participants.get(key);
  if (!participant || participant.remainingDots > 0) {
    throw new Error('Dots can only be requested once you run out.');
  }
  participant.remainingDots += REUP_DOTS;
  return { ...participant };
}
