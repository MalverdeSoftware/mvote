import { useEffect, useRef, useState } from 'react';
import Banner from '@jetbrains/ring-ui-built/components/banner/banner';
import Button from '@jetbrains/ring-ui-built/components/button/button';
import { ControlsHeight } from '@jetbrains/ring-ui-built/components/global/controls-height';
import { H1 } from '@jetbrains/ring-ui-built/components/heading/heading';
import LoaderInline from '@jetbrains/ring-ui-built/components/loader-inline/loader-inline';
import ProgressBar from '@jetbrains/ring-ui-built/components/progress-bar/progress-bar';
import Text from '@jetbrains/ring-ui-built/components/text/text';
import {
  castVote, joinParticipant, loadBoard, requestMoreDots, subscribeBoardStatus, subscribeVotes,
} from '../data/index.js';
import { getParticipantId } from '../participantId.js';
import ItemCard from './ItemCard.jsx';

// Long enough for Firestore's transport auto-detection on slow venue wifi,
// short enough that a participant isn't left wondering whether it's broken.
const SLOW_CONNECTION_MS = 10000;

export default function VotingBoard({ boardId }) {
  const [board, setBoard] = useState(null);
  const [votes, setVotes] = useState({});
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [connectionSlow, setConnectionSlow] = useState(false);
  const [closed, setClosed] = useState(false);
  const loaded = Boolean(board && participant);
  // A ref, not just the `pending` state: two writes dispatched in the same
  // tick (e.g. a very fast double-tap) can both run before React re-renders
  // with pending=true, so a state check alone lets both through. The ref
  // updates and reads synchronously, so the second call always sees the
  // first one's lock.
  const writeInFlightRef = useRef(false);

  useEffect(() => {
    const participantId = getParticipantId(boardId);

    // A closed board takes no new participants, so someone opening it for
    // the first time just sees the counts, with no dots of their own.
    loadBoard(boardId)
      .then((loadedBoard) => {
        setBoard(loadedBoard);
        setClosed(loadedBoard.closed);
        return joinParticipant(boardId, participantId).catch((e) => {
          if (loadedBoard.closed) return { remainingDots: 0, votes: {} };
          throw e;
        });
      })
      .then(setParticipant)
      .catch((e) => setError(e.message));

    const unsubscribeStatus = subscribeBoardStatus(boardId, setClosed);
    const unsubscribe = subscribeVotes(boardId, setVotes, () =>
      setError('The live vote counts stopped updating. Reload this page to see the latest.'));
    return () => {
      unsubscribe?.();
      unsubscribeStatus?.();
    };
  }, [boardId]);

  useEffect(() => {
    if (loaded) return undefined;
    const timer = setTimeout(() => setConnectionSlow(true), SLOW_CONNECTION_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  // Runs one write at a time and shows its error, if any.
  async function runWrite(write) {
    if (writeInFlightRef.current) return;
    writeInFlightRef.current = true;
    setPending(true);
    try {
      await write(getParticipantId(boardId));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      writeInFlightRef.current = false;
      setPending(false);
    }
  }

  const handleVote = (itemId) =>
    runWrite(async (participantId) => {
      setParticipant(await castVote(boardId, participantId, itemId));
    });

  const handleRequestMoreDots = () =>
    runWrite(async (participantId) => {
      const updated = await requestMoreDots(boardId, participantId);
      setParticipant((prev) => ({ ...prev, remainingDots: updated.remainingDots }));
    });

  if (error && !loaded) {
    return (
      <main className="page-centered">
        <div role="alert"><Banner mode="error" withIcon>{error}</Banner></div>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="page-centered">
        <div><LoaderInline /> <Text>Loading board…</Text></div>
        {connectionSlow && (
          <div role="status" className="connection-hint">
            <Banner mode="warning" withIcon>
              This is taking longer than usual. Try switching between wifi and
              cellular data, then reload this page. If it still won't open, let
              the facilitator know.
            </Banner>
          </div>
        )}
      </main>
    );
  }

  const dotsLeftText = `${participant.remainingDots === 1 ? 'dot' : 'dots'} left`;
  const dotsPlaced = Object.values(participant.votes).reduce((sum, n) => sum + n, 0);
  const totalDots = dotsPlaced + participant.remainingDots;

  return (
    <main className="voting-board">
      <header className="voting-board__header">
        <div className="voting-board__heading">
          <div>
            <H1 className="voting-board__title">{board.title}</H1>
            <Text info>Session code {boardId}</Text>
          </div>
          <div className="count-badge">
            <span aria-label={`${participant.remainingDots} ${dotsLeftText}`}>{participant.remainingDots}</span>
            {' '}
            <span aria-hidden="true">{dotsLeftText}</span>
          </div>
        </div>
        {participant.remainingDots <= 0 && !closed && (
          <Button
            primary
            height={ControlsHeight.L}
            className="touch-button voting-board__more"
            onClick={handleRequestMoreDots}
            disabled={pending}
          >
            Request more dots (+4)
          </Button>
        )}
        <ProgressBar
          staticColor
          className="voting-board__progress"
          value={totalDots > 0 ? dotsPlaced / totalDots : 0}
          label={`${dotsPlaced} of ${totalDots} dots placed`}
        />
      </header>

      {closed && (
        <div role="status" className="voting-board__error">
          <Banner mode="info" withIcon>This session is closed. Voting has ended; the counts below are final.</Banner>
        </div>
      )}

      {error && !closed && <div role="alert" className="voting-board__error"><Banner mode="error" withIcon>{error}</Banner></div>}

      <div className="item-grid">
        {board.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            voteCount={votes[item.id]?.count || 0}
            placements={votes[item.id]?.placements}
            yourVotes={participant.votes[item.id] || 0}
            disabled={closed || participant.remainingDots <= 0 || pending}
            onVote={() => handleVote(item.id)}
          />
        ))}
      </div>
    </main>
  );
}
