import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './AppHeader.css';

function SkillRegistryLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 3h11l5 5v13a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M15 3v5h5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
      <path d="M9 13 L14 10" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      <path d="M9 13 L14 16" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      <circle cx="15" cy="10" r="1" fill="currentColor" opacity="0.7"/>
      <circle cx="15" cy="16" r="1" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

export default function AppHeader({ theme, onToggle }) {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <Link to="/" className="app-header__brand">
          <SkillRegistryLogo />
          <span>Skill Registry</span>
        </Link>
        <nav className="app-header__nav">
          <NavLink to="/browse" className={({isActive}) => isActive ? 'active' : ''}>Browse Skills</NavLink>
          <NavLink to="/docs" className={({isActive}) => isActive ? 'active' : ''}>API Docs</NavLink>
          <NavLink to="/console" className={({isActive}) => isActive ? 'active' : ''}>Console</NavLink>
        </nav>
        <div className="app-header__actions">
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </div>
      </div>
    </header>
  );
}
