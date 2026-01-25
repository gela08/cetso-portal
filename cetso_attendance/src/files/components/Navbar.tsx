import React from 'react';
import '../styles/components/navbar.css';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  user: any;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, logout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setView('public')}>
        <span className="brand-orange">CETSO</span> Portal
      </div>
      <div className="nav-links">
        {/* Public Button */}
        <button 
          className={currentView === 'public' ? 'active' : ''} 
          onClick={() => setView('public')}
        >
          Public View
        </button>

        {/* Officer Controls */}
        {user ? (
          <>
            <button 
              className={currentView === 'dashboard' ? 'active' : ''} 
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={currentView === 'scanner' ? 'active' : ''} 
              onClick={() => setView('scanner')}
            >
              Scanner
            </button>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <button 
            className="btn-login" 
            onClick={() => setView('login')}
          >
            Officer Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;