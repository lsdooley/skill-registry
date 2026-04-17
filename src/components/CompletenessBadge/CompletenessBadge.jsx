import './CompletenessBadge.css';
export default function CompletenessBadge({ score }) {
  return (
    <span className="score-badge score-badge--completeness">
      <span className="score-badge__label">COMPLETENESS</span>
      <span className="score-badge__value">{score}/10</span>
    </span>
  );
}
