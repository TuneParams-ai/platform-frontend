import React from "react";
import "./../styles/root.css";

const Navbar = ({ user }) => {
    return (
        <nav className="navbar">
            <div className="logo">TUNEPARAMS</div>
            <div className="nav-links">
                <a href="/">Home</a>
                <a href="/courses">Courses</a>
                {user?.role === "student" && <a href="/my-courses">My Courses</a>}
                {user?.role === "admin" && <a href="/dashboard">Admin Panel</a>}
                {user ? (
                    <button onClick={user.logout}>Logout</button>
                ) : (
                    <a href="/login">Login</a>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
