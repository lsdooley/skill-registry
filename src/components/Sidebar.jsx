import { useState } from 'react';
import './Sidebar.css';

const RISK_COLOR = { low: 'success', medium: 'gold', high: 'orange', critical: 'notification' };

export default function Sidebar({ categories, selectedSkill, onSelect, query }) {
  const [openCats, setOpenCats] = useState(() => {
    // Open the first category by default
    if (!categories.length) return {};
    return { [categories[0].slug]: true };
  });

  function toggleCat(slug) {
    setOpenCats(prev => ({ ...prev, [slug]: !prev[slug] }));
  }

  const q = query.toLowerCase().trim();

  const filtered = categories.map(cat => {
    const skills = q
      ? cat.skills.filter(
          s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
      : cat.skills;
    return { ...cat, skills };
  }).filter(cat => (q ? cat.skills.length > 0 : true));

  return (
    <nav className="sidebar">
      <div className="sidebar__label">Categories</div>
      {filtered.map(cat => {
        const isOpen = q ? true : !!openCats[cat.slug];
        return (
          <div key={cat.slug} className="sidebar__cat">
            <button
              className={`sidebar__cat-header ${isOpen ? 'sidebar__cat-header--open' : ''}`}
              onClick={() => toggleCat(cat.slug)}
            >
              <svg
                className="sidebar__chevron"
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="sidebar__cat-name">{cat.name}</span>
              <span className="sidebar__cat-count">{cat.skills.length}</span>
            </button>

            {isOpen && (
              <ul className="sidebar__skills">
                {cat.skills.map(skill => {
                  const active = selectedSkill?.slug === skill.slug && selectedSkill?.categorySlug === cat.slug;
                  const riskColor = RISK_COLOR[skill.risk] || 'success';
                  return (
                    <li key={skill.slug}>
                      <button
                        className={`sidebar__skill ${active ? 'sidebar__skill--active' : ''}`}
                        onClick={() => onSelect({ ...skill, categorySlug: cat.slug })}
                      >
                        <span className={`sidebar__risk-dot sidebar__risk-dot--${riskColor}`} />
                        <span className="sidebar__skill-name">{skill.title}</span>
                        {skill.featured && <span className="sidebar__star">★</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
