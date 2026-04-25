import { apiClient } from "@/lib/api/apiClient";
import { extractAuthSession, extractSessionUser } from "@/lib/api/auth-session";
import type { User } from "@/lib/api/user-service";

export type SessionUser = User;

export type SessionResponse<TData> = {
  success: boolean;
  message: string;
  data: TData;
  errors?: Record<string, string[]> | null;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: string | number;
};

export type LoginPayload = {
  password: string;
  remember?: boolean;
  email?: string;
  login?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  student_id?: string | null;
  phone?: string | null;
  roll_no?: string | null;
  role?: string | null;
  course_id?: number | null;
  semester_id?: number | null;
  is_active?: boolean;
  remember?: boolean;
};

export type LogoutResponse = SessionResponse<null>;
export type MeResponse = SessionResponse<SessionUser>;
export type LoginResponse = SessionResponse<SessionUser>;
export type RegisterResponse = SessionResponse<SessionUser>;

const sessionRequestOptions = {
  credentials: "include" as const,
};

export const sessionService = {
  me() {
    return apiClient.get<MeResponse>("/me", sessionRequestOptions);
  },

  login(payload: LoginPayload) {
    return apiClient.post<LoginResponse>(
      "/login",
      payload,
      sessionRequestOptions,
    );
  },

  register(payload: RegisterPayload) {
    return apiClient.post<RegisterResponse>(
      "/register",
      payload,
      sessionRequestOptions,
    );
  },

  logout() {
    return apiClient.post<LogoutResponse>("/logout", null, sessionRequestOptions);
  },
};

export const { me, login, register, logout } = sessionService;

export function getSessionUserFromResponse(payload: unknown) {
  return extractSessionUser<SessionUser>(payload);
}

export { extractAuthSession };
