import { CATEGORIES } from '../../data/skills';
import './FilterBar.css';

export default function FilterBar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  return (
    <div className="filter-bar">
      <select value={filters.category} onChange={e => set('category', e.target.value)} aria-label="Filter by category">
        <option value="">All categories</option>
        {CATEGORIES.map(c => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <select value={filters.featured} onChange={e => set('featured', e.target.value)} aria-label="Filter by featured">
        <option value="">Any skill</option>
        <option value="featured">Featured only</option>
      </select>
    </div>
  );
}
