// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Layout from "../components/Layout";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("JOB_SEEKER");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // avoid double-submit

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // ignore extra clicks

    setError("");
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        userType,
      };

      const res = await axiosClient.post("/api/users", payload);
      console.log("Register response from backend:", res);

      // If backend returns 2xx, treat as success
      if (res.status >= 200 && res.status < 300) {
        alert("Registration successful. Please log in.");
        navigate("/login");
      } else {
        // Non-2xx but no exception thrown – very rare
        setError(res.data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);

      const backendMsg = err.response?.data?.message || "";

      // ⚠️ Workaround for your case:
      // If backend complains about duplicate email, we assume the user
      // already exists (maybe created just now) and send them to login.
      if (
        backendMsg.toLowerCase().includes("duplicate entry") &&
        backendMsg.toLowerCase().includes("users.email")
      ) {
        alert(
          "This email is already registered. Please log in with your credentials."
        );
        navigate("/login");
        return;
      }

      // Any other error
      setError(backendMsg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="register-page">
        <h2>Create account</h2>
        <p>Join and find your next opportunity</p>

        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

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
            Role
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="EMPLOYER">Employer</option>
            </select>
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

          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterPage;