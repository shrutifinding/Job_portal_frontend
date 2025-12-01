// src/api.js
const API_BASE = "http://localhost:9192";

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function setAuthSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Generic wrapper around fetch
export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    headers: customHeaders = {},
  } = options;

  const headers = {
    "Content-Type": body instanceof FormData ? undefined : "application/json",
    ...customHeaders,
  };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }

  // Your backend wraps data as {timestamp, status, message, data, errors}
  return data && data.data ? data.data : data;
}