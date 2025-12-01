// src/pages/AdminDashboard.jsx
import React from "react";
import Layout from "../components/Layout";

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">
          Review employers, manage users and keep the platform safe.
        </p>
      </div>

      <div className="card-grid">
        <div className="card stats-card">
          <h3>Pending Employers</h3>
          <p className="big-number">5</p>
          <p className="small-text muted">
            Call your `/admin/employers/pending` endpoint here.
          </p>
        </div>
        <div className="card stats-card">
          <h3>Active Users</h3>
          <p className="big-number">120</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
