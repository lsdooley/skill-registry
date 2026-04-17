import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './AuthorBadge.css';

function Avatar({ handle, size = 20 }) {
  const initials = handle.slice(0, 2).toUpperCase();
  const hue = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div className="author-avatar" style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

export default function AuthorBadge({ owner, verified = false, size = 'sm', linkable = false }) {
  const inner = (
    <>
      <Avatar handle={owner} size={size === 'sm' ? 18 : 24} />
      <span className="author-badge__handle">{owner}</span>
      {verified && <CheckCircle size={size === 'sm' ? 12 : 14} className="author-badge__verified" />}
    </>
  );
  if (linkable) {
    return (
      <Link to={`/browse/authors/${owner}`} className={`author-badge author-badge--${size}`}>
        {inner}
      </Link>
    );
  }
  return <span className={`author-badge author-badge--${size}`}>{inner}</span>;
}
