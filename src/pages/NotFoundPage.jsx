// src/pages/NotFoundPage.jsx
import React from "react";
import Layout from "../components/Layout";

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="auth-card">
        <h2>404</h2>
        <p className="subtitle">We couldn’t find that page.</p>
      </div>
    </Layout>
  );
};

export default NotFoundPage;