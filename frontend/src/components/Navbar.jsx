import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MessageSquare, PlusCircle, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <ShoppingBag size={28} className="brand-icon" style={{ stroke: 'url(#brand-grad)' }} />
          {/* Setup SVG Gradients for Lucide icons stroke */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </svg>
          CampusTrade
        </Link>

        {user && (
          <ul className="navbar-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
                Browse
              </NavLink>
            </li>
            <li>
              <NavLink to="/sell" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <span className="flex align-center gap-2">
                  <PlusCircle size={16} /> Sell Item
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/inbox" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <span className="flex align-center gap-2">
                  <MessageSquare size={16} /> Inbox
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <span className="flex align-center gap-2">
                  <User size={16} /> Profile
                </span>
              </NavLink>
            </li>
          </ul>
        )}

        <div className="navbar-auth">
          {user ? (
            <div className="flex align-center gap-2" style={{ gap: '16px' }}>
              <Link to="/profile" className="flex align-center gap-2">
                <img src={user.avatar} alt={user.name} className="navbar-avatar" />
                <span className="form-label" style={{ cursor: 'pointer', margin: 0, textTransform: 'none' }}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm" 
                style={{ padding: '8px', display: 'flex', borderRadius: '50%' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
