import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@parking-motors/shared";
import { api, setStoredToken } from "./api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Parameters<typeof api.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.login({ email, password });
    await setStoredToken(token);
    setUser(user);
  }, []);

  const register = useCallback(async (payload: Parameters<typeof api.register>[0]) => {
    const { user, token } = await api.register(payload);
    await setStoredToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    await setStoredToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
