import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${location.pathname === to ? 'text-brand-500' : 'text-white/70 hover:text-white'}`}
      style={{ fontFamily: 'Syne, sans-serif' }}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <span className="font-bold text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>TechFix<span className="text-brand-500">Pro</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLink('/', 'Home')}
            {navLink('/services', 'Repairs')}
            {navLink('/shop', 'Shop')}
            {user && navLink('/dashboard', 'Dashboard')}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-white/70 hover:text-white transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-bold">{count}</span>}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50" style={{ fontFamily: 'DM Sans, sans-serif' }}>Hi, {user.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#111] border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {navLink('/', 'Home')}
          {navLink('/services', 'Repairs')}
          {navLink('/shop', 'Shop')}
          {navLink('/cart', `Cart (${count})`)}
          {user && navLink('/dashboard', 'Dashboard')}
          {user ? (
            <button onClick={handleLogout} className="btn-danger w-fit">Logout</button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-4" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
