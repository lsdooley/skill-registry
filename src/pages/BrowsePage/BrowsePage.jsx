import { useState, useMemo } from 'react';
import { SKILLS } from '../../data/skills';
import { SkillRow } from '../../components/SkillCard/SkillCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import SortSelect from '../../components/SortSelect/SortSelect';
import FilterBar from '../../components/FilterBar/FilterBar';
import './BrowsePage.css';

const PAGE_SIZE = 24;

function applyFiltersAndSort(skills, query, filters, sort) {
  let out = [...skills];
  if (query) {
    const q = query.toLowerCase();
    out = out.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.owner.toLowerCase().includes(q)
    );
  }
  if (filters.category) out = out.filter(s => s.categorySlug === filters.category);
  if (filters.featured === 'featured') out = out.filter(s => s.featured);
  switch (sort) {
    case 'oldest':      out.sort((a,b) => new Date(a.dateAdded) - new Date(b.dateAdded)); break;
    case 'ea-fit':      out.sort((a,b) => b.eaFit - a.eaFit); break;
    case 'banking-fit': out.sort((a,b) => b.bankingFit - a.bankingFit); break;
    case 'category':    out.sort((a,b) => a.category.localeCompare(b.category)); break;
    default:            out.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  }
  return out;
}

export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState({ category: '', featured: '' });
  const [page, setPage] = useState(1);

  const featured = useMemo(() => SKILLS.filter(s => s.featured), []);
  const filtered = useMemo(() => applyFiltersAndSort(SKILLS, query, filters, sort), [query, filters, sort]);
  const hasFilters = query || filters.category || filters.featured;

  const available = useMemo(() => filtered.filter(s => s.hasFullContent), [filtered]);
  const comingSoon = useMemo(() => filtered.filter(s => !s.hasFullContent), [filtered]);

  const total = available.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const pageSkills = available.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => { setQuery(''); setFilters({ category: '', featured: '' }); setPage(1); };

  return (
    <div className="browse-page">
      <div className="container">
        <div className="browse-page__hero">
          <h1>Browse Skills</h1>
          <p>Discover agent capability skills. Share what worked so other agents can reuse it.</p>
          <SearchBar value={query} onChange={v => { setQuery(v); setPage(1); }} placeholder="Search skills by name, category, or author..." />
        </div>

        {/* Featured */}
        {!hasFilters && (
          <section className="browse-page__featured">
            <h2>Featured Skills</h2>
            <div className="skill-list skill-list--featured">
              {featured.map(s => <SkillRow key={s.id} skill={s} featured />)}
            </div>
          </section>
        )}

        {/* All skills */}
        <section className="browse-page__all">
          <div className="browse-page__controls">
            <div className="browse-page__count">
              {hasFilters
                ? `${total} result${total !== 1 ? 's' : ''}${comingSoon.length > 0 ? ` + ${comingSoon.length} coming soon` : ''}`
                : `Showing ${Math.min((page-1)*PAGE_SIZE+1, total)}–${Math.min(page*PAGE_SIZE, total)} of ${total}`}
            </div>
            <div className="browse-page__right-controls">
              <FilterBar filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
              <SortSelect value={sort} onChange={v => { setSort(v); setPage(1); }} />
            </div>
          </div>

          {pageSkills.length > 0 ? (
            <div className="skill-list">
              {pageSkills.map(s => <SkillRow key={s.id} skill={s} />)}
            </div>
          ) : available.length === 0 && comingSoon.length === 0 ? (
            <div className="browse-page__empty">
              <p>No skills match your filters.</p>
              <button onClick={resetFilters}>Reset filters</button>
            </div>
          ) : null}

          {pageCount > 1 && (
            <div className="browse-page__pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}

          {comingSoon.length > 0 && (
            <section className="browse-page__coming-soon">
              <h3 className="browse-page__coming-soon-heading">Coming Soon</h3>
              <div className="skill-list skill-list--coming-soon">
                {comingSoon.map(s => <SkillRow key={s.id} skill={s} comingSoon />)}
              </div>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
