import {
  extractAuthSession,
  getEmptyAuthSession,
  type ApiAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "@/lib/api/auth-session";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiPrimitive = string | number | boolean | null;

export type ApiQueryValue = ApiPrimitive | ApiPrimitive[];

export type ApiQueryParams = Record<string, ApiQueryValue | undefined>;

export type ApiHeaders = Record<string, string>;

export type ApiRequestOptions = Omit<
  RequestInit,
  "body" | "method" | "headers"
> & {
  method?: ApiMethod;
  body?: BodyInit | object | null;
  headers?: ApiHeaders;
  query?: ApiQueryParams;
  token?: string | null;
  skipAuthRefresh?: boolean;
};

export type LaravelValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  data: unknown;
  errors?: LaravelValidationErrors;

  constructor(
    message: string,
    status: number,
    data: unknown,
    errors?: LaravelValidationErrors,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.errors = errors;
  }
}

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "https://attend.zostream.in/api";
const DEFAULT_REFRESH_PATHS = (
  process.env.NEXT_PUBLIC_API_REFRESH_PATHS ?? "/refresh,/auth/refresh"
)
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

let authSession: ApiAuthSession = getEmptyAuthSession();
let isAuthSessionHydrated = false;
let refreshRequest: Promise<string | null> | null = null;

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildQueryString(query?: ApiQueryParams) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
      continue;
    }

    params.append(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function isFormData(body: ApiRequestOptions["body"]): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function isJsonBody(body: ApiRequestOptions["body"]) {
  return (
    body !== null &&
    body !== undefined &&
    !isFormData(body) &&
    typeof body === "object"
  );
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.includes("text/")) {
    return response.text();
  }

  return null;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function getValidationErrors(data: unknown) {
  if (!data || typeof data !== "object" || !("errors" in data)) {
    return undefined;
  }

  const errors = (data as { errors?: unknown }).errors;
  return errors && typeof errors === "object"
    ? (errors as LaravelValidationErrors)
    : undefined;
}

export function setApiToken(token: string | null) {
  setApiSession({
    ...authSession,
    accessToken: token,
  });
}

export function getApiToken() {
  return getApiSession().accessToken;
}

export function getApiSession() {
  if (!isAuthSessionHydrated) {
    authSession = readStoredAuthSession();
    isAuthSessionHydrated = true;
  }

  return authSession;
}

export function setApiSession(nextSession: Partial<ApiAuthSession> | null) {
  authSession = nextSession
    ? {
        ...getApiSession(),
        ...nextSession,
      }
    : getEmptyAuthSession();
  isAuthSessionHydrated = true;
  writeStoredAuthSession(authSession);
}

export function hydrateApiSession() {
  authSession = readStoredAuthSession();
  isAuthSessionHydrated = true;
  return authSession;
}

export function clearApiToken() {
  clearApiSession();
}

export function clearApiSession() {
  authSession = getEmptyAuthSession();
  isAuthSessionHydrated = true;
  writeStoredAuthSession(authSession);
}

async function attemptTokenRefresh(baseUrl: string) {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    const currentSession = getApiSession();

    if (!currentSession.accessToken && !currentSession.refreshToken) {
      return null;
    }

    for (const refreshPath of DEFAULT_REFRESH_PATHS) {
      const headers: ApiHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      };

      if (currentSession.accessToken) {
        headers.Authorization = `${currentSession.tokenType} ${currentSession.accessToken}`;
      }

      const response = await fetch(
        `${normalizeBaseUrl(baseUrl)}${normalizePath(refreshPath)}`,
        {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify(
            currentSession.refreshToken
              ? { refresh_token: currentSession.refreshToken }
              : {},
          ),
        },
      ).catch(() => null);

      if (!response) {
        continue;
      }

      const data = await parseResponse(response);

      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          continue;
        }

        if (response.status === 401) {
          clearApiSession();
          return null;
        }

        continue;
      }

      const nextSession = extractAuthSession(data, currentSession);
      if (!nextSession?.accessToken) {
        continue;
      }

      setApiSession(nextSession);
      return nextSession.accessToken;
    }

    return currentSession.accessToken;
  })().finally(() => {
    refreshRequest = null;
  });

  return refreshRequest;
}

export function createApiClient(baseUrl = DEFAULT_BASE_URL) {
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl);

  async function request<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
  ) {
    if (!resolvedBaseUrl) {
      throw new Error("Missing API base URL. Set NEXT_PUBLIC_API_URL.");
    }

    const {
      method = "GET",
      body,
      headers,
      query,
      token = getApiSession().accessToken,
      skipAuthRefresh = false,
      ...fetchOptions
    } = options;

    const requestHeaders: ApiHeaders = {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...headers,
    };

    let requestBody: BodyInit | undefined;

    if (isJsonBody(body)) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    } else if (body !== null && body !== undefined) {
      requestBody = body as BodyInit;
    }

    const tokenType = getApiSession().tokenType || "Bearer";

    if (token) {
      requestHeaders.Authorization = `${tokenType} ${token}`;
    }

    const response = await fetch(
      `${resolvedBaseUrl}${normalizePath(path)}${buildQueryString(query)}`,
      {
        ...fetchOptions,
        credentials: fetchOptions.credentials ?? "include",
        method,
        headers: requestHeaders,
        body: requestBody,
      },
    );

    if (
      response.status === 401 &&
      !skipAuthRefresh &&
      (getApiSession().accessToken || getApiSession().refreshToken)
    ) {
      const refreshedToken = await attemptTokenRefresh(resolvedBaseUrl);

      if (refreshedToken && refreshedToken !== token) {
        return request<TResponse>(path, {
          ...options,
          token: refreshedToken,
          skipAuthRefresh: true,
        });
      }
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(data, `Request failed with status ${response.status}`),
        response.status,
        data,
        getValidationErrors(data),
      );
    }

    return data as TResponse;
  }

  return {
    request,
    get<TResponse>(
      path: string,
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) {
      return request<TResponse>(path, { ...options, method: "GET" });
    },
    post<TResponse>(
      path: string,
      body?: ApiRequestOptions["body"],
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) {
      return request<TResponse>(path, { ...options, method: "POST", body });
    },
    put<TResponse>(
      path: string,
      body?: ApiRequestOptions["body"],
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) {
      return request<TResponse>(path, { ...options, method: "PUT", body });
    },
    patch<TResponse>(
      path: string,
      body?: ApiRequestOptions["body"],
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) {
      return request<TResponse>(path, { ...options, method: "PATCH", body });
    },
    delete<TResponse>(
      path: string,
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) {
      return request<TResponse>(path, { ...options, method: "DELETE" });
    },
  };
}

export const apiClient = createApiClient();
