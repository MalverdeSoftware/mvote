import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { TRACK_PARTICIPANT_COLORS } from '../config.js';

const STARTING_DOTS = 8;
const REUP_DOTS = 4;

export async function loadBoard(boardId) {
  const snapshot = await getDoc(doc(db, 'boards', boardId));
  if (!snapshot.exists()) {
    throw new Error(`Board '${boardId}' not found.`);
  }
  const data = snapshot.data();
  return { boardId, title: data.title, items: data.items, closed: Boolean(data.closed) };
}

// Calls back with true or false whenever the facilitator closes or reopens the board.
export function subscribeBoardStatus(boardId, callback) {
  return onSnapshot(doc(db, 'boards', boardId), (snapshot) => {
    callback(Boolean(snapshot.data()?.closed));
  }, () => {});
}

// onError is called if the live connection ends; Firestore stops the listener when that happens.
export function subscribeVotes(boardId, callback, onError) {
  const votesRef = collection(db, 'boards', boardId, 'votes');
  return onSnapshot(votesRef, (snapshot) => {
    const counts = {};
    snapshot.forEach((d) => {
      const data = d.data() || {};
      counts[d.id] = { count: data.count || 0, placements: data.placements || [] };
    });
    callback(counts);
  }, onError);
}

export async function joinParticipant(boardId, participantId) {
  const participantRef = doc(db, 'boards', boardId, 'participants', participantId);
  const snapshot = await getDoc(participantRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    return { remainingDots: data.remaining_dots, votes: data.votes || {}, done: Boolean(data.done) };
  }
  const initial = { remaining_dots: STARTING_DOTS, votes: {} };
  await setDoc(participantRef, initial);
  return { remainingDots: initial.remaining_dots, votes: initial.votes, done: false };
}

export async function castVote(boardId, participantId, itemId) {
  const participantRef = doc(db, 'boards', boardId, 'participants', participantId);
  const voteRef = doc(db, 'boards', boardId, 'votes', itemId);

  return runTransaction(db, async (tx) => {
    const participantSnap = await tx.get(participantRef);
    const voteSnap = await tx.get(voteRef);

    if (!participantSnap.exists()) {
      throw new Error('Join the board before voting.');
    }
    const participant = participantSnap.data();
    if (participant.remaining_dots <= 0) {
      throw new Error('No dots remaining.');
    }

    const currentVoteData = voteSnap.exists() ? voteSnap.data() : {};
    const currentCount = currentVoteData.count || 0;
    const currentParticipantVotes = participant.votes || {};

    // last_item and last_voter let the security rules match the dot to the vote.
    const updatedParticipant = {
      remaining_dots: participant.remaining_dots - 1,
      last_item: itemId,
      votes: {
        ...currentParticipantVotes,
        [itemId]: (currentParticipantVotes[itemId] || 0) + 1,
      },
    };

    const updatedVote = { count: currentCount + 1, last_voter: participantId };
    if (TRACK_PARTICIPANT_COLORS) {
      updatedVote.placements = [...(currentVoteData.placements || []), participantId];
    }

    tx.update(participantRef, updatedParticipant);
    tx.update(voteRef, updatedVote);

    return { remainingDots: updatedParticipant.remaining_dots, votes: updatedParticipant.votes, done: false };
  });
}

export async function requestMoreDots(boardId, participantId) {
  const participantRef = doc(db, 'boards', boardId, 'participants', participantId);

  return runTransaction(db, async (tx) => {
    const participantSnap = await tx.get(participantRef);
    if (!participantSnap.exists()) {
      throw new Error('Join the board before requesting dots.');
    }
    const participant = participantSnap.data();
    if (participant.remaining_dots > 0) {
      throw new Error('Dots can only be requested once you run out.');
    }
    const updatedDots = REUP_DOTS;
    tx.update(participantRef, { remaining_dots: updatedDots });
    return { remainingDots: updatedDots, votes: participant.votes || {} };
  });
}

// "I'm done voting" (true) or "Keep voting" (false). The facilitator sees the
// done count with `mvote status`.
export async function setDone(boardId, participantId, done) {
  await updateDoc(doc(db, 'boards', boardId, 'participants', participantId), { done });
  return done;
}
