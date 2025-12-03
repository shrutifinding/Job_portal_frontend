// src/pages/RegisterPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient, { API_PATHS } from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function RegisterPage() {
  const { register, login} = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("JOB_SEEKER");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showAdminOption, setShowAdminOption] = useState(true);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

  useEffect(() => {
    (async () => {
      setCheckingAdmins(true);
      try {
        // Preferred public endpoint that returns a number
        const res = await axiosClient.get("/api/admins/public/count", { skipAuth: true }).catch(() => null);
        if (res && (typeof res.data === "number" || typeof res.data?.data === "number")) {
          const count = typeof res.data === "number" ? res.data : res.data.data;
          setShowAdminOption(count === 0);
        } else {
          // fallback: try GET /api/admins
          const res2 = await axiosClient.get("/api/admins", { skipAuth: true }).catch(() => null);
          if (res2 && Array.isArray(res2.data)) setShowAdminOption(res2.data.length === 0);
          else setShowAdminOption(true); // safe fallback — allow admin creation
        }
      } catch (e) {
        setShowAdminOption(true);
      } finally {
        setCheckingAdmins(false);
         //const res3= await axiosClient.get("/api/admins");
      }
    })();
  }, []);

  const validate = () => {
    if (!name.trim()) return "Please enter name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter valid email";
    if (password.length < 6) return "Password must be at least 6 chars";
    if (password !== confirm) return "Passwords don't match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) return setErr(v);

    setLoading(true);
    try {
      // register payload - adjust field names to match backend if different
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        userType: role // "ADMIN" | "JOB_SEEKER" | "EMPLOYER" as backend expects
      };
      const res = await register(payload);
      const created = res?.data ?? res;
      const userId = created ?.userId ?? created?.id ?? created?.data?.userId;

      try{
        await login(email, password, userId);
      }catch(ignore){
        
      }
      if(role ==="ADMIN" || role === "admin"){
        try{
          await axiosClient.post(API_PATHS.ADMIN_CREATE || "/api/admins", {userId});
        }catch(adminErr){
          console.warn("Failed to create admin row", adminErr);
        }
      }
      // After register -> go to login page
      navigate("/login");
    } catch (error) {
      console.error("register failed", error);
      setErr(error?.response?.data?.message || error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="card auth-card">
        <h2>Create an account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>

          <label>Role
            <select value={role} onChange={(e) => setRole(e.target.value)} disabled={checkingAdmins}>
              {showAdminOption && <option value="ADMIN">Admin</option>}
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="EMPLOYER">Employer</option>
            </select>
          </label>

          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <label>Confirm password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>

          {err && <div className="error">{err}</div>}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="pill-button filled" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </div>

          <div className="muted">
            {checkingAdmins ? "Checking system..." : (showAdminOption ? "No admin found — allow Admin signup." : "Admin exists — Admin signup hidden.")}
          </div>
        </form>
      </div>
    </div>
  );
}

