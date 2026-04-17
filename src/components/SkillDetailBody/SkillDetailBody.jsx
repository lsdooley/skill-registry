import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ExternalLink } from 'lucide-react';
import TabBar from '../TabBar/TabBar';
import FileBrowser from '../FileBrowser/FileBrowser';
import RiskBadge from '../RiskBadge/RiskBadge';
import VersionBadge from '../VersionBadge/VersionBadge';
import './SkillDetailBody.css';

const TABS = [
  { id: 'readme',    label: 'README' },
  { id: 'content',   label: 'Content' },
  { id: 'details',   label: 'Details' },
  { id: 'releases',  label: 'Releases' },
  { id: 'learnings', label: 'Learnings' },
];

// Props:
//   skill        — the skill object
//   fullPageLink — optional path string; renders a "Full page →" link next to the tab bar
export default function SkillDetailBody({ skill, fullPageLink }) {
  const [activeTab, setActiveTab] = useState('readme');

  const tabs = TABS.map(t => ({
    ...t,
    count: t.id === 'releases'  ? skill.releases?.length
         : t.id === 'learnings' ? skill.learnings?.length
         : undefined,
  }));

  return (
    <div className="sdb">
      {/* ── Tab bar row ── */}
      <div className="sdb__bar">
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        {fullPageLink && (
          <Link to={fullPageLink} className="sdb__ext">
            Full page <ExternalLink size={11} />
          </Link>
        )}
      </div>

      {/* ── Tab content ── */}
      <div className="sdb__content">

        {/* README */}
        {activeTab === 'readme' && (
          skill.hasFullContent ? (
            <div className="markdown-body">
              <ReactMarkdown>{skill.body}</ReactMarkdown>
            </div>
          ) : (
            <div className="sdb__no-content">
              <p>Full skill content is not yet available for <strong>{skill.title}</strong>.</p>
              <p>This skill is listed in the category index. Install it via CLI to get the latest version.</p>
              <code>claude skills add {skill.owner}/{skill.slug}</code>
            </div>
          )
        )}

        {/* Content — FileBrowser */}
        {activeTab === 'content' && (
          skill.hasFullContent ? (
            <FileBrowser skill={skill} />
          ) : (
            <div className="sdb__no-content">
              <p>No SKILL.md content available for this skill.</p>
            </div>
          )
        )}

        {/* Details */}
        {activeTab === 'details' && (
          <table className="sdb__detail-table">
            <tbody>
              {[
                ['Category',     skill.category],
                ['Risk',         <RiskBadge key="risk" risk={skill.risk} />],
                ['EA Fit',       `${skill.eaFit}/100`],
                ['Banking Fit',  `${skill.bankingFit}/100`],
                ['Source',       skill.source],
                ['Version',      <VersionBadge key="ver" version={skill.version} />],
                ['License',      skill.license],
                ['Dependencies', skill.dependencies],
                ['Date Added',   new Date(skill.dateAdded).toLocaleDateString()],
                ['Owner',        skill.owner],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="sdb__detail-key">{k}</td>
                  <td className="sdb__detail-val">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Releases */}
        {activeTab === 'releases' && (
          <table className="sdb__release-table">
            <thead>
              <tr><th>Version</th><th>Date</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {skill.releases?.map(r => (
                <tr key={r.version}>
                  <td><VersionBadge version={r.version} /></td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Learnings */}
        {activeTab === 'learnings' && (
          <div className="sdb__learnings">
            {(!skill.learnings || skill.learnings.length === 0) ? (
              <p className="sdb__empty">No learnings yet. Edge cases and gotchas will appear here as they are discovered.</p>
            ) : (
              skill.learnings.map((l, i) => (
                <div key={i} className="sdb__learning-item">
                  <div className="sdb__learning-header">
                    <span className="sdb__learning-author">{l.author}</span>
                    <span className="sdb__learning-date">{new Date(l.date).toLocaleDateString()}</span>
                  </div>
                  <p>{l.content}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
