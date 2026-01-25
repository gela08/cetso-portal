import React from 'react';
import '../styles/components/navbar.css';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  user: any;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, logout }) => {
  const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXNNzF_cV5B_i5H3q8JzjvnJWNOSKfPzsJ5w&s";

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setView('public')}>
  <img 
    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXNNzF_cV5B_i5H3q8JzjvnJWNOSKfPzsJ5w&s" 
    alt="CETSO Logo" 
    style={{ 
      borderRadius: '50%', // Makes it a circle
      width: '40px', 
      height: '40px', 
      objectFit: 'cover', // Prevents stretching
      border: '2px solid #ff6600' // Optional: adds an orange ring
    }} 
  />
  <span className="brand-orange" style={{ marginLeft: '10px' }}>CETSO</span> Portal
</div>

      <div className="nav-links">
        {/* Public View Button */}
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
            className={`btn-login ${currentView === 'login' ? 'active' : ''}`} 
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