import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  showHistory?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showHistory = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#logo-gradient)"/>
              <path d="M12 12H28M12 20H28M12 28H22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366F1"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="header-text">
            <h1 className="header-title">Web Clipper</h1>
          </div>
        </div>

        {(showHistory || isHome) && (
          <nav className="header-nav">
            <button className="nav-btn" onClick={handleHistoryClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              解析历史
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
