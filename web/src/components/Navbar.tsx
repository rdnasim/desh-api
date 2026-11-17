import { BookOpen, Github, Moon, Server, Sun, Globe, Terminal } from 'lucide-react';
import type React from 'react';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  currentView: 'portal' | 'explorer';
  setCurrentView: (view: 'portal' | 'explorer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  baseUrl,
  setBaseUrl,
  currentView,
  setCurrentView,
}) => {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); setCurrentView('portal'); }}>
            <span className="brand-disc" aria-hidden="true" />
            <span className="brand-title">Desh Portal</span>
            <span className="brand-badge">Live API Driven</span>
          </a>

          {/* Mode Switcher: Real Website vs API Explorer */}
          <div className="nav-mode-pill">
            <button
              className={`mode-btn ${currentView === 'portal' ? 'active' : ''}`}
              onClick={() => setCurrentView('portal')}
            >
              <Globe size={14} />
              <span>Consumer Website</span>
            </button>
            <button
              className={`mode-btn ${currentView === 'explorer' ? 'active' : ''}`}
              onClick={() => setCurrentView('explorer')}
            >
              <Terminal size={14} />
              <span>API Explorer</span>
            </button>
          </div>
        </div>

        <div className="nav-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Server size={14} style={{ opacity: 0.7 }} />
            <select
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="base-selector"
              aria-label="API Base URL"
            >
              <option value="https://deshapi.riadul.com">Live (deshapi.riadul.com)</option>
              <option value="http://localhost:8787">Local (localhost:8787)</option>
            </select>
          </div>

          <a
            href="https://deshapi.riadul.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            title="Open Scalar OpenAPI Docs"
          >
            <BookOpen size={16} />
            <span className="hide-mobile">Docs</span>
          </a>

          <a
            href="https://github.com/rdnasim/desh-api"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            title="View Source on GitHub"
          >
            <Github size={16} />
            <span className="hide-mobile">GitHub</span>
          </a>

          <button
            onClick={toggleTheme}
            className="btn btn-icon"
            aria-label="Toggle dark/light theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
};
