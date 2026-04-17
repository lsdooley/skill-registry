import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ChevronRight, Copy, Check, Sun, Moon } from 'lucide-react';
import { SKILLS, CATEGORIES } from '../../data/skills';
import SkillDetailBody from '../../components/SkillDetailBody/SkillDetailBody';
import './HomePage.css';

// ── Category config ────────────────────────────────────────────────────────

const CAT_CFG = {
  'Architecture':                      { color: '#4f46e5', icon: '🏗️' },
  'Security & Compliance':             { color: '#ef4444', icon: '🔐' },
  'AWS & Cloud':                        { color: '#0ea5e9', icon: '☁️' },
  'DevOps & GitOps':                   { color: '#22c55e', icon: '⚙️' },
  'AI & Knowledge Systems':            { color: '#8b5cf6', icon: '🤖' },
  'Finance & Risk':                    { color: '#f59e0b', icon: '💰' },
  'C-Level & Governance':              { color: '#14b8a6', icon: '🎯' },
  'Data & Integration':                { color: '#3b82f6', icon: '🔄' },
  'Contract & SOW Review':             { color: '#f97316', icon: '📋' },
  'GRC & Third-Party Risk':            { color: '#f43f5e', icon: '🛡️' },
  'Cloud Reference Architecture':      { color: '#06b6d4', icon: '🌐' },
  'Legacy Modernization':              { color: '#64748b', icon: '🔧' },
  'Security Architecture (Expanded)':  { color: '#e11d48', icon: '🔒' },
};

const catColor = cat => CAT_CFG[cat]?.color ?? '#4f46e5';
const catIcon  = cat => CAT_CFG[cat]?.icon  ?? '📦';

// ── Sidebar components ─────────────────────────────────────────────────────

function SkillItem({ skill, active, onSelect }) {
  const color = catColor(skill.category);
  return (
    <button
      className={`sk-item ${active ? 'sk-item--active' : ''}`}
      style={{ '--c': color }}
      onClick={() => onSelect(skill)}
    >
      <span className="sk-icon">{catIcon(skill.category)}</span>
      <span className="sk-body">
        <span className="sk-name">{skill.title}</span>
        <span className="sk-vibe">{skill.summary}</span>
      </span>
    </button>
  );
}

