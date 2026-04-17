import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { AUTHORS } from '../../data/authors';
import { SKILLS, CATEGORIES } from '../../data/skills';
import SkillCard from '../../components/SkillCard/SkillCard';
import './AuthorPage.css';

function Avatar({ handle, size = 64 }) {
  const initials = handle.slice(0, 2).toUpperCase();
  const hue = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div className="author-avatar-lg" style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

const PAGE_SIZE = 24;

export default function AuthorPage() {
  const { owner } = useParams();
  const [page, setPage] = useState(1);

  const author = AUTHORS.find(a => a.username === owner);
  const skills = SKILLS.filter(s => s.owner === owner);
  const featured = skills.filter(s => s.featured);

  if (!author) return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h2>Author not found</h2>
      <Link to="/browse">← Back to Browse</Link>
    </div>
  );

  // Category breakdown
  const catCounts = CATEGORIES.map(cat => ({
    name: cat.name,
    count: skills.filter(s => s.categorySlug === cat.slug).length,
  })).filter(c => c.count > 0);

  const total = skills.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const pageSkills = skills.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <div className="author-page">
      <div className="container">
        <Link to="/browse" className="author-page__back"><ArrowLeft size={14} /> All skills</Link>

        <div className="author-page__badge-label">SKILL AUTHOR</div>

        <div className="author-page__header">
          <Avatar handle={author.username} size={72} />
          <div className="author-page__info">
            <div className="author-page__name-row">
              <h1>{author.username}</h1>
              {author.verified && (
                <span className="author-page__verified"><CheckCircle size={16} /> Verified publisher</span>
              )}
            </div>
            <p className="author-page__bio">{author.bio}</p>
            <div className="author-page__dates">
              <span>Joined {new Date(author.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <p className="author-page__desc">
          Explore the published skills from {author.username}, including featured workflows and the full installable catalog.
        </p>

        {/* Stats bar */}
        <div className="author-page__stats">
          {[
            { label: 'SKILLS', value: total },
            { label: 'FEATURED SKILLS', value: featured.length },
          ].map(s => (
            <div key={s.label} className="author-page__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <section className="author-page__section">
          <h2>Skills by Category</h2>
          <div className="author-page__categories">
            {catCounts.map(c => (
              <div key={c.name} className="author-page__cat-row">
                <span className="author-page__cat-name">{c.name}</span>
                <span className="author-page__cat-count">{c.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="author-page__section">
            <h2>Featured Skills</h2>
            <p className="author-page__section-desc">Highlighted skills from this author.</p>
            <div className="author-grid">
              {featured.map(s => <SkillCard key={s.id} skill={s} featured />)}
            </div>
          </section>
        )}

        {/* All skills */}
        <section className="author-page__section">
          <h2>{total} skill{total !== 1 ? 's' : ''}</h2>
          {total === 0 ? (
            <p className="author-page__empty">No skills published yet.</p>
          ) : (
            <>
              <div className="author-grid">
                {pageSkills.map(s => <SkillCard key={s.id} skill={s} />)}
              </div>
              {pageCount > 1 && (
                <div className="author-page__pagination">
                  <button disabled={page === 1} onClick={() => setPage(p => p-1)}>← Previous</button>
                  <span>Page {page} of {pageCount}</span>
                  <button disabled={page === pageCount} onClick={() => setPage(p => p+1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
