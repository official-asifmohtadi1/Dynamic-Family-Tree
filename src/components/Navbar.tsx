import React, { useEffect, useRef, useState } from 'react';
import { GitBranch, Shield, LogOut, Sun, Moon, BarChart2, Download, Upload } from 'lucide-react';

interface NavbarProps {
  currentView: 'tree' | 'admin';
  setView: (view: 'tree' | 'admin') => void;
  isAdmin: boolean;
  onLogout: () => void;
  onShowStats: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setView,
  isAdmin,
  onLogout,
  onShowStats,
  onExport,
  onImport,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with DOM class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so the same file can be re-imported if needed
      e.target.value = '';
    }
  };

  return (
    <nav className="navbar glass">
      <div className="nav-brand">
        <GitBranch size={26} style={{ transform: 'rotate(90deg)', color: 'hsl(var(--color-primary))' }} />
        <span>HERITAGE</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-button ${currentView === 'tree' ? 'active' : ''}`}
          onClick={() => setView('tree')}
        >
          <GitBranch size={16} />
          <span>Interactive Tree</span>
        </button>

        <button
          className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => setView('admin')}
        >
          <Shield size={16} />
          <span>Admin Portal</span>
        </button>

        <div style={{ width: '1px', background: 'hsl(var(--glass-border))', margin: '0 0.25rem' }} />

        {/* Stats */}
        <button
          className="nav-button"
          onClick={onShowStats}
          title="View Family Statistics"
          id="stats-btn"
        >
          <BarChart2 size={17} />
          <span>Stats</span>
        </button>

        {/* Export */}
        <button
          className="nav-button"
          onClick={onExport}
          title="Export family tree as JSON"
          id="export-btn"
        >
          <Download size={17} />
          <span>Export</span>
        </button>

        {/* Import */}
        <button
          className="nav-button"
          onClick={handleImportClick}
          title="Import family tree from JSON"
          id="import-btn"
        >
          <Upload size={17} />
          <span>Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          id="import-file-input"
        />

        <div style={{ width: '1px', background: 'hsl(var(--glass-border))', margin: '0 0.25rem' }} />

        {/* Theme Toggle */}
        <button
          className="nav-button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ padding: '0.5rem' }}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAdmin && currentView === 'admin' && (
          <button className="nav-button" onClick={onLogout} style={{ color: 'hsl(0 84% 65%)' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};
