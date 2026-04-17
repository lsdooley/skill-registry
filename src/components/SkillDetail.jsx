import { useEffect, useState } from 'react';
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
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then(text => { setPromptText(text); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [skill?.promptPath]);

  if (!skill) {
    return (
      <div className="skill-detail skill-detail--empty">
        <div className="skill-detail__welcome">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
          </svg>
          <p>Select a skill from the sidebar to view its Copilot prompt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-detail">
      {/* Header */}
      <div className="skill-detail__header">
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
            <span className={`chip ${fitColor(skill.eaFit)}`}>
              EA Fit: {skill.eaFit}
            </span>
          )}
          {skill.bankingFit > 0 && (
            <span className={`chip ${fitColor(skill.bankingFit)}`}>
              Banking: {skill.bankingFit}
            </span>
          )}
          <span className="chip chip--muted">v{skill.version}</span>
        </div>
      </div>

      {/* Copy button */}
      <div className="skill-detail__copy">
        <CopyButton text={promptText} disabled={loading || !!error || !promptText} />
      </div>

      {/* Divider */}
      <div className="skill-detail__divider">
        <span>Prompt Preview</span>
      </div>

      {/* Prompt content */}
      <div className="skill-detail__body">
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
