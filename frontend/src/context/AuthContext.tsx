import { createContext, useContext, useState, type ReactNode } from 'react';
import { clearToken, getToken, setToken } from '../api/client';
import { login as loginRequest } from '../api/adminApi';

interface AdminUser {
  username: string;
  role: 'staff' | 'owner';
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const USER_KEY = 'fc_admin_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AdminUser | null {
  if (!getToken()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(loadStoredUser);

  async function login(username: string, password: string) {
    const response = await loginRequest(username, password);
    setToken(response.token);
    const adminUser: AdminUser = { username: response.username, role: response.role };
    localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
