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
    const chars = promptText.length;
    const words = promptText.trim().split(/\s+/).length;
    const lines = promptText.split('\n').length;
    return { chars, words, lines };
  }, [promptText]);

  if (!skill) return null; // Landing handles empty state

  return (
    <div className="skill-detail">

      {/* ── Two-column header ─────────────────────────────────────── */}
      <div className="skill-detail__header">

        {/* Left: title + description + chips */}
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
        </div>

        {/* Right: metadata panel + copy button */}
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
            {skill.dependencies && skill.dependencies !== 'None' && (
              <div className="skill-detail__meta-row">
                <dt>Deps</dt>
                <dd className="skill-detail__meta-truncate">{skill.dependencies}</dd>
              </div>
            )}
            {skill.dependencies === 'None' || !skill.dependencies ? (
              <div className="skill-detail__meta-row">
                <dt>Deps</dt>
                <dd className="skill-detail__meta-none">None (prompt-only)</dd>
              </div>
            ) : null}
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
                  <dt>Characters</dt>
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

      {/* ── Prompt body ───────────────────────────────────────────── */}
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
        {!loading && !error && promptText && (
          <div className="skill-detail__markdown">
            <ReactMarkdown>{promptText}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
