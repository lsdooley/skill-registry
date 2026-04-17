import './SortSelect.css';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Date: Newest first' },
  { value: 'oldest',      label: 'Date: Oldest first' },
  { value: 'ea-fit',      label: 'EA Fit: High first' },
  { value: 'banking-fit', label: 'Banking Fit: High first' },
  { value: 'category',    label: 'Category: A–Z' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <select className="sort-select" value={value} onChange={e => onChange(e.target.value)} aria-label="Sort skills">
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
