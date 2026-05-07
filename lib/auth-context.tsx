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
import { usePathname } from "next/navigation";
import {
  ApiError,
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
  logout,
  register,
} from "@/lib/api/session-service";
import {
  readStoredSessionUser,
  readStoredSessionHint,
  writeStoredSessionUser,
  writeStoredSessionHint,
} from "@/lib/api/auth-session";

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
const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export function getPostAuthRoute(user: SessionUser) {
  void user;
  return "/" as const;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  const persistAuthenticatedUser = useCallback((currentUser: SessionUser) => {
    writeStoredSessionHint(true);
    writeStoredSessionUser(currentUser);
    setUser(currentUser);
    setAuthStatus("authenticated");
  }, []);

  const clearStoredSession = useCallback(() => {
    clearApiSession();
    writeStoredSessionHint(false);
    writeStoredSessionUser<SessionUser>(null);
    setUser(null);
    setAuthStatus("unauthenticated");
  }, []);

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
        clearStoredSession();
        return null;
      }

      persistAuthenticatedUser(currentUser);
      return currentUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearStoredSession();
        return null;
      }

      throw error;
    }
  }, [clearStoredSession, persistAuthenticatedUser]);

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

      persistAuthenticatedUser(currentUser);
      return currentUser;
    } catch (error) {
      clearStoredSession();
      throw error;
    }
  }, [clearStoredSession, persistAuthenticatedUser, resolveAuthenticatedUser]);

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

      persistAuthenticatedUser(currentUser);
      return currentUser;
    } catch (error) {
      clearStoredSession();
      throw error;
    }
  }, [clearStoredSession, persistAuthenticatedUser, resolveAuthenticatedUser]);

  const signOut = useCallback(async () => {
    setAuthStatus("signing-out");

    try {
      await logout();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    } finally {
      clearStoredSession();
    }
  }, [clearStoredSession]);

  const syncUser = useCallback((nextUser: SessionUser | null) => {
    if (nextUser) {
      persistAuthenticatedUser(nextUser);
      return;
    }

    clearStoredSession();
  }, [clearStoredSession, persistAuthenticatedUser]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const cachedUser = readStoredSessionUser<SessionUser>();
      const hasSessionHint = readStoredSessionHint();
      const session = hydrateApiSession();
      const hasStoredSession =
        hasSessionHint ||
        Boolean(cachedUser) ||
        Boolean(session.accessToken || session.refreshToken);
      const shouldVerifySession =
        hasStoredSession || !PUBLIC_ROUTES.has(pathname);

      if (cachedUser && hasSessionHint && isMounted) {
        setUser(cachedUser);
        setAuthStatus("checking");
      }

      if (!shouldVerifySession) {
        setUser(null);
        setAuthStatus("unauthenticated");
        return;
      }

      try {
        const response = await me();
        const currentUser = getSessionUserFromResponse(response);

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          persistAuthenticatedUser(currentUser);
          return;
        }

        clearStoredSession();
      } catch (error) {
        if (isMounted) {
          if (error instanceof ApiError && error.status === 401) {
            clearStoredSession();
            return;
          }

          if (!cachedUser || !hasSessionHint) {
            setUser(null);
            setAuthStatus("unauthenticated");
          }
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [clearStoredSession, pathname, persistAuthenticatedUser]);

  useEffect(() => {
    const handleStorage = () => {
      hydrateApiSession();

      const cachedUser = readStoredSessionUser<SessionUser>();

      if (cachedUser && readStoredSessionHint()) {
        setUser(cachedUser);
        setAuthStatus("checking");
        return;
      }

      setUser(null);
      setAuthStatus("unauthenticated");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    const verifyVisibleSession = async () => {
      try {
        const response = await me();
        const currentUser = getSessionUserFromResponse(response);

        if (currentUser) {
          persistAuthenticatedUser(currentUser);
          return;
        }

        clearStoredSession();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredSession();
        }
      }
    };

    const handleFocus = () => {
      void verifyVisibleSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verifyVisibleSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authStatus, clearStoredSession, persistAuthenticatedUser]);

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
