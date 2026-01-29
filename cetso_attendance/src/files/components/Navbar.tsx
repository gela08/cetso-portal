import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../styles/components/navbar.css';
import cetso from '../../assets/cetso.png';

interface NavbarProps {
  user: any;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, logout }) => {
  return (
    <nav className="navbar">
      {/* Brand Logo - Clicking it takes you home */}
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
        <img 
          src={cetso} 
          alt="CETSO Logo" 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            objectFit: 'cover',
            border: '2px solid #ff6600' 
          }} 
        />
        <span className="brand-orange" style={{ marginLeft: '10px' }}>CETSO</span> Portal
      </Link>

      <div className="nav-links">
        {/* Public View NavLink */}
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          Public View
        </NavLink>

        {/* Officer Controls */}
        {user ? (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/scanner" 
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              Scanner
            </NavLink>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <NavLink 
            to="/login" 
            className={({ isActive }) => `btn-login nav-item ${isActive ? 'active' : ''}`}
          >
            Officer Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;