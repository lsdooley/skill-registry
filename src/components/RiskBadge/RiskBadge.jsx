import './RiskBadge.css';

export default function RiskBadge({ risk }) {
  const val = risk?.toLowerCase() || 'low';
  const tier = val === 'critical' ? 'critical' : (val === 'low' || val === 'safe') ? 'low' : 'none';
  const label = val === 'safe' ? 'safe' : val;
  return <span className={`risk-badge risk-badge--${tier}`}>{label}</span>;
}
