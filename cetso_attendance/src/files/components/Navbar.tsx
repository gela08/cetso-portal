import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Layout, LogOut, ShieldCheck, Globe } from 'lucide-react';
import '../styles/components/navbar.css';
import cetso from '../../assets/cetso.png';

interface NavbarProps {
  user: any;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="nb-navbar">
      <div className="nb-container">
        <Link to="/" className="nb-brand" onClick={closeMenu}>
          <div className="nb-logo-wrapper">
            <img src={cetso} alt="CETSO Logo" />
          </div>
          <span className="nb-brand-text">
            <span className="nb-orange">CETSO</span> Portal
          </span>
        </Link>

        {/* Desktop Links */}
        <div className={`nb-nav-links ${isOpen ? 'nb-open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nb-item ${isActive ? 'nb-active' : ''}`}
            onClick={closeMenu}
          >
            <Globe size={18} />
            <span>Public View</span>
          </NavLink>

          {user ? (
            <>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `nb-item ${isActive ? 'nb-active' : ''}`}
                onClick={closeMenu}
              >
                <Layout size={18} />
                <span>Dashboard</span>
              </NavLink>
              <button className="nb-btn-logout" onClick={() => { logout(); closeMenu(); }}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <NavLink 
              to="/login" 
              className={({ isActive }) => `nb-btn-login ${isActive ? 'nb-active' : ''}`}
              onClick={closeMenu}
            >
              <ShieldCheck size={18} />
              <span>Officer Login</span>
            </NavLink>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="nb-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;