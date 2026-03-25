import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// ✅ Token keys MUST match api.js
const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh";

const setAuthHeaders = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("users/me/");
      setUser(response.data);
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Session expired. Please log in again.");
      return false;
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        setAuthHeaders(token);
        const success = await fetchUser();
        if (!success) {
          // Clear invalid tokens
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
          setAuthHeaders(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post("auth/login/", { username, password });
      const { access, refresh } = response.data;

      // ✅ Store with consistent keys
      localStorage.setItem(TOKEN_KEY, access);
      if (refresh) {
        localStorage.setItem(REFRESH_KEY, refresh);
      }

      setAuthHeaders(access);
      await fetchUser();
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(message);
      console.error("Login error:", err);
      return { success: false, error: message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAuthHeaders(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return false;

    try {
      const response = await api.post("auth/refresh/", { refresh });
      const { access } = response.data;

      localStorage.setItem(TOKEN_KEY, access);
      setAuthHeaders(access);
      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      return false;
    }
  }, [logout]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    getToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
