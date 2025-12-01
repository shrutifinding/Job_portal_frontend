import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobListPage from "./pages/JobListPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import ProfilePage from "./pages/ProfilePage";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<JobListPage />} />
      <Route path="/jobs" element={<JobListPage />} />
      <Route path="/jobs/:id" element={<JobDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Job seeker only */}
      <Route
        path="/saved-jobs"
        element={
          <PrivateRoute allowedRoles={["JOB_SEEKER"]}>
            <SavedJobsPage />
          </PrivateRoute>
        }
      />

      {/* Any logged-in user */}
      <Route
        path="/profile"
        element={
          <PrivateRoute allowedRoles={["JOB_SEEKER", "EMPLOYER", "ADMIN"]}>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* Employer dashboard */}
      <Route
        path="/employer"
        element={
          <PrivateRoute allowedRoles={["EMPLOYER"]}>
            <EmployerDashboard />
          </PrivateRoute>
        }
      />

<Route
  path="/jobseeker/complete-profile"
  element={
    <PrivateRoute allowedRoles={["JOB_SEEKER"]}>
      <ProfilePage />
    </PrivateRoute>
  }
/>
      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;