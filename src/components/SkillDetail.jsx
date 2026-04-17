import { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import CopyButton from './CopyButton';
import './SkillDetail.css';

const RISK_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const RISK_CLASS = { low: 'chip--success', medium: 'chip--gold', high: 'chip--orange', critical: 'chip--danger' };

function fitColor(score) {
  if (score >= 90) return 'chip--success';
  if (score >= 75) return 'chip--primary';
  if (score >= 60) return 'chip--gold';
  return 'chip--muted';
}

function fmt(n) { return n.toLocaleString(); }

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Strip the "How to use in Copilot" blockquote preamble from the rendered markdown.
// The preamble is the block of > lines + the following --- divider we injected at build time.
function stripPreamble(text) {
  return text
    .replace(/^(>.*\n)+/m, '')   // remove consecutive blockquote lines
    .replace(/^---\s*\n/m, '')   // remove the first hr after the blockquote
    .replace(/^\n+/, '')         // trim leading blank lines
    .trim();
}

export default function SkillDetail({ skill }) {
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!skill) return;
    setPromptText('');
    setError(null);
    setLoading(true);
    fetch(skill.promptPath)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.text(); })
      .then(t  => { setPromptText(t); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [skill?.promptPath]);

  const stats = useMemo(() => {
    if (!promptText) return null;
    return {
      chars: promptText.length,
      words: promptText.trim().split(/\s+/).length,
      lines: promptText.split('\n').length,
    };
  }, [promptText]);

  const markdownBody = useMemo(() => {
    if (!promptText) return '';
    return stripPreamble(promptText);
  }, [promptText]);

  if (!skill) return null;

  const useWhen     = skill.useWhen     || [];
  const dontUseWhen = skill.dontUseWhen || [];
  const hasUsage    = useWhen.length > 0 || dontUseWhen.length > 0;

  return (
    <div className="skill-detail">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="skill-detail__header">

        {/* Left column */}
        <div className="skill-detail__header-main">
          <div className="skill-detail__title-row">
            <h1 className="skill-detail__title">{skill.title}</h1>
            {skill.featured && <span className="skill-detail__featured">★ Featured</span>}
          </div>
          <p className="skill-detail__description">{skill.description}</p>
          <div className="skill-detail__chips">
            <span className={`chip ${RISK_CLASS[skill.risk] || 'chip--success'}`}>
              Risk: {RISK_LABEL[skill.risk] || skill.risk}
            </span>
            {skill.eaFit > 0 && (
              <span className={`chip ${fitColor(skill.eaFit)}`}>EA Fit: {skill.eaFit}</span>
            )}
            {skill.bankingFit > 0 && (
              <span className={`chip ${fitColor(skill.bankingFit)}`}>Banking: {skill.bankingFit}</span>
            )}
            <span className="chip chip--muted">v{skill.version}</span>
          </div>

          {/* How to use in Copilot */}
          <div className="skill-detail__copilot-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              <strong>How to use in Copilot:</strong> Copy the prompt below and paste it into a new Copilot chat to activate expert mode for your session.
            </span>
          </div>

          {/* Use / Don't use */}
          {hasUsage && (
            <div className="skill-detail__usage">
              {useWhen.length > 0 && (
                <div className="skill-detail__usage-col skill-detail__usage-col--use">
                  <div className="skill-detail__usage-head">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Use when
                  </div>
                  <ul>
                    {useWhen.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {dontUseWhen.length > 0 && (
                <div className="skill-detail__usage-col skill-detail__usage-col--dont">
                  <div className="skill-detail__usage-head">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Don't use when
                  </div>
                  <ul>
                    {dontUseWhen.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — metadata panel */}
        <aside className="skill-detail__meta-panel">
          <dl className="skill-detail__meta-list">
            {skill.dateAdded && (
              <div className="skill-detail__meta-row">
                <dt>Added</dt>
                <dd>{formatDate(skill.dateAdded)}</dd>
              </div>
            )}
            {skill.source && (
              <div className="skill-detail__meta-row">
                <dt>Source</dt>
                <dd className="skill-detail__meta-truncate">{skill.source}</dd>
              </div>
            )}
            <div className="skill-detail__meta-row">
              <dt>Deps</dt>
              <dd className={`skill-detail__meta-truncate${!skill.dependencies || skill.dependencies === 'None' ? ' skill-detail__meta-none' : ''}`}>
                {!skill.dependencies || skill.dependencies === 'None' ? 'None (prompt-only)' : skill.dependencies}
              </dd>
            </div>
          </dl>

          {stats && (
            <>
              <div className="skill-detail__meta-divider" />
              <dl className="skill-detail__meta-list">
                <div className="skill-detail__meta-row">
                  <dt>Words</dt>
                  <dd>{fmt(stats.words)}</dd>
                </div>
                <div className="skill-detail__meta-row">
                  <dt>Chars</dt>
                  <dd>{fmt(stats.chars)}</dd>
                </div>
                <div className="skill-detail__meta-row">
                  <dt>Lines</dt>
                  <dd>{fmt(stats.lines)}</dd>
                </div>
              </dl>
            </>
          )}

          {loading && !stats && (
            <div className="skill-detail__meta-loading">
              <div className="skill-detail__spinner" />
            </div>
          )}

          <div className="skill-detail__meta-divider" />
          <CopyButton text={promptText} disabled={loading || !!error || !promptText} />
        </aside>
      </div>

      {/* ── Prompt body ─────────────────────────────────────────────── */}
      <div className="skill-detail__body">
        <div className="skill-detail__body-label">
          <span>Prompt Preview</span>
        </div>

        {loading && (
          <div className="skill-detail__state">
            <div className="skill-detail__spinner" />
            <span>Loading prompt…</span>
          </div>
        )}
        {error && (
          <div className="skill-detail__state skill-detail__state--error">
            Failed to load prompt: {error}
          </div>
        )}
        {!loading && !error && markdownBody && (
          <div className="skill-detail__markdown">
            <ReactMarkdown>{markdownBody}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
