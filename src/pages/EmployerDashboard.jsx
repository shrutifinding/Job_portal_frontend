// src/pages/EmployerDashboard.jsx
import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const EmployerDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="page-header">
        <h1>Employer Dashboard</h1>
        <p className="subtitle">
          Welcome back, {user?.name}. Manage your openings and applicants.
        </p>
      </div>

      <div className="card-grid">
        <div className="card stats-card">
          <h3>Open Positions</h3>
          <p className="big-number">3</p>
          <p className="small-text muted">Hook to backend later.</p>
        </div>
        <div className="card stats-card">
          <h3>New Applicants</h3>
          <p className="big-number">12</p>
        </div>
      </div>
    </Layout>
  );
};

export default EmployerDashboard;