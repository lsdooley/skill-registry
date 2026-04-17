import { Link } from 'react-router-dom';
import { Users, Database, Shield } from 'lucide-react';
import './TeamsCalloutPanel.css';

export default function TeamsCalloutPanel() {
  return (
    <div className="teams-callout">
      <h3>Built for teams</h3>
      <div className="teams-callout__features">
        <span><Users size={14} /> Org Skills</span>
        <span><Database size={14} /> Shared Context</span>
        <span><Shield size={14} /> Permissions</span>
      </div>
      <Link to="/browse/teams" className="teams-callout__cta">Get started →</Link>
    </div>
  );
}
