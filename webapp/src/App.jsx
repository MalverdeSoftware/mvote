import { H1 } from '@jetbrains/ring-ui-built/components/heading/heading';
import Text from '@jetbrains/ring-ui-built/components/text/text';
import Frame from './components/Frame.jsx';
import VotingBoard from './components/VotingBoard.jsx';

function getBoardIdFromPath() {
  const segment = window.location.pathname.replace(/^\/+|\/+$/g, '');
  return segment || null;
}

export default function App() {
  const boardId = getBoardIdFromPath();

  if (!boardId) {
    return (
      <Frame>
        <main className="page-centered">
          <H1>mVote</H1>
          <p><Text>Open the link your facilitator shared to join a voting session.</Text></p>
        </main>
      </Frame>
    );
  }

  return (
    <Frame>
      <VotingBoard boardId={boardId} />
    </Frame>
  );
}
