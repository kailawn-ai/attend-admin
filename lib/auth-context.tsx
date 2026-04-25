"use client";

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearApiSession,
  hydrateApiSession,
  setApiSession,
} from "@/lib/api/apiClient";
import {
  type LoginPayload,
  type RegisterPayload,
  type SessionUser,
  extractAuthSession,
  getSessionUserFromResponse,
  login,
  me,
  register,
} from "@/lib/api/session-service";

export type AuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "signing-in"
  | "signing-out";

export type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  user: SessionUser | null;
  refreshSession: () => Promise<SessionUser | null>;
  signIn: (payload: LoginPayload) => Promise<SessionUser>;
  signUp: (payload: RegisterPayload) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  syncUser: (user: SessionUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function getPostAuthRoute(user: SessionUser) {
  void user;
  return "/" as const;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  const resolveAuthenticatedUser = useCallback(async (payload: unknown) => {
    const embeddedUser = getSessionUserFromResponse(payload);
    if (embeddedUser) {
      return embeddedUser;
    }

    const meResponse = await me();
    return getSessionUserFromResponse(meResponse);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setAuthStatus("checking");
      const response = await me();
      const currentUser = getSessionUserFromResponse(response);
      if (!currentUser) {
        clearApiSession();
        setUser(null);
        setAuthStatus("unauthenticated");
        return null;
      }

      setUser(currentUser);
      setAuthStatus("authenticated");
      return currentUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearApiSession();
        setUser(null);
        setAuthStatus("unauthenticated");
        return null;
      }

      throw error;
    }
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    setAuthStatus("signing-in");

    try {
      const response = await login(payload);
      const nextSession = extractAuthSession(response);
      if (nextSession) {
        setApiSession(nextSession);
      }

      const currentUser = await resolveAuthenticatedUser(response);
      if (!currentUser) {
        throw new Error("Authenticated user was not returned by the API.");
      }

      setUser(currentUser);
      setAuthStatus("authenticated");
      return currentUser;
    } catch (error) {
      clearApiSession();
      setUser(null);
      setAuthStatus("unauthenticated");
      throw error;
    }
  }, [resolveAuthenticatedUser]);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setAuthStatus("signing-in");

    try {
      const response = await register(payload);
      const nextSession = extractAuthSession(response);
      if (nextSession) {
        setApiSession(nextSession);
      }

      const currentUser = await resolveAuthenticatedUser(response);
      if (!currentUser) {
        throw new Error("Authenticated user was not returned by the API.");
      }

      setUser(currentUser);
      setAuthStatus("authenticated");
      return currentUser;
    } catch (error) {
      clearApiSession();
      setUser(null);
      setAuthStatus("unauthenticated");
      throw error;
    }
  }, [resolveAuthenticatedUser]);

  const signOut = useCallback(async () => {
    setAuthStatus("signing-out");

    clearApiSession();
    setUser(null);
    setAuthStatus("unauthenticated");
  }, []);

  const syncUser = useCallback((nextUser: SessionUser | null) => {
    setUser(nextUser);
    setAuthStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        hydrateApiSession();
        const currentUser = await refreshSession();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setAuthStatus("unauthenticated");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading: authStatus === "checking" || authStatus === "signing-in",
      isAuthenticated: authStatus === "authenticated",
      authStatus,
      user,
      refreshSession,
      signIn,
      signUp,
      signOut,
      syncUser,
    }),
    [authStatus, refreshSession, signIn, signOut, signUp, syncUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useSession must be used within an AuthProvider.");
  }

  return context;
}
