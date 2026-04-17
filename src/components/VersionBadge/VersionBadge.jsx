import './VersionBadge.css';
export default function VersionBadge({ version }) {
  return <span className="version-badge">v{version}</span>;
}
