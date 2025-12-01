// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
 const  [loading, setLoading] =useState("");
 // if (isAuthenticated) {
 //   return <Navigate to="/" replace />;
 // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (!result) {
      setError("Unexpected error during login.");
      return;
    }
    if (!result.success) {
      setError(result.message);
      return;
    }

    const user = result.user;

    // 👇 First-time login → force profile completion
    if (user.status === "PENDING") {
      navigate("/profile");
      return;
    }

    // 👇 Regular navigation by role
    if (user.userType === "JOB_SEEKER") {
      navigate("/jobs");
    } else if (user.userType === "EMPLOYER") {
      navigate("/employer/dashboard");
    } else if (user.userType === "ADMIN") {
      navigate("/admin/dashboard");
    } else {
      navigate("/"); // fallback
    }
  };
  

  return (
    <Layout>
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Log in to continue</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="pill-button filled full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="small-text">
          New here?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </p>
      </div>
    </Layout>
  );
};

export default LoginPage;