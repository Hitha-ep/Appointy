import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('appointy_token') || localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const persistAuth = (authToken, authUser) => {
    if (authToken) {
      localStorage.setItem('appointy_token', authToken);
      localStorage.removeItem('token');
    } else {
      localStorage.removeItem('appointy_token');
      localStorage.removeItem('token');
    }

    if (authUser) {
      localStorage.setItem('appointy_user', JSON.stringify(authUser));
      localStorage.setItem('user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('appointy_user');
      localStorage.removeItem('user');
    }
  };

  // Load user on mount / token change
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('appointy_token') || localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.data.success) {
          setUser(res.data.user);
          setToken(storedToken);
          persistAuth(storedToken, res.data.user);
        } else {
          persistAuth(null, null);
          setToken(null);
          setUser(null);
        }
      } catch {
        persistAuth(null, null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    if (res.data.success) {
      persistAuth(res.data.token, res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (data) => {
    const res = await axios.post('/api/auth/register', data);
    if (res.data.success) {
      persistAuth(null, null);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const logout = () => {
    persistAuth(null, null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
