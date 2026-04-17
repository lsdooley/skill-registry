import './ComplexityBadge.css';
export default function ComplexityBadge({ complexity }) {
  const cls = complexity?.toLowerCase() || 'easy';
  return <span className={`complexity-badge complexity-badge--${cls}`}>{complexity}</span>;
}
