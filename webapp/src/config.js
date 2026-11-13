// When true, each cast vote also records which participant placed it, so
// dots can be colored consistently per participant across every card.
// Off by default: a plain count is more privacy-conscious for youth
// research data and needs no extra writes. Researchers who want the
// participant-linked view can set VITE_TRACK_PARTICIPANT_COLORS=true.
export const TRACK_PARTICIPANT_COLORS = import.meta.env.VITE_TRACK_PARTICIPANT_COLORS === 'true';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Dot shape in the voting board. Defaults to plain circles. Set
// VITE_DOT_SHAPE=star for stars like the physical stickers in the in-person
// activity.
export const DOT_SHAPE = import.meta.env.VITE_DOT_SHAPE === 'star' ? 'star' : 'circle';
