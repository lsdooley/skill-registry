import { Link } from 'react-router-dom';
import { ArrowRight, Star, Share2 } from 'lucide-react';
import RiskBadge from '../RiskBadge/RiskBadge';
import VersionBadge from '../VersionBadge/VersionBadge';
import TagPill from '../TagPill/TagPill';
import AuthorBadge from '../AuthorBadge/AuthorBadge';
import './SkillCard.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days/30)}mo ago`;
  return `${Math.floor(days/365)}y ago`;
}

function FitScore({ label, value }) {
  const tier = value >= 90 ? 'high' : value >= 80 ? 'mid' : 'low';
  return (
    <span className={`skill-row__fit-score skill-row__fit-score--${tier}`}>
      {label} <strong>{value}</strong>
    </span>
  );
}

export function SkillRow({ skill, featured = false, comingSoon = false }) {
  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/browse/skills/${skill.owner}/${skill.slug}`);
  };

  const classes = [
    'skill-row',
    featured ? 'skill-row--featured' : '',
    comingSoon ? 'skill-row--coming-soon' : '',
  ].filter(Boolean).join(' ');

  return (
    <Link to={`/browse/skills/${skill.owner}/${skill.slug}`} className={classes}>
      {featured && <span className="skill-row__accent" aria-hidden="true" />}

      <div className="skill-row__left">
        <TagPill tag={skill.category} />
        {featured && (
          <span className="skill-row__featured-badge">
            <Star size={9} fill="currentColor" /> Featured
          </span>
        )}
        {comingSoon && (
          <span className="skill-row__coming-soon-badge">Soon</span>
        )}
      </div>

      <div className="skill-row__content">
        <span className="skill-row__title">{skill.title}</span>
        {skill.summary && (
          <span className="skill-row__summary">{skill.summary}</span>
        )}
      </div>

      <div className="skill-row__meta">
        <FitScore label="EA" value={skill.eaFit} />
        <FitScore label="BANK" value={skill.bankingFit} />
        {!comingSoon && <RiskBadge risk={skill.risk} />}
        {!comingSoon && <VersionBadge version={skill.version} />}
      </div>

      <div className="skill-row__actions">
        {!comingSoon && (
          <button
            className="skill-row__share"
            onClick={handleShare}
            title="Copy link"
            tabIndex={-1}
          >
            <Share2 size={12} />
          </button>
        )}
        <ArrowRight size={15} className="skill-row__arrow" />
      </div>
    </Link>
  );
}

/* Card variant — kept for AuthorPage / RelatedSkillsPanel */
export default function SkillCard({ skill, featured = false }) {
  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/browse/skills/${skill.owner}/${skill.slug}`);
  };

  return (
    <Link to={`/browse/skills/${skill.owner}/${skill.slug}`} className={`skill-card ${featured ? 'skill-card--featured' : ''}`}>
      <div className="skill-card__header">
        <AuthorBadge owner={skill.owner} />
        <span className="skill-card__time">{timeAgo(skill.dateAdded)}</span>
      </div>
      <div className="skill-card__tags">
        <TagPill tag={skill.category} />
        {featured && <span className="skill-card__featured"><Star size={10} fill="currentColor" /> Featured</span>}
      </div>
      <h3 className="skill-card__title">{skill.title}</h3>
      <p className="skill-card__summary">{skill.summary}</p>
      <div className="skill-card__footer">
        <div className="skill-card__meta">
          <VersionBadge version={skill.version} />
          <RiskBadge risk={skill.risk} />
        </div>
        <div className="skill-card__actions">
          <button className="skill-card__share" onClick={handleShare} title="Copy link">
            <Share2 size={13} />
          </button>
          <span className="skill-card__view">View skill <ArrowRight size={12} /></span>
        </div>
      </div>
    </Link>
  );
}
