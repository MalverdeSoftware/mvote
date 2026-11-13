import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import VotingBoard from './VotingBoard.jsx';

function uniqueBoardId() {
  return `test-board-${Math.random().toString(36).slice(2)}`;
}

beforeEach(() => {
  localStorage.clear();
});

describe('VotingBoard', () => {
  it('loads the board and shows the starting dot budget', async () => {
    render(<VotingBoard boardId={uniqueBoardId()} />);

    expect(await screen.findByText('Demo board (mock data)')).toBeInTheDocument();
    expect(screen.getByLabelText('8 dots left')).toBeInTheDocument();
    expect(screen.getByText('School connectedness')).toBeInTheDocument();
  });

  it('casts a vote, incrementing the count and decrementing remaining dots', async () => {
    render(<VotingBoard boardId={uniqueBoardId()} />);
    await screen.findByText('School connectedness');

    fireEvent.click(screen.getByLabelText('Add a dot to School connectedness'));

    await waitFor(() => expect(screen.getByLabelText('7 dots left')).toBeInTheDocument());
    expect(screen.getByLabelText('1 vote')).toBeInTheDocument();
    expect(screen.getByText('you: 1')).toBeInTheDocument();
  });

  it('allows multiple dots on the same favorite item', async () => {
    render(<VotingBoard boardId={uniqueBoardId()} />);
    await screen.findByText('School connectedness');
    const voteButton = screen.getByLabelText('Add a dot to School connectedness');

    fireEvent.click(voteButton);
    await waitFor(() => expect(screen.getByLabelText('7 dots left')).toBeInTheDocument());
    fireEvent.click(voteButton);

    await waitFor(() => expect(screen.getByLabelText('2 votes')).toBeInTheDocument());
    expect(screen.getByText('you: 2')).toBeInTheDocument();
  });

  it('offers a re-up once all dots are spent, and grants 4 more', async () => {
    render(<VotingBoard boardId={uniqueBoardId()} />);
    await screen.findByText('School connectedness');
    const voteButton = screen.getByLabelText('Add a dot to School connectedness');

    for (let i = 0; i < 8; i++) {
      fireEvent.click(voteButton);
      await waitFor(() => expect(screen.getByLabelText(`${i + 1} ${i === 0 ? 'vote' : 'votes'}`)).toBeInTheDocument());
    }

    expect(screen.getByLabelText('0 dots left')).toBeInTheDocument();
    const reupButton = await screen.findByText('Request more dots (+4)');

    fireEvent.click(reupButton);

    await waitFor(() => expect(screen.getByLabelText('4 dots left')).toBeInTheDocument());
  });

  it('says "dot" rather than "dots" when one is left', async () => {
    render(<VotingBoard boardId={uniqueBoardId()} />);
    await screen.findByText('School connectedness');
    const voteButton = screen.getByLabelText('Add a dot to School connectedness');

    for (let i = 0; i < 7; i++) {
      fireEvent.click(voteButton);
      await waitFor(() => expect(screen.getByLabelText(`${8 - i - 1} ${8 - i - 1 === 1 ? 'dot' : 'dots'} left`)).toBeInTheDocument());
    }

    expect(screen.getByText('dot left')).toBeInTheDocument();
  });

  it('reveals and hides an item description without spending a dot', async () => {
    render(<VotingBoard boardId={uniqueBoardId()} />);
    await screen.findByText('Self-efficacy');
    const description = screen.getByText(/Confidence in one's abilities/);
    expect(description).not.toBeVisible();

    const toggle = screen.getByRole('button', { name: "What's this? Self-efficacy" });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);

    expect(description).toBeVisible();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('8 dots left')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hide description of Self-efficacy' }));
    expect(description).not.toBeVisible();
  });
});
