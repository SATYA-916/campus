import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('campustrade_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('campustrade_user');
      }
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('campustrade_user', JSON.stringify(data));
      setUser(data);
      showToast('Logged in successfully!');
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const register = async (name, email, password, college) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, college }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('campustrade_user', JSON.stringify(data));
      setUser(data);
      showToast('Registered successfully!');
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('campustrade_user');
    setUser(null);
    showToast('Logged out successfully');
  };

  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    // Auto-append base API URL if absolute URL is not provided
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    if (response.status === 401) {
      // Automatic logout if unauthorized token
      logout();
      showToast('Session expired. Please log in again.', 'error');
      throw new Error('Unauthorized');
    }

    return response;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    authFetch,
    showToast,
    toast,
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {toast && (
        <div className={`alert-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};
