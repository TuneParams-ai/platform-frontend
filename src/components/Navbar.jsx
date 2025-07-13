import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./../styles/root.css";
import "./../styles/navbar.css";

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
          <div className="user-menu-container">
            <button
              className="user-profile-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-fallback">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="user-name">{user.name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info-section">
                  <div className="user-info-name">
                    {user.name}
                  </div>
                  <div className="user-info-email">
                    {user.email}
                  </div>
                  <div className="user-info-role">
                    Role: {user.role} {isAdmin && '(Admin)'}
                  </div>
                </div>

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/payments"
                      onClick={closeMenu}
                      className="admin-menu-link"
                    >
                      🏛️ Admin Panel
                    </Link>
                    <Link
                      to="/firebase-test"
                      onClick={closeMenu}
                      className="admin-menu-link"
                    >
                      🔥 Firebase Test
                    </Link>
                    <Link
                      to="/firestore-test"
                      onClick={closeMenu}
                      className="admin-menu-link"
                    >
                      🗃️ Firestore Test
                    </Link>
                    <Link
                      to="/paypal-test"
                      onClick={closeMenu}
                      className="admin-menu-link"
                    >
                      💳 PayPal Test
                    </Link>
                    <div className="admin-menu-separator"></div>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="logout-button"
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
