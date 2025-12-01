// src/components/Layout.jsx
import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;