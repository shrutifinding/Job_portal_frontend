// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Left - Logo */}
        <div className="nav-left" onClick={() => navigate("/")}>
          <div className="logo-circle">J</div>
          <span className="logo-text">JobPortal</span>
        </div>

        {/* Center - Links */}
        <nav className="nav-center">
          <Link to="/jobs" className="nav-link">
            Browse Jobs
          </Link>
          {isAuthenticated && role === "JOB_SEEKER" && (
            <Link to="/saved-jobs" className="nav-link">
              Saved Jobs
            </Link>
          )}
          {isAuthenticated && role === "EMPLOYER" && (
            <Link to="/employer" className="nav-link">
              Employer Dashboard
            </Link>
          )}
          {isAuthenticated && role === "ADMIN" && (
            <Link to="/admin" className="nav-link">
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Right - Auth / Profile */}
        <div className="nav-right">
          {isAuthenticated ? (
            <div className="profile-chip">
              <img
                src={user?.profileImage || "/default-avatar.png"}
                alt={user?.name || "User"}
                className="avatar"
              />
              <div className="profile-text">
                <span className="profile-name">{user?.name}</span>
                <button
                  className="link-button"
                  onClick={() => navigate("/profile")}
                >
                  View profile
                </button>
              </div>
              <button className="pill-button outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="pill-button ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="pill-button filled"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;