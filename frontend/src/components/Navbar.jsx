import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-dark-secondary to-dark-surface border-b border-dark-border backdrop-blur-xl shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-accent-teal rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-all">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-primary">SpendWise AI</h1>
              <p className="text-text-muted text-xs font-semibold">Smart Budget</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { path: '/dashboard', label: 'Dashboard', icon: '📊' },
              { path: '/analytics', label: 'Analytics', icon: '📈' },
              { path: '/profile', label: 'Profile', icon: '👤' }
            ].map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  isActive(path)
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
                }`}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>

          {/* User */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-text-primary">{user?.name}</p>
              <p className="text-text-muted text-xs">Logged In</p>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-gradient-to-r from-status-error to-status-warning text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
