import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { SKILLS } from '../../data/skills';
import SkillDetailBody from '../../components/SkillDetailBody/SkillDetailBody';
import InstallWidget from '../../components/InstallWidget/InstallWidget';
import FitScoreBadge from '../../components/FitScoreBadge/FitScoreBadge';
import RiskBadge from '../../components/RiskBadge/RiskBadge';
import VersionBadge from '../../components/VersionBadge/VersionBadge';
import AuthorBadge from '../../components/AuthorBadge/AuthorBadge';
import TagPill from '../../components/TagPill/TagPill';
import RelatedSkillsPanel from '../../components/RelatedSkillsPanel/RelatedSkillsPanel';
import './SkillDetailPage.css';

export default function SkillDetailPage() {
  const { owner, slug } = useParams();
  const skill = SKILLS.find(s => s.owner === owner && s.slug === slug);

  if (!skill) return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h2>Skill not found</h2>
      <Link to="/browse">← Back to Browse</Link>
    </div>
  );

  const related = SKILLS
    .filter(s => s.id !== skill.id && s.categorySlug === skill.categorySlug)
    .slice(0, 4);

  const handleShare = () => navigator.clipboard.writeText(window.location.href);

  return (
    <div className="skill-detail-page">
      <div className="container">
        <Link to="/browse" className="skill-detail__back"><ArrowLeft size={14} /> All skills</Link>

        {/* Header */}
        <div className="skill-detail__header">
          <div className="skill-detail__header-main">
            <h1 className="skill-detail__title">{skill.title}</h1>
            <button className="skill-detail__share" onClick={handleShare} title="Share"><Share2 size={16} /></button>
          </div>
          <div className="skill-detail__meta">
            <VersionBadge version={skill.version} />
            <FitScoreBadge label="EA FIT" score={skill.eaFit} />
            <FitScoreBadge label="BANKING FIT" score={skill.bankingFit} />
            <RiskBadge risk={skill.risk} />
          </div>
          <div className="skill-detail__author-row">
            <span>by</span>
            <AuthorBadge owner={skill.owner} size="md" linkable />
            <TagPill tag={skill.category} clickable />
          </div>
        </div>

        {/* Install widget */}
        <div className="skill-detail__install">
          <InstallWidget owner={skill.owner} slug={skill.slug} body={skill.body} />
        </div>

        {/* 5-tab body — shared with homepage panel */}
        <SkillDetailBody skill={skill} />

        <RelatedSkillsPanel skills={related} />
      </div>
    </div>
  );
}
