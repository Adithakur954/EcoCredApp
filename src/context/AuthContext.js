import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('ecocred_token');
      const storedUser = await AsyncStorage.getItem('ecocred_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('Error loading auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { token: tk, user: u } = res.data;
    await AsyncStorage.setItem('ecocred_token', tk);
    await AsyncStorage.setItem('ecocred_user', JSON.stringify(u));
    setToken(tk);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    // After registration, auto-login
    return login(email, password);
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (_) {}
    await AsyncStorage.removeItem('ecocred_token');
    await AsyncStorage.removeItem('ecocred_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem('ecocred_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
