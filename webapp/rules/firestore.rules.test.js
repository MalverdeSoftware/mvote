import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  assertFails, assertSucceeds, initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, runTransaction, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const RULES = readFileSync(fileURLToPath(new URL('../../firestore.rules', import.meta.url)), 'utf8');
const BOARD = 'b1';

let env;
let db;

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-mvote', firestore: { rules: RULES } });
});

afterAll(() => env.cleanup());

async function seed({ closed = false, dots = 8, votes = {}, done } = {}) {
  await env.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, 'boards', BOARD), { title: 'T', items: [], closed });
    await setDoc(doc(admin, 'boards', BOARD, 'votes', 'a'), { count: 0 });
    await setDoc(doc(admin, 'boards', BOARD, 'votes', 'b'), { count: 0 });
    await setDoc(doc(admin, 'boards', BOARD, 'participants', 'p1'), {
      remaining_dots: dots, votes, ...(done === undefined ? {} : { done }),
    });
  });
}

const participant = (id = 'p1') => doc(db, 'boards', BOARD, 'participants', id);
const vote = (item = 'a') => doc(db, 'boards', BOARD, 'votes', item);

// The same writes the web app's castVote makes.
function castVote(item = 'a', voter = 'p1') {
  return runTransaction(db, async (tx) => {
    const p = (await tx.get(participant(voter))).data();
    const v = (await tx.get(vote(item))).data();
    tx.update(participant(voter), {
      remaining_dots: p.remaining_dots - 1,
      last_item: item,
      votes: { ...p.votes, [item]: (p.votes[item] || 0) + 1 },
    });
    tx.update(vote(item), { count: v.count + 1, last_voter: voter });
  });
}

beforeEach(async () => {
  await env.clearFirestore();
  db = env.unauthenticatedContext().firestore();
});

describe('casting a vote', () => {
  it('allows a dot spent and a vote added together', async () => {
    await seed();
    await assertSucceeds(castVote('a'));
    await assertSucceeds(castVote('a'));
    await assertSucceeds(castVote('b'));
  });

  it('refuses a vote added without spending a dot', async () => {
    await seed();
    await assertFails(updateDoc(vote('a'), { count: 1, last_voter: 'p1' }));
  });

  it('refuses a dot spent without adding the vote', async () => {
    await seed();
    await assertFails(updateDoc(participant(), { remaining_dots: 7, last_item: 'a', votes: { a: 1 } }));
  });

  it('refuses a dot spent on one item while the vote goes to another', async () => {
    await seed();
    const batch = writeBatch(db);
    batch.update(participant(), { remaining_dots: 7, last_item: 'a', votes: { a: 1 } });
    batch.update(vote('b'), { count: 1, last_voter: 'p1' });
    await assertFails(batch.commit());
  });

  it('refuses a vote credited to a different participant', async () => {
    await seed();
    const batch = writeBatch(db);
    batch.update(participant(), { remaining_dots: 7, last_item: 'a', votes: { a: 1 } });
    batch.update(vote('a'), { count: 1, last_voter: 'someone-else' });
    await assertFails(batch.commit());
  });

  it('refuses a vote once the dots run out', async () => {
    await seed({ dots: 0, votes: { a: 8 } });
    await assertFails(castVote('a'));
  });
});

describe('extra dots', () => {
  it('allows four more once a participant runs out', async () => {
    await seed({ dots: 0, votes: { a: 8 } });
    await assertSucceeds(updateDoc(participant(), { remaining_dots: 4 }));
  });

  it('refuses extra dots that also change the votes', async () => {
    await seed({ dots: 0, votes: { a: 8 } });
    await assertFails(updateDoc(participant(), { remaining_dots: 4, votes: {} }));
  });
});

describe('a closed board', () => {
  it('refuses new participants, votes and extra dots', async () => {
    await seed({ closed: true });
    await assertFails(setDoc(participant('p2'), { remaining_dots: 8, votes: {} }));
    await assertFails(castVote('a'));
    await env.withSecurityRulesDisabled((c) => updateDoc(doc(c.firestore(), 'boards', BOARD, 'participants', 'p1'), { remaining_dots: 0 }));
    await assertFails(updateDoc(participant(), { remaining_dots: 4 }));
  });

  it('still lets anyone read the board and its counts', async () => {
    await seed({ closed: true });
    await assertSucceeds(getDoc(doc(db, 'boards', BOARD)));
    await assertSucceeds(getDoc(vote('a')));
    await assertSucceeds(getDoc(participant()));
  });

  it('takes votes again after it is reopened', async () => {
    await seed({ closed: true });
    await env.withSecurityRulesDisabled((c) => updateDoc(doc(c.firestore(), 'boards', BOARD), { closed: false }));
    await assertSucceeds(castVote('a'));
  });
});

describe("I'm done voting", () => {
  it('lets a participant mark themselves done and then keep voting', async () => {
    await seed();
    await assertSucceeds(updateDoc(participant(), { done: true }));
    await assertSucceeds(updateDoc(participant(), { done: false }));
    await assertSucceeds(castVote('a'));
  });

  it('refuses votes and extra dots while done', async () => {
    await seed({ done: true });
    await assertFails(castVote('a'));
    await env.withSecurityRulesDisabled((c) => updateDoc(doc(c.firestore(), 'boards', BOARD, 'participants', 'p1'), { remaining_dots: 0 }));
    await assertFails(updateDoc(participant(), { remaining_dots: 4 }));
  });

  it('refuses a done change that also changes dots', async () => {
    await seed();
    await assertFails(updateDoc(participant(), { done: true, remaining_dots: 20 }));
  });

  it('refuses a done value that is not true or false', async () => {
    await seed();
    await assertFails(updateDoc(participant(), { done: 'yes' }));
  });
});

describe('joining', () => {
  it('allows a new participant with 8 dots and no votes', async () => {
    await seed();
    await assertSucceeds(setDoc(participant('p2'), { remaining_dots: 8, votes: {} }));
  });

  it('refuses a new participant with extra fields', async () => {
    await seed();
    await assertFails(setDoc(participant('p2'), { remaining_dots: 8, votes: {}, last_item: 'a' }));
  });
});
