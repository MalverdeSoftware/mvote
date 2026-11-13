import { describe, expect, it, vi } from 'vitest';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));
vi.mock('firebase/firestore', () => ({ initializeFirestore: vi.fn() }));

describe('offline demo isolation', () => {
  it('does not initialize Firebase when the mock store is selected', async () => {
    const { db } = await import('./firebase.js');
    const { initializeApp } = await import('firebase/app');
    const { initializeFirestore } = await import('firebase/firestore');
    expect(db).toBeNull();
    expect(initializeApp).not.toHaveBeenCalled();
    expect(initializeFirestore).not.toHaveBeenCalled();
  });
});
