import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./../styles/root.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Admin emails list
  const adminEmails = [
    'admin@tuneparams.ai',
    'abhinaykotla@gmail.com',
    // Add more admin emails here as needed
  ];

  // Check if current user is admin
  const isAdmin = user && adminEmails.includes(user.email);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
      closeMenu();
    }
  };

  // Function to check if a path is active
  const isActivePath = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          <img src="/logo192.png" alt="TuneParams Logo" className="logo-image" />
          TunePARAMS
        </Link>
      </div>

      {/* Hamburger Menu Button */}
      <button
        className={`hamburger ${isOpen ? 'hamburger-open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links */}
      <div className={`nav-links ${isOpen ? 'nav-links-open' : ''}`}>
        <Link
          to="/"
          onClick={closeMenu}
          className={isActivePath("/") ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/courses"
          onClick={closeMenu}
          className={isActivePath("/courses") ? "active" : ""}
        >
          Courses
        </Link>
        {user && (
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className={isActivePath("/dashboard") ? "active" : ""}
          >
            Dashboard
          </Link>
        )}
        <Link
          to="/contact"
          onClick={closeMenu}
          className={isActivePath("/contact") ? "active" : ""}
        >
          Contact
        </Link>

        {user ? (
          <div className="user-menu-container" style={{ position: 'relative' }}>
            <button
              className="user-profile-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-color)',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'background 0.3s ease',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span style={{ fontSize: '14px' }}>{user.name}</span>
              <span style={{ fontSize: '12px' }}>▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown" style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'var(--background-color)',
                border: '1px solid rgba(29, 126, 153, 0.2)',
                borderRadius: '8px',
                padding: '8px',
                minWidth: '200px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                zIndex: 1000
              }}>
                <div style={{
                  padding: '12px',
                  borderBottom: '1px solid rgba(29, 126, 153, 0.2)',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--secondary-text-color)' }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-text-color)', marginTop: '4px' }}>
                    Role: {user.role} {isAdmin && '(Admin)'}
                  </div>
                </div>

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/payments"
                      onClick={closeMenu}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        textAlign: 'left',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      🏛️ Admin Panel
                    </Link>
                    <Link
                      to="/firebase-test"
                      onClick={closeMenu}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        textAlign: 'left',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      🔥 Firebase Test
                    </Link>
                    <Link
                      to="/firestore-test"
                      onClick={closeMenu}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        textAlign: 'left',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      🗃️ Firestore Test
                    </Link>
                    <Link
                      to="/paypal-test"
                      onClick={closeMenu}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        textAlign: 'left',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      💳 PayPal Test
                    </Link>
                    <div style={{ height: '1px', background: 'rgba(29, 126, 153, 0.2)', margin: '8px 0' }}></div>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    textAlign: 'left',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            onClick={closeMenu}
            className={isActivePath("/login") ? "active" : ""}
          >
            Login
          </Link>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
