"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, setTokens, clearTokens, getAccessToken } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: "startup" | "investor" | "admin" | "iec_staff";
  approval_status: string;
  email_verified: boolean;
  org_id: string | null;
  org: {
    id: string;
    name: string;
    org_type: string;
    verification_status: string;
  } | null;
  phone?: string | null;
  startup_profile: Record<string, unknown> | null;
  investor_profile: Record<string, unknown> | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  user_type: "startup" | "investor";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<{ success: boolean; user: User }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  // On mount: check token & fetch user
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{
      success: boolean;
      user: User;
      access_token: string;
      refresh_token: string;
    }>("/auth/login", { email, password }, { skipAuth: true });

    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    await api.post("/auth/register", registerData, { skipAuth: true });
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
