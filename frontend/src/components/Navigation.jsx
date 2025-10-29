import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/components/Navigation.css";

export default function Navigation() {
  const { isLoggedIn, role, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-title-link">
          <h1 className="nav-title">L'art du vrai soi</h1>
        </Link>
        
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/gallery"
            className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
          >
            Gallery
          </Link>
        </div>

        <div className="nav-icons">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="icon-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
              <Link to="/wishlist" className="icon-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Wishlist
              </Link>
              <Link to="/orders" className="icon-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="logout-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );

  const getUserActions = () => {
    if (!isLoggedIn) {
      return showAuthLink ? (
        <Link
          to="/login"
          className="nav-link"
          onClick={closeMobileMenu}
          aria-label="Sign In / Sign Up"
        >
          Sign In / Sign Up
        </Link>
      ) : null;
    }

    return (
      <div className="user-actions">
        <Link
          to="/dashboard"
          className={`user-action ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={closeMobileMenu}
          aria-label="Dashboard"
        >
          <span className="user-action-icon" aria-hidden="true">局</span>
          <span className="user-action-label">Dashboard</span>
        </Link>
        <Link
          to="/wishlist"
          className={`user-action ${location.pathname === '/wishlist' ? 'active' : ''}`}
          onClick={closeMobileMenu}
          aria-label="Wishlist"
        >
          <span className="user-action-icon" aria-hidden="true">©</span>
          <span className="user-action-label">
            Wishlist
            {wishlistCount > 0 && (
              <span className="wishlist-count">({wishlistCount})</span>
            )}
          </span>
        </Link>
        <Link
          to="/orders"
          className={`user-action ${location.pathname === '/orders' ? 'active' : ''}`}
          onClick={closeMobileMenu}
          aria-label="Orders"
        >
          <span className="user-action-icon" aria-hidden="true">只</span>
          <span className="user-action-label">Orders</span>
        </Link>
        <button
          onClick={() => { handleLogout(); closeMobileMenu(); }}
          className="nav-link logout-btn"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/" className="nav-title-link" aria-label="L'art du vrai soi homepage">
          <h1 className="nav-title">
            L'art du vrai soi
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <div className="left-nav">
            {getLeftNavLinks()}
          </div>
          <div className="spacer"></div>
          {getUserActions()}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-nav-links">
            {getLeftNavLinks()}
            {getUserActions()}
          </div>
        </div>
      )}
    </nav>
  );
}
