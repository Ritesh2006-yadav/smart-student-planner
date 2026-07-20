import { createContext, useContext, useEffect, useState } from 'react';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ssp-user')) || null);
  useEffect(() => { if (user) localStorage.setItem('ssp-user', JSON.stringify(user)); else localStorage.removeItem('ssp-user'); }, [user]);
  const login = (email) => setUser({ name: email.split('@')[0].replace(/^./, c => c.toUpperCase()), email, avatar: '' });
  const updateProfile = (data) => setUser(u => ({ ...u, ...data }));
  return <AuthContext.Provider value={{ user, login, logout: () => setUser(null), updateProfile }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
