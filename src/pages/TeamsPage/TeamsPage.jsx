import { Link } from 'react-router-dom';
import { RefreshCw, Shield, Database, Share2, ScanLine, Cloud, Pin } from 'lucide-react';
import './TeamsPage.css';

const FEATURES = [
  {
    icon: RefreshCw,
    title: 'Upgrade once, roll out everywhere',
    description: 'When a skill is updated, every agent using it can get the new version instantly. No manual updates across dozens of agents — one upgrade propagates automatically to your whole team.',
    visual: (
      <div className="teams-visual teams-visual--upgrade">
        <div className="tv-version-bump">
          <span className="tv-old">v1.2.0</span>
          <span className="tv-arrow">→</span>
          <span className="tv-new">v1.3.0</span>
        </div>
        <div className="tv-agents">
          {['agent-1', 'agent-2', 'agent-3', 'agent-4'].map(a => (
            <div key={a} className="tv-agent"><span>{a}</span><span className="tv-agent__ver">v1.3.0</span></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    title: 'The right access for every agent',
    description: 'Granular role-based permissions let you control exactly what each agent can do within your organization. No over-permissioning, no capability gaps.',
    visual: (
      <div className="teams-visual teams-visual--perms">
        {[
          { role: 'org:admin', desc: 'Full org management' },
          { role: 'org:manage_context', desc: 'Shared context CRUD' },
          { role: 'org:manage_members', desc: 'Agent enrollment' },
          { role: 'org:use_context', desc: 'Read shared resources' },
        ].map(p => (
          <div key={p.role} className="tv-perm">
            <code>{p.role}</code>
            <span>{p.desc}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Database,
    title: 'One source of truth for every resource',
    description: "Shared context lets your whole team reference the same API keys, database connections, and credentials — without embedding secrets in individual skills.",
    visual: (
      <div className="teams-visual teams-visual--context">
        {[
          { name: 'STRIPE_SECRET_KEY', kind: 'secret', src: '1Password' },
          { name: 'POSTGRES_URL', kind: 'database', src: 'AWS RDS' },
          { name: 'OPENAI_API_KEY', kind: 'secret', src: '1Password' },
        ].map(r => (
          <div key={r.name} className="tv-resource">
            <code>{r.name}</code>
            <span>{r.kind} · {r.src}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Share2,
    title: 'Share what works, instantly',
    description: "Publish a skill to your org and it's immediately available to every agent on your team. Pin it to ensure everyone runs the same verified version.",
    visual: (
      <div className="teams-visual teams-visual--sharing">
        <div className="tv-skill-card">
          <span className="tv-skill-name">iso27001-gap-analysis</span>
          <span className="tv-pinned">pinned to org</span>
        </div>
        <div className="tv-agent-avatars">
          {['A1','A2','A3','A4','A5'].map(a => (
            <div key={a} className="tv-mini-avatar">{a}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: ScanLine,
    title: 'Every workflow scanned before it runs',
    description: 'Every skill release is automatically scanned for prompt injection, hardcoded secrets, and destructive commands, then scored by LLM quality review.',
    visual: (
      <div className="teams-visual teams-visual--scan">
        <div className="tv-scan-row"><span className="tv-pass">✓</span><span>No prompt injection detected</span></div>
        <div className="tv-scan-row"><span className="tv-pass">✓</span><span>No hardcoded secrets</span></div>
        <div className="tv-scan-row"><span className="tv-pass">✓</span><span>No destructive commands</span></div>
        <div className="tv-scan-row"><span className="tv-pass">✓</span><span>Security: 9/10</span></div>
        <div className="tv-scan-row"><span className="tv-pass">✓</span><span>Completeness: 8/10</span></div>
      </div>
    ),
  },
  {
    icon: Cloud,
    title: 'No install, no mismatch',
    description: "In hosted mode, skills are served at resolve time — no local installation required. Every agent always runs the exact version you've approved.",
    visual: (
      <div className="teams-visual teams-visual--hosted">
        <pre className="tv-code">{`{
  "mode": "hosted",
  "version": "1.3.0",
  "promptContent": "..."
}`}</pre>
      </div>
    ),
  },
  {
    icon: Pin,
    title: 'Control exactly what runs',
    description: "Pin skills to a specific semver. Upgrades are available but never forced — your agents run stable, audited versions until you explicitly approve an upgrade.",
    visual: (
      <div className="teams-visual teams-visual--pinning">
        {[
          { skill: 'structured-research', pinned: '1.2.0', available: '1.3.0' },
          { skill: 'iso27001-gap-analysis', pinned: '2.0.1', available: null },
          { skill: 'bpmn-diagram-generator', pinned: '1.0.0', available: '1.1.0' },
        ].map(p => (
          <div key={p.skill} className="tv-pin-row">
            <code>{p.skill}</code>
            <span className="tv-pinned-ver">v{p.pinned}</span>
            {p.available && <span className="tv-upgrade-available">v{p.available} available</span>}
          </div>
        ))}
      </div>
    ),
  },
];

export default function TeamsPage() {
  return (
    <div className="teams-page">
      <div className="container">
        <div className="teams-page__hero">
          <div className="teams-page__badge">FOR TEAMS</div>
          <h1>Skills at org scale</h1>
          <p>Deploy, manage, and secure AI agent skills across your entire organization.</p>
          <Link to="/console" className="teams-page__cta">Get started free →</Link>
        </div>

        <div className="teams-features">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`teams-feature ${i % 2 === 1 ? 'teams-feature--reverse' : ''}`}>
                <div className="teams-feature__text">
                  <div className="teams-feature__icon"><Icon size={20} /></div>
                  <h2>{f.title}</h2>
                  <p>{f.description}</p>
                </div>
                <div className="teams-feature__visual">{f.visual}</div>
              </div>
            );
          })}
        </div>

        <div className="teams-page__final-cta">
          <h2>Stop managing agents one at a time</h2>
          <p>Skill Registry for Teams gives you org-wide skill management, granular permissions, shared context, and automated security scanning in one platform.</p>
          <Link to="/console" className="teams-page__cta">Get started free →</Link>
        </div>
      </div>
    </div>
  );
}
