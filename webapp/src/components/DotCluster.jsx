import { DOT_SHAPE, TRACK_PARTICIPANT_COLORS } from '../config.js';
import { decorativeColor, dotPosition, participantColor } from '../dotColors.js';

export default function DotCluster({ itemId, count, placements }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const placedBy = placements && placements[i];
    const color = TRACK_PARTICIPANT_COLORS && placedBy
      ? participantColor(placedBy)
      : decorativeColor(itemId, i);
    return { key: i, color, position: dotPosition(itemId, i) };
  });

  return (
    <div className="dot-cluster" aria-hidden="true">
      {dots.map((dot) => (
        <span
          key={dot.key}
          className={`dot-cluster__dot dot-cluster__dot--${DOT_SHAPE}`}
          style={{
            background: dot.color,
            left: dot.position.left,
            top: dot.position.top,
          }}
        />
      ))}
    </div>
  );
}
