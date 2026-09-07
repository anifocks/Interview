export const AUTH_API = import.meta.env.VITE_AUTH_API_URL || "http://localhost:4000/api";
export const API = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

const TOKEN_KEY = "interview_token";
const USER_KEY = "interview_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(base, path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    const error = new Error((json && json.message) || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return json;
}

export const authApi = {
  request: (path, options) => request(AUTH_API, path, options)
};

export const api = {
  request: (path, options) => request(API, path, options)
};