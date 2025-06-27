import React from "react";
import { Link } from "react-router-dom";
import "./../styles/root.css";

const Navbar = ({ user }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">TUNEPARAMS</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        {user?.role === "student" && <Link to="/my-courses">My Courses</Link>}
        {user?.role === "admin" && <Link to="/dashboard">Admin Panel</Link>}
        <Link to="/contact">Contact</Link>
        {user ? (
          <button onClick={user.logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
