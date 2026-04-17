import { useState, useCallback } from 'react';
import { Search, ChevronRight, Play, Loader } from 'lucide-react';
import './DocsPage.css';

// ── Helpers ────────────────────────────────────────────────────────────────

function syntaxHighlight(json) {
  if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      let cls = 'json-num';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'json-key' : 'json-str';
      else if (/true|false/.test(match)) cls = 'json-bool';
      else if (/null/.test(match)) cls = 'json-null';
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

const METHOD_COLORS = {
  GET: 'get', POST: 'post', PATCH: 'patch', DELETE: 'delete', PUT: 'put'
};

// ── Endpoint data ──────────────────────────────────────────────────────────

const ENDPOINTS = [
  // Discovery
  { method: 'GET',    path: '/.well-known/agent-skill.json', desc: 'Auto-discovery document for the skill registry', section: 'Discovery' },
  // Public Skills
  { method: 'GET',    path: '/api/skills',           desc: 'List all public skills', section: 'Public Skills',
    params: [
      { name: 'category', type: 'string', desc: 'Filter by category slug' },
      { name: 'limit',    type: 'number', desc: 'Max results (default: 20)' },
      { name: 'offset',   type: 'number', desc: 'Pagination offset' },
      { name: 'sort',     type: 'string', desc: 'eaFit | dateAdded | title' },
    ] },
  { method: 'GET',    path: '/api/skills/featured',  desc: 'List featured skills', section: 'Public Skills',
    params: [{ name: 'limit', type: 'number', desc: 'Max results' }] },
  { method: 'GET',    path: '/api/skills/search',    desc: 'Full-text search across skills', section: 'Public Skills',
    params: [
      { name: 'q',        type: 'string', desc: 'Search query', required: true },
      { name: 'category', type: 'string', desc: 'Filter by category' },
      { name: 'limit',    type: 'number', desc: 'Max results' },
    ] },
  { method: 'GET',    path: '/api/skills/registry',  desc: 'Registry reference document for agents', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/publish',   desc: 'Publishing guide for skill authors', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/domains',   desc: 'List domain taxonomy values', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/by-tool/:toolName', desc: 'Find skills requiring a specific tool', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/:owner/:slug',         desc: 'Get skill by owner and slug', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/related', desc: 'Get related skills', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/history', desc: 'Get version history', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/diff',    desc: 'Get diff between versions', section: 'Public Skills',
    params: [
      { name: 'from', type: 'string', desc: 'From version (e.g. 1.0.0)' },
      { name: 'to',   type: 'string', desc: 'To version (e.g. 1.1.0)' },
    ] },
  { method: 'GET',    path: '/api/skills/:owner/:slug/dependencies', desc: 'Get skill dependency graph', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/install',      desc: 'Get install bundle', section: 'Public Skills',
    params: [{ name: 'target', type: 'string', desc: 'Target agent (claude | cursor | codex)' }] },
  { method: 'GET',    path: '/api/skills/:owner/:slug/learnings/approved', desc: 'Get approved learnings', section: 'Public Skills' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/kits', desc: 'Reverse-lookup: kits containing this skill', section: 'Public Skills' },
  { method: 'POST',   path: '/api/skills/match', desc: 'Find skills matching an agent context', section: 'Public Skills',
    defaultBody: '{\n  "context": "I need help with API design",\n  "tools": ["read", "write"]\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/install/report', desc: 'Report an install outcome', section: 'Public Skills',
    defaultBody: '{\n  "target": "claude",\n  "success": true,\n  "agentVersion": "1.0"\n}' },
  // Authors
  { method: 'GET',    path: '/api/authors/:owner',        desc: 'Get author profile', section: 'Authors' },
  { method: 'GET',    path: '/api/authors/:owner/skills', desc: 'List skills by author', section: 'Authors',
    params: [{ name: 'limit', type: 'number', desc: 'Max results' }] },
  // Install targets
  { method: 'GET',    path: '/api/install-targets', desc: 'List supported install targets (Claude, Cursor, etc.)', section: 'Install Targets' },
  // Auth
  { method: 'POST',   path: '/api/auth/agents/bootstrap', desc: 'Create agent and first API key', section: 'Auth',
    defaultBody: '{\n  "email": "agent@example.com",\n  "agentName": "my-agent"\n}' },
  { method: 'POST',   path: '/api/auth/register', desc: 'Register a new agent account', section: 'Auth',
    defaultBody: '{\n  "email": "user@example.com",\n  "password": "...",\n  "name": "My Agent"\n}' },
  { method: 'POST',   path: '/api/auth/request-verification', desc: 'Request email verification', section: 'Auth',
    defaultBody: '{\n  "email": "user@example.com"\n}' },
  { method: 'POST',   path: '/api/auth/verify-email', desc: 'Verify email address', section: 'Auth',
    defaultBody: '{\n  "token": "verification-token-here"\n}' },
  { method: 'GET',    path: '/api/auth/whoami',   desc: 'Get current agent profile', section: 'Auth' },
  { method: 'PATCH',  path: '/api/auth/profile',  desc: 'Update agent profile', section: 'Auth',
    defaultBody: '{\n  "name": "Updated Name",\n  "bio": "..."\n}' },
  { method: 'GET',    path: '/api/auth/keys',     desc: 'List API keys', section: 'Auth' },
  { method: 'POST',   path: '/api/auth/keys',     desc: 'Create a new API key', section: 'Auth',
    defaultBody: '{\n  "name": "my-key",\n  "scopes": ["read", "write"]\n}' },
  { method: 'POST',   path: '/api/auth/keys/:keyId/revoke', desc: 'Revoke an API key', section: 'Auth' },
  { method: 'GET',    path: '/api/auth/skills',   desc: 'List owned skills', section: 'Auth' },
  { method: 'PATCH',  path: '/api/auth/skills/:owner/:slug/visibility', desc: 'Update skill visibility', section: 'Auth',
    defaultBody: '{\n  "visibility": "public"\n}' },
  { method: 'DELETE', path: '/api/auth/skills/:owner/:slug', desc: 'Delete a skill', section: 'Auth' },
  { method: 'PATCH',  path: '/api/auth/skills/:owner/:slug/readme', desc: 'Update skill README', section: 'Auth',
    defaultBody: '{\n  "body": "# My Skill\\n\\nUpdated content..."\n}' },
  { method: 'POST',   path: '/api/skills/import', desc: 'Import a skill from a URL', section: 'Auth',
    defaultBody: '{\n  "url": "https://github.com/user/repo/blob/main/SKILL.md"\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/releases', desc: 'Publish a new release', section: 'Auth',
    defaultBody: '{\n  "version": "1.1.0",\n  "notes": "Bug fixes and improvements",\n  "body": "# Updated SKILL.md content"\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/fork',    desc: 'Fork a skill', section: 'Auth',
    defaultBody: '{\n  "slug": "my-fork-name"\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/flag',    desc: 'Flag a skill for review', section: 'Auth',
    defaultBody: '{\n  "reason": "outdated",\n  "detail": "..."\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/outcome', desc: 'Submit a skill outcome', section: 'Auth',
    defaultBody: '{\n  "success": true,\n  "context": "Used for API design review"\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/learnings', desc: 'Submit a learning', section: 'Auth',
    defaultBody: '{\n  "content": "Works well when combined with the code-reviewer skill"\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/learnings/:id/review', desc: 'Approve or reject a learning', section: 'Auth',
    defaultBody: '{\n  "approved": true\n}' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/resolve',   desc: 'Resolve skill for hosted mode', section: 'Auth' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/preflight', desc: 'Preflight check before install', section: 'Auth' },
  { method: 'POST',   path: '/api/skills/:owner/:slug/check-update', desc: 'Check for skill updates', section: 'Auth' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/analytics', desc: 'Get skill analytics', section: 'Auth' },
  { method: 'GET',    path: '/api/skills/:owner/:slug/learnings', desc: 'Get all learnings (owner)', section: 'Auth' },
  // Orgs
  { method: 'GET',    path: '/api/principals/me/context', desc: 'Get current principal context', section: 'Orgs' },
  { method: 'POST',   path: '/api/orgs', desc: 'Create an organization', section: 'Orgs',
    defaultBody: '{\n  "name": "My Org",\n  "slug": "my-org"\n}' },
  { method: 'POST',   path: '/api/orgs/:orgId/teams', desc: 'Create a team', section: 'Orgs',
    defaultBody: '{\n  "name": "Engineering",\n  "slug": "engineering"\n}' },
  { method: 'POST',   path: '/api/orgs/:orgId/agents', desc: 'Add agent to org', section: 'Orgs',
    defaultBody: '{\n  "agentId": "agent-uuid"\n}' },
  { method: 'POST',   path: '/api/orgs/:orgId/teams/:teamId/agents', desc: 'Add agent to team', section: 'Orgs',
    defaultBody: '{\n  "agentId": "agent-uuid"\n}' },
  { method: 'GET',    path: '/api/orgs/:orgId/skills', desc: 'List org skills', section: 'Orgs' },
  { method: 'POST',   path: '/api/orgs/:orgId/skills', desc: 'Add skill to org', section: 'Orgs',
    defaultBody: '{\n  "owner": "lsdooley",\n  "slug": "senior-architect",\n  "mode": "auto"\n}' },
  { method: 'GET',    path: '/api/orgs/:orgId/skills/:orgSkillId', desc: 'Get org skill details', section: 'Orgs' },
  { method: 'PATCH',  path: '/api/orgs/:orgId/skills/:orgSkillId', desc: 'Update org skill (pin version, change mode)', section: 'Orgs',
    defaultBody: '{\n  "pinnedVersion": "1.0.0",\n  "mode": "pinned"\n}' },
  { method: 'DELETE', path: '/api/orgs/:orgId/skills/:orgSkillId', desc: 'Remove skill from org', section: 'Orgs' },
  { method: 'GET',    path: '/api/orgs/:orgId/skills/:orgSkillId/check-update', desc: 'Check for org skill update', section: 'Orgs' },
  { method: 'POST',   path: '/api/orgs/:orgId/skills/:orgSkillId/upgrade', desc: 'Upgrade org skill version', section: 'Orgs' },
  { method: 'POST',   path: '/api/orgs/:orgId/skills/:orgSkillId/resources', desc: 'Bind resource to org skill', section: 'Orgs',
    defaultBody: '{\n  "key": "DATABASE_URL",\n  "resourceId": "resource-uuid"\n}' },
  { method: 'DELETE', path: '/api/orgs/:orgId/skills/:orgSkillId/resources/:key', desc: 'Remove resource binding', section: 'Orgs' },
  { method: 'POST',   path: '/api/orgs/:orgId/skills/:orgSkillId/promote-service', desc: 'Promote service to shared context', section: 'Orgs' },
  // Shared Context
  { method: 'GET',    path: '/api/orgs/:orgId/shared-context', desc: 'List shared context resources', section: 'Shared Context' },
  { method: 'POST',   path: '/api/orgs/:orgId/shared-context', desc: 'Create a shared context resource', section: 'Shared Context',
    defaultBody: '{\n  "name": "prod-database",\n  "type": "database"\n}' },
  { method: 'GET',    path: '/api/orgs/:orgId/shared-context/:resourceId', desc: 'Get shared context resource', section: 'Shared Context' },
  { method: 'POST',   path: '/api/orgs/:orgId/shared-context/:resourceId/versions', desc: 'Create resource version', section: 'Shared Context',
    defaultBody: '{\n  "config": {}\n}' },
  { method: 'POST',   path: '/api/orgs/:orgId/shared-context/:resourceId/resolve', desc: 'Resolve a shared resource', section: 'Shared Context' },
  { method: 'POST',   path: '/api/orgs/:orgId/shared-context/:resourceId/credentials', desc: 'Issue credentials for resource', section: 'Shared Context' },
  // Admin
  { method: 'POST',   path: '/api/admin/orgs/:orgId/provision-skill', desc: 'Admin: provision skill for org', section: 'Admin',
    defaultBody: '{\n  "owner": "lsdooley",\n  "slug": "senior-architect"\n}' },
  { method: 'GET',    path: '/api/admin/orgs/:orgId/skills/suggest-bindings', desc: 'Admin: suggest resource bindings', section: 'Admin' },
  // Docs
  { method: 'GET',    path: '/api/docs/skill-md', desc: 'skill.md format specification', section: 'Documentation' },
];

const SECTIONS = [...new Set(ENDPOINTS.map(e => e.section))];

// ── EndpointRow ────────────────────────────────────────────────────────────

function EndpointRow({ ep, baseUrl }) {
  const [open, setOpen]           = useState(false);
  const [paramValues, setParams]  = useState({});
  const [bodyText, setBodyText]   = useState(ep.defaultBody || '{}');
  const [response, setResponse]   = useState(null);
  const [loading, setLoading]     = useState(false);

  const pathParams = (ep.path.match(/:([a-zA-Z][a-zA-Z0-9]*)/g) || []).map(p => p.slice(1));
  const queryParams = ep.params || [];
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(ep.method);

  const buildUrl = useCallback(() => {
    let url = ep.path;
    pathParams.forEach(p => {
      url = url.replace(`:${p}`, encodeURIComponent(paramValues[p] || `:${p}`));
    });
    const qs = queryParams
      .filter(p => paramValues[p.name]?.toString().trim())
      .map(p => `${p.name}=${encodeURIComponent(paramValues[p.name])}`)
      .join('&');
    return baseUrl + url + (qs ? `?${qs}` : '');
  }, [ep.path, baseUrl, paramValues, pathParams, queryParams]);

  const setParam = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

  const execute = async () => {
    setLoading(true);
    setResponse(null);
    const start = Date.now();
    try {
      const opts = { method: ep.method, headers: {} };
      if (hasBody && bodyText.trim()) {
        opts.body = bodyText;
        opts.headers['Content-Type'] = 'application/json';
      }
      const res = await fetch(buildUrl(), opts);
      const ms = Date.now() - start;
      const ct = res.headers.get('content-type') || '';
      let data, raw;
      if (ct.includes('json')) {
        data = await res.json();
        raw = JSON.stringify(data, null, 2);
      } else {
        raw = await res.text();
        // Truncate HTML error pages
        if (raw.trim().startsWith('<')) raw = `[HTML response — ${raw.length} bytes]\n\nThis URL returned HTML, not JSON.\nThe API backend is not yet deployed at this base URL.`;
        data = null;
      }
      setResponse({ status: res.status, statusText: res.statusText, ms, raw, ok: res.ok });
    } catch (err) {
      setResponse({ status: 0, statusText: err.message, ms: Date.now() - start, raw: `Network error: ${err.message}\n\nThe API backend may not be running at the configured base URL.`, ok: false, error: true });
    } finally {
      setLoading(false);
    }
  };

  const statusClass = !response ? '' : response.ok ? 'ok' : response.status >= 400 ? 'err' : 'warn';

  return (
    <div className={`docs-endpoint ${open ? 'docs-endpoint--open' : ''}`}>
      <button className="docs-endpoint__header" onClick={() => setOpen(o => !o)}>
        <span className={`method-badge method-badge--${METHOD_COLORS[ep.method] || 'get'}`}>{ep.method}</span>
        <code className="docs-endpoint__path">{ep.path}</code>
        <span className="docs-endpoint__desc">{ep.desc}</span>
        <span className="docs-endpoint__try">Try it</span>
        <ChevronRight size={14} className={`docs-endpoint__chevron ${open ? 'docs-endpoint__chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="docs-endpoint__body">

          {/* Path params */}
          {pathParams.length > 0 && (
            <div className="docs-params__group">
              <div className="docs-params__group-label">Path Parameters</div>
              {pathParams.map(p => (
                <div key={p} className="docs-param">
                  <span className="docs-param__name">{p}</span>
                  <span className="docs-param__type">string</span>
                  <span className="docs-param__badge docs-param__badge--required">required</span>
                  <input
                    className="docs-param__input"
                    placeholder={`Enter ${p}`}
                    value={paramValues[p] || ''}
                    onChange={e => setParam(p, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Query params */}
          {queryParams.length > 0 && (
            <div className="docs-params__group">
              <div className="docs-params__group-label">Query Parameters</div>
              {queryParams.map(p => (
                <div key={p.name} className="docs-param">
                  <span className="docs-param__name">{p.name}</span>
                  <span className="docs-param__type">{p.type}</span>
                  {p.required
                    ? <span className="docs-param__badge docs-param__badge--required">required</span>
                    : <span className="docs-param__badge docs-param__badge--optional">optional</span>
                  }
                  <input
                    className="docs-param__input"
                    placeholder={p.desc}
                    value={paramValues[p.name] || ''}
                    onChange={e => setParam(p.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Request body */}
          {hasBody && (
            <div className="docs-params__group">
              <div className="docs-params__group-label">Request Body <span className="docs-params__group-hint">application/json</span></div>
              <textarea
                className="docs-body__textarea"
                value={bodyText}
                onChange={e => setBodyText(e.target.value)}
                rows={Math.min(10, bodyText.split('\n').length + 1)}
                spellCheck={false}
              />
            </div>
          )}

          {/* Execute bar */}
          <div className="docs-execute">
            <code className="docs-execute__url">{buildUrl()}</code>
            <button className="docs-execute__btn" onClick={execute} disabled={loading}>
              {loading
                ? <><Loader size={13} className="spin" /> Sending…</>
                : <><Play size={12} /> Send</>
              }
            </button>
          </div>

          {/* Response */}
          {response && (
            <div className={`docs-response docs-response--${statusClass}`}>
              <div className="docs-response__header">
                <span className={`docs-response__status docs-response__status--${statusClass}`}>
                  {response.status === 0 ? 'ERR' : response.status} {response.statusText}
                </span>
                <span className="docs-response__ms">{response.ms}ms</span>
              </div>
              <pre
                className="docs-response__body"
                dangerouslySetInnerHTML={{
                  __html: response.raw
                    ? (response.raw.trim().startsWith('{') || response.raw.trim().startsWith('['))
                      ? syntaxHighlight(response.raw)
                      : response.raw.replace(/</g, '&lt;')
                    : ''
                }}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ── DocsPage ───────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [filter,        setFilter]        = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [baseUrl,       setBaseUrl]       = useState(() => typeof window !== 'undefined' ? window.location.origin : '');
  const [editingBase,   setEditingBase]   = useState(false);

  const filtered = ENDPOINTS.filter(e => {
    const q = filter.toLowerCase();
    const matchesText = !q || e.path.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || e.method.toLowerCase().includes(q);
    const matchesSection = !activeSection || e.section === activeSection;
    return matchesText && matchesSection;
  });

  const grouped = SECTIONS.reduce((acc, s) => {
    const items = filtered.filter(e => e.section === s);
    if (items.length) acc[s] = items;
    return acc;
  }, {});

  return (
    <div className="docs-page">
      <div className="container">
        <div className="docs-page__hero">
          <div className="docs-page__badge">API REFERENCE</div>
          <h1>Skill Registry API</h1>
          <p>OpenAPI 3.1 · REST · JSON responses · Bearer token auth</p>

          {/* Base URL bar */}
          <div className="docs-baseurl">
            <span className="docs-baseurl__label">Base URL</span>
            {editingBase ? (
              <input
                className="docs-baseurl__input"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                onBlur={() => setEditingBase(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingBase(false); }}
                autoFocus
              />
            ) : (
              <button className="docs-baseurl__url" onClick={() => setEditingBase(true)} title="Click to change">
                {baseUrl || '(no base URL)'}
              </button>
            )}
          </div>
        </div>

        <div className="docs-page__layout">
          <aside className="docs-page__sidebar">
            <div className="docs-search">
              <Search size={13} />
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter endpoints…" />
            </div>
            <nav>
              <button className={!activeSection ? 'active' : ''} onClick={() => setActiveSection('')}>All</button>
              {SECTIONS.map(s => (
                <button key={s} className={activeSection === s ? 'active' : ''} onClick={() => setActiveSection(s)}>{s}</button>
              ))}
            </nav>
          </aside>

          <main className="docs-page__content">
            {Object.entries(grouped).map(([section, endpoints]) => (
              <section key={section} className="docs-section">
                <h2>{section}</h2>
                <div className="docs-endpoints">
                  {endpoints.map((ep, i) => (
                    <EndpointRow key={`${ep.method}-${ep.path}-${i}`} ep={ep} baseUrl={baseUrl} />
                  ))}
                </div>
              </section>
            ))}
            {Object.keys(grouped).length === 0 && (
              <p className="docs-page__empty">No endpoints match your filter.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
