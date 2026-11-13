import { afterEach, describe, expect, it, vi } from 'vitest';
import { getParticipantId } from './participantId.js';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('getParticipantId', () => {
  it('keeps one id per board in this browser', () => {
    const id = getParticipantId('board-a');
    expect(getParticipantId('board-a')).toBe(id);
    expect(getParticipantId('board-b')).not.toBe(id);
  });

  it('still gives a stable id when the browser blocks storage', () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    const id = getParticipantId('board-c');
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(getParticipantId('board-c')).toBe(id);
  });
});
