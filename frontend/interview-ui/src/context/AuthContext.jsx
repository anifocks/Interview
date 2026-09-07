import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { authApi, getStoredUser, setSession, clearSession } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    authApi
      .request("/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => clearSession());
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authApi.request("/auth/login", {
        method: "POST",
        body: { username, password }
      });
      setSession(res.token, res.user);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    return authApi.request("/auth/register", {
      method: "POST",
      body: payload
    });
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}