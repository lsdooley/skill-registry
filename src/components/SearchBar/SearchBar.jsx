import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Search skills...' }) {
  const [local, setLocal] = useState(value || '');

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local]);

  return (
    <div className="search-bar">
      <Search size={15} className="search-bar__icon" />
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label="Search skills"
        className="search-bar__input"
      />
      {local && (
        <button className="search-bar__clear" onClick={() => { setLocal(''); onChange(''); }} aria-label="Clear search">
          <X size={13} />
        </button>
      )}
    </div>
  );
}
