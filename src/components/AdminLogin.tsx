import React, { useState } from 'react';
import { Lock, User, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple, solid predefined credentials
    if (username === 'admin' && password === 'admin123') {
      onLoginSuccess();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-view">
      <div className="login-card glass">
        <div className="login-header">
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'hsl(var(--color-primary-glow))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--color-primary))',
              border: '1px solid hsl(var(--color-primary) / 0.3)',
              marginBottom: '0.5rem',
            }}
          >
            <Lock size={22} />
          </div>
          <h2 className="login-title">Administrator Portal</h2>
          <p className="login-subtitle">Sign in to edit the family tree records</p>
        </div>

        {error && (
          <div className="login-error">
            <ShieldAlert size={16} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username-input">Username</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'hsl(var(--text-muted))',
                }}
              />
              <input
                id="username-input"
                type="text"
                className="form-input"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'hsl(var(--text-muted))',
                }}
              />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
            Login
          </button>
        </form>

        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textAlign: 'center', marginTop: '0.5rem' }}>
          Demo Hint: Use <strong>admin</strong> &amp; <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
};
