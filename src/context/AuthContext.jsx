import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('rfid_api_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('rfid_api_key'));

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('rfid_api_key', apiKey);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('rfid_api_key');
      setIsAuthenticated(false);
    }
  }, [apiKey]);

  const login = (key) => setApiKey(key);
  const logout = () => setApiKey('');

  return (
    <AuthContext.Provider value={{ apiKey, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