function CategoryGroup({ cat, skills, selectedId, onSelect, searchActive }) {
  const [open, setOpen] = useState(cat.slug === '01-architecture');
  const isOpen = searchActive ? true : open;
  const color = catColor(cat.name);

  return (
    <div className="cat-grp">
      <button
        className={`cat-hd ${isOpen ? 'cat-hd--open' : ''}`}
        style={{ '--c': color }}
        onClick={() => { if (!searchActive) setOpen(o => !o); }}
      >
        <span className="cat-hd-icon">{catIcon(cat.name)}</span>
        <span className="cat-hd-name">{cat.name}</span>
        <span className="cat-hd-count">{skills.length}</span>
        <ChevronRight size={10} className={`cat-hd-chevron ${isOpen ? 'cat-hd-chevron--open' : ''}`} />
      </button>
      {isOpen && (
        <div className="cat-skills">
          {skills.map(s => (
            <SkillItem key={s.id} skill={s} active={selectedId === s.id} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Welcome screen ─────────────────────────────────────────────────────────

function WelcomeView() {
  const withContent = SKILLS.filter(s => s.hasFullContent).length;
  return (
    <div className="welcome">
      <div className="welcome-glyph">🤖</div>
      <h1>Agent Skill Registry</h1>
      <p>A curated library of reusable AI agent skills. Browse by category or search — then install in one command.</p>
      <div className="welcome-stats">
        <div className="w-stat">
          <span className="w-num">{SKILLS.length}</span>
          <span className="w-label">Total Skills</span>
        </div>
        <div className="w-div" />
        <div className="w-stat">
          <span className="w-num">{withContent}</span>
          <span className="w-label">Full Docs</span>
        </div>
        <div className="w-div" />
        <div className="w-stat">
          <span className="w-num">{CATEGORIES.length}</span>
          <span className="w-label">Categories</span>
        </div>
        <div className="w-div" />
        <div className="w-stat">
          <span className="w-num">Any</span>
          <span className="w-label">AI Agent</span>
        </div>
      </div>
      <div className="welcome-tip">
        <span className="tip-icon">💡</span>
        <div>Select a skill from the sidebar to read its docs and copy the install prompt.</div>
      </div>
    </div>
  );
}

// ── Install code ───────────────────────────────────────────────────────────

function InstallCode({ owner, slug }) {
  const [copied, setCopied] = useState(false);
  const cmd = `claude skills add ${owner}/${slug}`;
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="install-row">
      <code className="install-cmd">{cmd}</code>
      <button className={`install-copy ${copied ? 'install-copy--done' : ''}`} onClick={copy}>
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </button>
    </div>
  );
}

// ── Detail view ────────────────────────────────────────────────────────────

function DetailView({ skill }) {
  const [copied, setCopied] = useState(false);
  const color = catColor(skill.category);
  const icon  = catIcon(skill.category);

  const handleCopy = () => {
    const prompt = skill.body
      ? `Use the following skill to complete your task:\n\n${skill.body}`
      : `Use the ${skill.title} skill to complete your task.`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskColor = { low: '#22c55e', safe: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#ef4444' };
  const fullPageLink = `/browse/skills/${skill.owner}/${skill.slug}`;

  return (
    <div className="detail">
      {/* ── Hero ── */}
      <div className="detail-hero" style={{ background: `linear-gradient(135deg, ${color}e0 0%, ${color}70 100%)` }}>
        <div className="detail-hero-inner">
          <span className="detail-emoji">{icon}</span>
          <div className="detail-hero-text">
            <div className="detail-cat">{skill.category}</div>
            <div className="detail-name">{skill.title}</div>
            <div className="detail-vibe">{skill.summary.length > 110 ? skill.summary.slice(0, 110) + '…' : skill.summary}</div>
          </div>
          <button className={`detail-copy-btn ${copied ? 'detail-copy-btn--done' : ''}`} onClick={handleCopy}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy prompt</>}
          </button>
        </div>
      </div>

      {/* ── Meta row ── */}
      <div className="detail-meta-row">
        <div className="meta-card">
          <div className="meta-lbl">Version</div>
          <div className="meta-val">{skill.version}</div>
        </div>
        <div className="meta-card">
          <div className="meta-lbl">EA Fit</div>
          <div className="meta-val" style={{ color }}>{skill.eaFit}<span className="meta-sub">/100</span></div>
        </div>
        <div className="meta-card">
          <div className="meta-lbl">Banking Fit</div>
          <div className="meta-val">{skill.bankingFit}<span className="meta-sub">/100</span></div>
        </div>
        <div className="meta-card">
          <div className="meta-lbl">Risk</div>
          <div className="meta-val" style={{ color: riskColor[skill.risk] || '#64748b', textTransform: 'capitalize' }}>{skill.risk}</div>
        </div>
        <div className="meta-card meta-card--wide">
          <div className="meta-lbl">Install command</div>
          <InstallCode owner={skill.owner} slug={skill.slug} />
        </div>
      </div>

      {/* ── Full 5-tab body ── */}
      <SkillDetailBody skill={skill} fullPageLink={fullPageLink} />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage({ theme, onToggleTheme }) {
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SKILLS;
    return SKILLS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [search]);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      if (!map[s.categorySlug]) map[s.categorySlug] = [];
      map[s.categorySlug].push(s);
    });
    return map;
  }, [filtered]);

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <div className="app-brand">
            <div className="app-brand-logo">🤖</div>
            <div className="app-brand-text">
              <div className="app-brand-name">Skill Registry</div>
              <div className="app-brand-meta">
                {SKILLS.length} skills · {CATEGORIES.length} categories
              </div>
            </div>
            <button className="app-theme-btn" onClick={onToggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <div className="app-search-wrap">
            <Search size={12} className="app-search-ico" />
            <input
              className="app-search-input"
              placeholder="Search skills…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="app-search-clear" onClick={() => setSearch('')}>
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        <div className="app-nav-scroll">
          {search && filtered.length === 0 && (
            <div className="app-no-results">No results for "{search}"</div>
          )}
          {CATEGORIES.map(cat => {
            const skills = byCategory[cat.slug];
            if (!skills?.length) return null;
            return (
              <CategoryGroup
                key={cat.slug}
                cat={cat}
                skills={skills}
                selectedId={selected?.id}
                onSelect={setSelected}
                searchActive={!!search.trim()}
              />
            );
          })}
        </div>

        <div className="app-sidebar-footer">
          <span className="sf-ver">v1.0</span>
          <span className="sf-dot">·</span>
          <Link to="/docs"    className="sf-link">API Docs</Link>
          <span className="sf-dot">·</span>
          <Link to="/browse"  className="sf-link">Browse</Link>
          <span className="sf-dot">·</span>
          <Link to="/console" className="sf-link">Console</Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="app-main">
        {selected ? <DetailView skill={selected} /> : <WelcomeView />}
      </main>
    </div>
  );
}
