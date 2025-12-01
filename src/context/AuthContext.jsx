// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // ---------- HELPERS ----------
  const saveAuth = (token, user) => {
    setToken(token);
    setUser(user);
    setRole(user.userType);
    setIsAuthenticated(true);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.userType);
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/api/users/login", { email, password });
      console.log("Login response from backend:", res.data);

      const { token, user } = res.data.data;
      saveAuth(token, user);

      // AFTER LOGIN → decide where to go based on role & profile
      await routeAfterLogin(user);
    } catch (err) {
      console.error("Login error:", err);
      throw err; // LoginPage will catch and show “Internal Server Error”
    } finally {
      setLoading(false);
    }
  };

  // ---------- ROUTE DECISION AFTER LOGIN ----------
  const routeAfterLogin = async (user) => {
    const userId = user.userId;
    const userType = user.userType;

    try {
      if (userType === "JOB_SEEKER") {
        // check if job seeker profile exists
        try {
          const res = await axiosClient.get(`/api/jobseekers/checkuser/${userId}`);
          const js = res.data.data;
          console.log("Job seeker check:", js);

          if (js) {
            // profile exists – go to jobs page
            navigate("/jobs", { replace: true });
          } else {
            // safety fallback
            navigate("/profile", { replace: true });
          }
        } catch (err) {
          if (err.response?.status === 404) {
            // No profile yet → open profile form
            navigate("/profile", { replace: true });
          } else {
            console.error("Error checking job seeker profile:", err);
            navigate("/profile", { replace: true }); // safe fallback
          }
        }
      } else if (userType === "EMPLOYER") {
        // check if employer profile exists
        try {
          const res = await axiosClient.get(`/api/employers/checkuser/${userId}`);
          const employer = res.data.data;
          console.log("Employer check:", employer);

          if (!employer) {
            navigate("/profile", { replace: true });
            return;
          }

          // If employer exists but not approved yet → stay on profile
          if (employer.approvalStatus === "APPROVED") {
            navigate("/employer/dashboard", { replace: true });
          } else {
            navigate("/profile", { replace: true });
          }
        } catch (err) {
          if (err.response?.status === 404) {
            // no employer row yet → first-time login
            navigate("/profile", { replace: true });
          } else {
            console.error("Error checking employer profile:", err);
            navigate("/profile", { replace: true });
          }
        }
      } else if (userType === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        // unknown role → log out for safety
        clearAuth();
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Error in routeAfterLogin:", err);
      navigate("/login", { replace: true });
    }
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const value = {
    token,
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);