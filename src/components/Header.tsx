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
            <img src="/logo.png" alt="Web Clipper" />
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
