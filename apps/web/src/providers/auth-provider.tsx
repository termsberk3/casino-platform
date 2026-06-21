"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/lib/api/endpoints";
import {
  clearTokens,
  getRefreshToken,
  saveTokens,
} from "@/lib/auth/token-storage";
import type { AuthResponse, PublicUser } from "@/types/api";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    setUser(response.user);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getMe();

      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function loadCurrentUser() {
      setIsLoading(true);

      await refreshUser();

      setIsLoading(false);
    }

    void loadCurrentUser();
  }, [refreshUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await loginRequest(input);

      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await registerRequest(input);

      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logoutRequest({
          refreshToken,
        });
      }
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
