import { Link } from 'react-router-dom';
import './AppFooter.css';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        <div className="app-footer__brand">
          <span className="app-footer__logo">Skill Registry</span>
          <p className="app-footer__tagline">Discover, install, and share reusable AI agent skills.</p>
        </div>
        <div className="app-footer__col">
          <h4>PRODUCT</h4>
          <Link to="/browse">Browse Skills</Link>
          <Link to="/console">Console</Link>
          <Link to="/docs">API Docs</Link>
        </div>
        <div className="app-footer__col">
          <h4>DEVELOPERS</h4>
          <a href="/api/openapi.json">OpenAPI Spec</a>
          <a href="/api/skills/registry">Skill Reference</a>
          <a href="/api/docs/skill-md">skill.md Spec</a>
          <a href="/.well-known/agent-skill.json">Discovery</a>
        </div>
        <div className="app-footer__col">
          <h4>COMPANY</h4>
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="app-footer__bottom">
        <div className="container">
          <span>© 2026 Skill Registry</span>
        </div>
      </div>
    </footer>
  );
}
