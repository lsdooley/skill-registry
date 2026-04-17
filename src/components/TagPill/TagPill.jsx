import { useNavigate } from 'react-router-dom';
import './TagPill.css';

const TAG_COLORS = {
  'Architecture':                    'primary',
  'Security & Compliance':           'warning',
  'AWS & Cloud':                     'blue',
  'DevOps & GitOps':                 'success',
  'AI & Knowledge Systems':          'purple',
  'Finance & Risk':                  'gold',
  'C-Level & Governance':            'orange',
  'Data & Integration':              'primary',
  'Contract & SOW Review':           'neutral',
  'GRC & Third-Party Risk':          'warning',
  'Cloud Reference Architecture':    'blue',
  'Legacy Modernization':            'gold',
  'Security Architecture (Expanded)':'warning',
};

export default function TagPill({ tag, clickable = false }) {
  const navigate = useNavigate();
  const color = TAG_COLORS[tag] || 'neutral';
  const handleClick = clickable ? () => navigate(`/browse?category=${tag}`) : undefined;
  return (
    <span
      className={`tag-pill tag-pill--${color} ${clickable ? 'tag-pill--clickable' : ''}`}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
    >
      {tag}
    </span>
  );
}
