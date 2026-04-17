import './SecurityScoreBadge.css';
export default function SecurityScoreBadge({ score }) {
  return (
    <span className="score-badge score-badge--security">
      <span className="score-badge__label">SECURITY</span>
      <span className="score-badge__value">{score}/10</span>
    </span>
  );
}
