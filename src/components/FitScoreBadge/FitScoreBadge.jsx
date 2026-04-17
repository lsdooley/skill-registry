import './FitScoreBadge.css';

export default function FitScoreBadge({ label, score }) {
  const tier = score >= 90 ? 'high' : score >= 80 ? 'mid' : 'low';
  return (
    <span className={`fit-badge fit-badge--${tier}`}>
      <span className="fit-badge__label">{label}</span>
      <span className="fit-badge__value">{score}</span>
    </span>
  );
}
