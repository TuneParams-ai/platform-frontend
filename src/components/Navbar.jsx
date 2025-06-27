import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./../styles/root.css";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
        {user?.role === "student" && (
          <Link
            to="/my-courses"
            onClick={closeMenu}
            className={isActivePath("/my-courses") ? "active" : ""}
          >
            My Courses
          </Link>
        )}
        {user?.role === "admin" && (
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className={isActivePath("/dashboard") ? "active" : ""}
          >
            Admin Panel
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
          <button onClick={() => { user.logout(); closeMenu(); }}>Logout</button>
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
