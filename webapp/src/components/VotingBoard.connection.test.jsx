import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { joinParticipant, loadBoard } from '../data/index.js';
import VotingBoard from './VotingBoard.jsx';

vi.mock('../data/index.js', async (importOriginal) => ({
  ...(await importOriginal()),
  loadBoard: vi.fn(),
  joinParticipant: vi.fn(),
}));

const BOARD = { boardId: 'b', title: 'Board', items: [] };
const never = () => new Promise(() => {});

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe('VotingBoard when the connection fails', () => {
  it('tells the participant what to try when loading stalls', () => {
    loadBoard.mockImplementation(never);
    joinParticipant.mockImplementation(never);
    render(<VotingBoard boardId="b" />);

    act(() => { vi.advanceTimersByTime(9999); });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole('status')).toHaveTextContent('switching between wifi and cellular');
    expect(screen.getByText('Loading board…')).toBeInTheDocument();
  });

  it('still opens the board if the connection recovers after the hint appears', async () => {
    let finishLoad;
    loadBoard.mockImplementation(() => new Promise((resolve) => { finishLoad = resolve; }));
    joinParticipant.mockResolvedValue({ remainingDots: 8, votes: {} });
    render(<VotingBoard boardId="b" />);

    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByRole('status')).toBeInTheDocument();

    await act(async () => { finishLoad(BOARD); });
    expect(screen.getByRole('heading', { name: 'Board' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the error if joining fails after the board loaded', async () => {
    loadBoard.mockResolvedValue(BOARD);
    joinParticipant.mockRejectedValue(new Error('Could not join.'));
    render(<VotingBoard boardId="b" />);

    await act(async () => {});
    expect(screen.getByRole('alert')).toHaveTextContent('Could not join.');
  });
});
