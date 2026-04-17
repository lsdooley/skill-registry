import { useState } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';
import { SKILLS } from '../../data/skills';
import './ConsolePage.css';

const MOCK_KEY = 'sk-test-1234567890abcdef';

const MOCK_KEYS = [
  { id: 'k1', name: 'Production', created: '2025-01-10', lastUsed: '2026-04-07', prefix: 'sk-prod-' },
  { id: 'k2', name: 'Development', created: '2025-03-01', lastUsed: '2026-04-06', prefix: 'sk-dev-' },
];

function LoginForm({ onLogin }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!key.startsWith('sk-')) { setError('Invalid API key format. Keys begin with sk-.'); return; }
    onLogin(key);
  };

  return (
    <div className="console-login">
      <div className="console-login__card">
        <div className="console-login__logo">
          <Key size={24} />
        </div>
        <h1>Skill Registry Console</h1>
        <p>Sign in with your agent API key to manage skills, organizations, and API keys.</p>
        <form onSubmit={handleSubmit} className="console-login__form">
          <label>
            <span>Agent API Key</span>
            <div className="console-login__input-wrap">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setError(''); }}
                placeholder="sk-..."
                autoComplete="off"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Toggle visibility">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>
          {error && <p className="console-login__error">{error}</p>}
          <button type="submit" className="console-login__submit">Sign In</button>
        </form>
        <p className="console-login__register">
          Don&apos;t have a key? <button onClick={() => onLogin(MOCK_KEY)} className="console-login__demo">Try demo mode →</button>
        </p>
        <p className="console-login__hint">Tip: Use <code>{MOCK_KEY}</code> or any key starting with <code>sk-</code></p>
      </div>
    </div>
  );
}

function MySkillsTab({ skills }) {
  const [visibility, setVisibility] = useState(Object.fromEntries(skills.map(s => [s.id, 'public'])));
  return (
    <div className="console-tab-content">
      <div className="console-tab-header">
        <h2>My Skills</h2>
        <button className="btn-primary"><Plus size={14} /> Publish skill</button>
      </div>
      {skills.length === 0 ? <p className="console-empty">No skills published yet.</p> : (
        <table className="console-table">
          <thead><tr><th>Skill</th><th>Version</th><th>Visibility</th><th>Actions</th></tr></thead>
          <tbody>
            {skills.map(s => (
              <tr key={s.id}>
                <td><span className="console-skill-title">{s.title}</span><br /><code className="console-slug">{s.owner}/{s.slug}</code></td>
                <td><code>v{s.version}</code></td>
                <td>
                  <select value={visibility[s.id]} onChange={e => setVisibility({...visibility, [s.id]: e.target.value})} className="console-select">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="org">Org only</option>
                  </select>
                </td>
                <td>
                  <div className="console-actions">
                    <button className="console-action">Edit</button>
                    <button className="console-action console-action--danger"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ApiKeysTab() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const revoke = id => setKeys(keys.filter(k => k.id !== id));
  return (
    <div className="console-tab-content">
      <div className="console-tab-header">
        <h2>API Keys</h2>
        <button className="btn-primary"><Plus size={14} /> Create key</button>
      </div>
      <table className="console-table">
        <thead><tr><th>Name</th><th>Key</th><th>Created</th><th>Last used</th><th>Actions</th></tr></thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.id}>
              <td className="console-key-name">{k.name}</td>
              <td><code className="console-key-prefix">{k.prefix}••••••••</code></td>
              <td>{new Date(k.created).toLocaleDateString()}</td>
              <td>{new Date(k.lastUsed).toLocaleDateString()}</td>
              <td>
                <button className="console-action console-action--danger" onClick={() => revoke(k.id)}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrgsTab() {
  return (
    <div className="console-tab-content">
      <div className="console-tab-header">
        <h2>Organizations</h2>
        <button className="btn-primary"><Plus size={14} /> Create org</button>
      </div>
      <div className="console-empty-state">
        <p>No organizations yet.</p>
        <p className="console-empty-sub">Create an organization to manage shared skills, context, and agent permissions at team scale.</p>
        <a href="/browse" className="btn-primary" style={{ display: 'inline-flex', marginTop: 12 }}>Browse Skills →</a>
      </div>
    </div>
  );
}

function ProfileTab({ apiKey }) {
  return (
    <div className="console-tab-content">
      <h2>Profile</h2>
      <div className="console-profile">
        <div className="console-profile__field">
          <label>Handle</label>
          <input defaultValue="lsdooley" readOnly />
        </div>
        <div className="console-profile__field">
          <label>Email</label>
          <input defaultValue="lsdooley@icloud.com" readOnly />
        </div>
        <div className="console-profile__field">
          <label>API Key (active)</label>
          <input value={apiKey.slice(0, 12) + '••••••••'} readOnly onChange={() => {}} />
        </div>
        <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Save changes</button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'skills', label: 'My Skills' },
  { id: 'keys', label: 'API Keys' },
  { id: 'orgs', label: 'Organizations' },
  { id: 'profile', label: 'Profile' },
];

export default function ConsolePage() {
  const [apiKey, setApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');
  const mySkills = SKILLS.filter(s => s.owner === 'lsdooley');

  if (!apiKey) return <LoginForm onLogin={setApiKey} />;

  return (
    <div className="console-page">
      <div className="container">
        <div className="console-page__header">
          <h1>Console</h1>
          <div className="console-page__session">
            <span>Signed in as <strong>lsdooley</strong></span>
            <button className="console-signout" onClick={() => setApiKey(null)}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="console-layout">
          <aside className="console-sidebar">
            {TABS.map(t => (
              <button key={t.id} className={`console-nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </aside>
          <main className="console-main">
            {activeTab === 'skills' && <MySkillsTab skills={mySkills} />}
            {activeTab === 'keys' && <ApiKeysTab />}
            {activeTab === 'orgs' && <OrgsTab />}
            {activeTab === 'profile' && <ProfileTab apiKey={apiKey} />}
          </main>
        </div>
      </div>
    </div>
  );
}
