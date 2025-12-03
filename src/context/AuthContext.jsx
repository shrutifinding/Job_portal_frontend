// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient, { API_PATHS, normalizeResponse } from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}
/*export function authHeaders(){
  const token = localStorage.getItem('token');
  return token ? {'Authorization' : `Bearer ${token}` } : {};
}*/

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const[token, setToken] = useState("");
  // When initialized, if token exists but user missing, try to fetch user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (token && !storedUser) {
      // If no stored user, try to call backend to fetch it if we saved userId
      const savedUserId = localStorage.getItem("authUserId");
      if (savedUserId) {
        (async () => {
          try {
            const res = await axiosClient.get(API_PATHS.GET_USER_BY_ID(savedUserId));
            const u = normalizeResponse(res);
            setUser(u);
            localStorage.setItem("authUser", JSON.stringify(u));
          } catch (err) {
            // token invalid or fetch failed, clear token
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUserId");
            localStorage.removeItem("authUser");
            setUser(null);
          } finally {
            setAuthReady(true);
          }
        })();
      } else {
        setAuthReady(true);
      }
    } else {
      setAuthReady(true);
    }
  }, []);

  const saveAuth = (token, u) => {
    if (token) localStorage.setItem("authToken", token);
    if (u) {
      setUser(u);
      localStorage.setItem("authUser", JSON.stringify(u));
      if (u.userId || u.id) localStorage.setItem("authUserId", u.userId || u.id);
    }
  };

  // routeAfterLogin: if first-login (status PENDING/INCOMPLETE) redirect to /profile else to role dashboard
  const routeAfterLogin = (user, token) => {
    // store token and user
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
  setUser(user);
  setToken(token);

  const type = (user.userType || user.type || "").toUpperCase();
  const status = (user.status || "").toUpperCase();

  // If Employer or JobSeeker and profile incomplete -> redirect to /complete-profile
  // Decide profile completeness by either a flag user.profileCompleted or by GET to /api/employers/user/{id} and /api/jobseekers/user/{id}
  if (type === "ADMIN") {
    navigate("/admin");
    return;
  }

  if ((type === "EMPLOYER" || type === "JOB_SEEKER")) {
    // if user.status is PENDING, but if employer first-time login they should complete profile,
    // we redirect them to complete-profile (which will create employer/job_seeker rows)
    // For robustness check profile via API:
    // try to fetch employer or jobseeker profile, otherwise redirect to complete-profile
    const userId = user.userId || user.id || user.user_id;

    if (type === "EMPLOYER") {
      // navigate to complete-profile if employer hasn't completed company/employer record
      navigate("/complete-profile");
      return;
    }

    if (type === "JOB_SEEKER") {
      navigate("/complete-profile");
      return;
    }
  }

  // default
  navigate("/jobs");
  };

  /**
   * login(email,password)
   * - POST /api/users/login
   * - backend LoginResponse may contain token and user or token + userId
   */
  const login = async (email, password) =>  {
  // existing call to backend for auth
  const res = await axiosClient.post("/api/users/login", { email, password });
  const data = res?.data ?? res;
  const token = data?.token || data?.accessToken || data?.data?.token;
  const user = data?.user || data?.data || data;

  if (token) localStorage.setItem("authToken", token);
  if (user) localStorage.setItem("authUser", JSON.stringify(user));
  setUser(user);
  setToken(token);

  // Decide redirect:
  // If user needs to complete profile (first login): redirect to /complete-profile (you should have page)
  // We'll check a field like user.profileCompleted or user.status or user.userType
  const userType = user?.userType || user?.type || user?.user_type;
  const status = user?.status || user?.userStatus || user?.statusValue;

  // Heuristic: if jobseeker or employer and their full record doesn't exist -> complete profile
  // If you store a boolean like profileCompleted, check that:
  const profileComplete = user?.profileCompleted ?? user?.profile_completed ?? false;

  if (!profileComplete && (userType === "JOB_SEEKER" || userType === "EMPLOYER")) {
    // redirect to a complete profile form
    navigate("/complete-profile");
    return;
  }

  // else, redirect based on role
  if (userType === "ADMIN") navigate("/admin");
  else if (userType === "EMPLOYER") navigate("/employer");
  else navigate("/jobs");
  };


  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
    setToken(null);
    // redirect to landing page
    navigate("/");
  };

  const register = async (payload) => {
    // Creates user via POST /api/users
    const res = await axiosClient.post(API_PATHS.REGISTER, payload);
    const data = normalizeResponse(res);
    // If backend returns token + user, call saveAuth. Otherwise just return created user
    if (data?.token) {
      const token = data.token;
      const u = data.user || data;
      saveAuth(token, u);
      routeAfterLogin(u);
      return { token, user: u };
    }
    return data;
  };

  const fetchCurrentUser = async () => {
    // read id from storage
    const uid = localStorage.getItem("authUserId") || (user && (user.id || user.userId));
    if (!uid) return null;
    try {
      const res = await axiosClient.get(API_PATHS.GET_USER_BY_ID(uid));
      const u = normalizeResponse(res);
      setUser(u);
      localStorage.setItem("authUser", JSON.stringify(u));
      return u;
    } catch (err) {
      return null;
    }
  };

  const value = {
    user,
    loading,
    authReady,
    login,
    logout,
    register,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
