// Selects the real Firestore-backed store, or an in-memory mock for local
// development/testing without Firebase credentials (VITE_USE_MOCK=true).
import { USE_MOCK } from '../config.js';
import * as firestoreBoardStore from './firestoreBoardStore.js';
import * as mockBoardStore from './mockBoardStore.js';

const store = USE_MOCK ? mockBoardStore : firestoreBoardStore;

export const { loadBoard, subscribeVotes, joinParticipant, castVote, requestMoreDots } = store;
