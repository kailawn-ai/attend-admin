"use client";

export type ApiAuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresAt: number | null;
};

const AUTH_STORAGE_KEY = "attend-admin.auth-session";

const EMPTY_AUTH_SESSION: ApiAuthSession = {
  accessToken: null,
  refreshToken: null,
  tokenType: "Bearer",
  expiresAt: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function looksLikeUser(value: unknown) {
  return (
    isRecord(value) &&
    ("id" in value || "name" in value || "email" in value)
  );
}

function getFirstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getFirstNumber(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function resolveExpiresAt(expiresAt: unknown, expiresIn: unknown) {
  if (typeof expiresAt === "string" && expiresAt.trim()) {
    const parsed = Date.parse(expiresAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const numericExpiresAt = getFirstNumber([expiresAt]);
  if (numericExpiresAt !== null) {
    return numericExpiresAt > 1_000_000_000_000
      ? numericExpiresAt
      : numericExpiresAt * 1000;
  }

  const numericExpiresIn = getFirstNumber([expiresIn]);
  if (numericExpiresIn !== null) {
    return Date.now() + numericExpiresIn * 1000;
  }

  return null;
}

export function getEmptyAuthSession(): ApiAuthSession {
  return { ...EMPTY_AUTH_SESSION };
}

export function isBrowser() {
  return typeof window !== "undefined";
}

export function readStoredAuthSession() {
  if (!isBrowser()) {
    return getEmptyAuthSession();
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return getEmptyAuthSession();
    }

    const parsed = JSON.parse(rawValue) as Partial<ApiAuthSession>;
    return {
      accessToken:
        typeof parsed.accessToken === "string" && parsed.accessToken.trim()
          ? parsed.accessToken
          : null,
      refreshToken:
        typeof parsed.refreshToken === "string" && parsed.refreshToken.trim()
          ? parsed.refreshToken
          : null,
      tokenType:
        typeof parsed.tokenType === "string" && parsed.tokenType.trim()
          ? parsed.tokenType
          : "Bearer",
      expiresAt:
        typeof parsed.expiresAt === "number" && Number.isFinite(parsed.expiresAt)
          ? parsed.expiresAt
          : null,
    };
  } catch {
    return getEmptyAuthSession();
  }
}

export function writeStoredAuthSession(session: ApiAuthSession) {
  if (!isBrowser()) {
    return;
  }

  if (!session.accessToken && !session.refreshToken) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function extractSessionUser<TUser>(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  const data = isRecord(payload.data) ? payload.data : null;
  const candidate = isRecord(data?.user) ? data.user : data;

  return looksLikeUser(candidate) ? (candidate as TUser) : null;
}

export function extractAuthSession(
  payload: unknown,
  currentSession?: ApiAuthSession,
): ApiAuthSession | null {
  if (!isRecord(payload)) {
    return null;
  }

  const data = isRecord(payload.data) ? payload.data : null;
  const accessToken = getFirstString([
    data?.access_token,
    data?.accessToken,
    data?.token,
    payload.access_token,
    payload.accessToken,
    payload.token,
  ]);
  const refreshToken = getFirstString([
    data?.refresh_token,
    data?.refreshToken,
    payload.refresh_token,
    payload.refreshToken,
  ]);
  const tokenType =
    getFirstString([
      data?.token_type,
      data?.tokenType,
      payload.token_type,
      payload.tokenType,
    ]) ?? currentSession?.tokenType ?? "Bearer";
  const expiresAt = resolveExpiresAt(
    data?.expires_at ?? data?.expiresAt ?? payload.expires_at ?? payload.expiresAt,
    data?.expires_in ?? data?.expiresIn ?? payload.expires_in ?? payload.expiresIn,
  );

  if (!accessToken && !refreshToken) {
    return null;
  }

  return {
    accessToken: accessToken ?? currentSession?.accessToken ?? null,
    refreshToken: refreshToken ?? currentSession?.refreshToken ?? null,
    tokenType,
    expiresAt: expiresAt ?? currentSession?.expiresAt ?? null,
  };
}
