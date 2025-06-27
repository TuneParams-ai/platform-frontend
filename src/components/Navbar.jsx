import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../styles/root.css";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
        <Link to="/" onClick={closeMenu}>TUNEPARAMS</Link>
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
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/courses" onClick={closeMenu}>Courses</Link>
        {user?.role === "student" && <Link to="/my-courses" onClick={closeMenu}>My Courses</Link>}
        {user?.role === "admin" && <Link to="/dashboard" onClick={closeMenu}>Admin Panel</Link>}
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
        {user ? (
          <button onClick={() => { user.logout(); closeMenu(); }}>Logout</button>
        ) : (
          <Link to="/login" onClick={closeMenu}>Login</Link>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
