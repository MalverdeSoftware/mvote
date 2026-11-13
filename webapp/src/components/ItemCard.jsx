import { useId, useState } from 'react';
import addIcon from '@jetbrains/icons/add-20px';
import Button from '@jetbrains/ring-ui-built/components/button/button';
import { ControlsHeight } from '@jetbrains/ring-ui-built/components/global/controls-height';
import { H2 } from '@jetbrains/ring-ui-built/components/heading/heading';
import Icon from '@jetbrains/ring-ui-built/components/icon/icon';
import Text from '@jetbrains/ring-ui-built/components/text/text';
import DotCluster from './DotCluster.jsx';

export default function ItemCard({ item, voteCount, placements, yourVotes, disabled, onVote }) {
  const [showDescription, setShowDescription] = useState(false);
  const descriptionId = useId();

  return (
    <article className={showDescription ? 'item-card item-card--open' : 'item-card'}>
      <H2 className="item-card__title">{item.label}</H2>
      {item.description && (
        <Button
          inline
          className="item-card__info-toggle"
          aria-expanded={showDescription}
          aria-controls={descriptionId}
          aria-label={showDescription ? `Hide description of ${item.label}` : `What's this? ${item.label}`}
          onClick={() => setShowDescription((shown) => !shown)}
        >
          {showDescription ? 'Hide' : "What's this?"}
        </Button>
      )}
      <p id={descriptionId} className="item-card__description" hidden={!showDescription}>
        <Text info>{item.description}</Text>
      </p>
      {/* Fixed height, so other people's dots arriving live never move a "+"
          button out from under someone's finger. */}
      <DotCluster itemId={item.id} count={voteCount} placements={placements} />
      <div className="item-card__footer">
        <Text info className="item-card__tally">
          <span aria-label={`${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`}>
            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
          </span>
          {yourVotes > 0 && <span className="item-card__yours">{`you: ${yourVotes}`}</span>}
        </Text>
        <Button
          primary
          height={ControlsHeight.L}
          className="touch-button"
          onClick={onVote}
          disabled={disabled}
          aria-label={`Add a dot to ${item.label}`}
        >
          {/* As a child, not Ring's icon prop: that renders a borderless
              icon button, and this needs to read as the main action. */}
          <Icon glyph={addIcon} />
        </Button>
      </div>
    </article>
  );
}
