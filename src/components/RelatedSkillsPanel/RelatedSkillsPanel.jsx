import { Link } from 'react-router-dom';
import SkillCard from '../SkillCard/SkillCard';
import './RelatedSkillsPanel.css';

export default function RelatedSkillsPanel({ skills }) {
  if (!skills?.length) return null;
  return (
    <section className="related-panel">
      <div className="related-panel__header">
        <h2>Related Skills</h2>
        <Link to="/browse">Browse all →</Link>
      </div>
      <div className="related-panel__scroll">
        {skills.map(s => <SkillCard key={s.id} skill={s} />)}
      </div>
    </section>
  );
}
