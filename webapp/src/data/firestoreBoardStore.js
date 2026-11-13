import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
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
  return { boardId, title: data.title, items: data.items };
}

export function subscribeVotes(boardId, callback) {
  const votesRef = collection(db, 'boards', boardId, 'votes');
  return onSnapshot(votesRef, (snapshot) => {
    const counts = {};
    snapshot.forEach((d) => {
      const data = d.data() || {};
      counts[d.id] = { count: data.count || 0, placements: data.placements || [] };
    });
    callback(counts);
  });
}

export async function joinParticipant(boardId, participantId) {
  const participantRef = doc(db, 'boards', boardId, 'participants', participantId);
  const snapshot = await getDoc(participantRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    return { remainingDots: data.remaining_dots, votes: data.votes || {} };
  }
  const initial = { remaining_dots: STARTING_DOTS, votes: {} };
  await setDoc(participantRef, initial);
  return { remainingDots: initial.remaining_dots, votes: initial.votes };
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

    const updatedParticipant = {
      remaining_dots: participant.remaining_dots - 1,
      votes: {
        ...currentParticipantVotes,
        [itemId]: (currentParticipantVotes[itemId] || 0) + 1,
      },
    };

    const updatedVote = { count: currentCount + 1 };
    if (TRACK_PARTICIPANT_COLORS) {
      updatedVote.placements = [...(currentVoteData.placements || []), participantId];
    }

    tx.update(participantRef, updatedParticipant);
    tx.set(voteRef, updatedVote, { merge: true });

    return { remainingDots: updatedParticipant.remaining_dots, votes: updatedParticipant.votes };
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
