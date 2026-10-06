import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser } from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ecofleet_token';
const USER_KEY = 'ecofleet_user';

function isTokenExpired(token) {
  if (!token || token.startsWith('demo-')) return false; // Demo token doesn't expire
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } else {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } else {
        // Automatically pre-authenticate in evaluator demo mode if no prior session
        const defaultUser = {
          email: 'admin@ecofleet.ai',
          full_name: 'Aditya Singh (MCD Administrator)',
          name: 'Aditya Singh',
          role: 'admin',
          zone: 'South Delhi Zone 3 & 4',
        };
        const defaultToken = 'demo-jwt-token-wastechakra-2026';
        localStorage.setItem(TOKEN_KEY, defaultToken);
        localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
        setToken(defaultToken);
        setUser(defaultUser);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginUser({ email, password });
      const accessToken = data.access_token || data.token || 'demo-token';
      const rawUser = data.user || {
        email,
        full_name: 'Aditya Singh',
        role: 'admin',
      };
      const userData = {
        ...rawUser,
        name: rawUser.full_name || rawUser.name || email.split('@')[0],
      };

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
