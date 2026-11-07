import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('xora_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and load user
  useEffect(() => {
    const initializeAuth = async () => {
      localStorage.removeItem('xora_token');
      localStorage.removeItem('xora_user');
      const storedToken = sessionStorage.getItem('xora_token');
      if (storedToken) {
        try {
          const res = await authService.getProfile();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.warn('Session expired or invalid, clearing local credentials.');
          sessionStorage.removeItem('xora_token');
          sessionStorage.removeItem('xora_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    if (rememberMe) {
      return {
        success: false,
        message: 'Remember Me needs secure persistent-session support from the server. Please sign in with Remember Me unchecked for now.'
      };
    }

    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        sessionStorage.setItem('xora_token', newToken);
        sessionStorage.setItem('xora_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await authService.register({ name, email, password, confirmPassword });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        sessionStorage.setItem('xora_token', newToken);
        sessionStorage.setItem('xora_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    const currentToken = sessionStorage.getItem('xora_token');
    if (currentToken) authService.logout(currentToken).catch(() => {});
    sessionStorage.removeItem('xora_token');
    sessionStorage.removeItem('xora_user');
    localStorage.removeItem('xora_token');
    localStorage.removeItem('xora_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
