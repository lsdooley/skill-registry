import './Landing.css';

function avg(arr, key) {
  const vals = arr.map(s => s[key]).filter(v => v > 0);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Category accent colors (cycling)
const CAT_COLORS = [
  '#0d9488', '#2563eb', '#7c3aed', '#ea580c',
  '#16a34a', '#d97706', '#dc2626', '#0891b2',
  '#9333ea', '#059669', '#b45309', '#6366f1', '#0d9488',
];

export default function Landing({ categories, onSelect }) {
  const totalSkills    = categories.reduce((n, c) => n + c.skills.length, 0);
  const totalCats      = categories.length;
  const highEaFit      = categories.flatMap(c => c.skills).filter(s => s.eaFit >= 90).length;
  const allSkills      = categories.flatMap(c => c.skills);
  const globalAvgEa    = avg(allSkills, 'eaFit');
  const globalAvgBank  = avg(allSkills, 'bankingFit');

  return (
    <div className="landing">
      {/* Hero */}
      <div className="landing__hero">
        <div className="landing__hero-inner">
          <h1 className="landing__headline">
            Your Copilot Expert Prompts
          </h1>
          <p className="landing__subhead">
            Select any skill from the sidebar — or browse below — to copy a ready-to-use Copilot Lite prompt for your work session.
          </p>

          {/* Top stats */}
          <div className="landing__stats">
            <div className="landing__stat">
              <span className="landing__stat-value">{totalSkills}</span>
              <span className="landing__stat-label">Expert Prompts</span>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <span className="landing__stat-value">{totalCats}</span>
              <span className="landing__stat-label">Categories</span>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <span className="landing__stat-value">{highEaFit}</span>
              <span className="landing__stat-label">EA Fit ≥ 90</span>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <span className="landing__stat-value">{globalAvgEa}</span>
              <span className="landing__stat-label">Avg EA Fit</span>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <span className="landing__stat-value">{globalAvgBank}</span>
              <span className="landing__stat-label">Avg Banking Fit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div className="landing__grid-section">
        <h2 className="landing__grid-title">Browse by Category</h2>
        <div className="landing__grid">
          {categories.map((cat, i) => {
            const color     = CAT_COLORS[i % CAT_COLORS.length];
            const avgEa     = avg(cat.skills, 'eaFit');
            const avgBank   = avg(cat.skills, 'bankingFit');
            const featured  = cat.skills.filter(s => s.featured);
            const preview   = cat.skills.slice(0, 3);

            return (
              <div key={cat.slug} className="landing__card" style={{ '--cat-color': color }}>
                <div className="landing__card-accent" />
                <div className="landing__card-body">
                  <div className="landing__card-header">
                    <h3 className="landing__card-name">{cat.name}</h3>
                    <span className="landing__card-count">{cat.skills.length}</span>
                  </div>

                  {(avgEa > 0 || avgBank > 0) && (
                    <div className="landing__card-scores">
                      {avgEa > 0 && (
                        <div className="landing__score">
                          <span className="landing__score-label">EA</span>
                          <div className="landing__score-bar">
                            <div className="landing__score-fill" style={{ width: `${avgEa}%`, background: color }} />
                          </div>
                          <span className="landing__score-num">{avgEa}</span>
                        </div>
                      )}
                      {avgBank > 0 && (
                        <div className="landing__score">
                          <span className="landing__score-label">Bank</span>
                          <div className="landing__score-bar">
                            <div className="landing__score-fill" style={{ width: `${avgBank}%`, background: color, opacity: 0.7 }} />
                          </div>
                          <span className="landing__score-num">{avgBank}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <ul className="landing__card-skills">
                    {preview.map(s => (
                      <li key={s.slug}>
                        <button
                          className="landing__skill-link"
                          onClick={() => onSelect({ ...s, categorySlug: cat.slug })}
                        >
                          {s.featured && <span className="landing__skill-star">★</span>}
                          {s.title}
                        </button>
                      </li>
                    ))}
                    {cat.skills.length > 3 && (
                      <li className="landing__card-more">+{cat.skills.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
