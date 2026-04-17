import './TabBar.css';

export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`tab-bar__tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null && <span className="tab-bar__count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
