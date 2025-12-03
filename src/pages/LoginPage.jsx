// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * LoginPage
 * Accepts optional redirect query param `?redirect=/path`
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/jobs";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      // if login returned user, route accordingly - AuthContext routes on fetch
      if (res?.user) {
        // if user status incomplete AuthContext handles redirect to /profile
        navigate(redirect, { replace: true });
      } else {
        // fallback
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      console.error("login failed", err);
      setErr(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "28px auto", padding: 12 }}>
      <div className="auth-card">
        <h2>Login</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {err && <div style={{ color: "#f97373" }}>{err}</div>}
          <div style={{ marginTop: 12 }}>
            <button className="pill-button filled" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
