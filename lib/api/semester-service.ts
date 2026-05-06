import type { Course } from "@/lib/api/course-service";
import { apiClient } from "@/lib/api/apiClient";

export const SEMESTER_API_ROUTES = {
  semesters: "/semesters",
  semesterById: (id: number | string) => `/semesters/${id}`,
  semesterQr: (id: number | string) => `/semesters/${id}/qr`,
} as const;

export type Semester = {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  semester_number: number;
  geofence_latitude: number | null;
  geofence_longitude: number | null;
  geofence_radius_meters: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course | null;
};

export type SaveSemesterPayload = {
  course_id: number;
  title: string;
  description?: string | null;
  semester_number: number;
  geofence_latitude: number;
  geofence_longitude: number;
  geofence_radius_meters: number;
  is_active?: boolean;
};

export type UpdateSemesterPayload = Partial<SaveSemesterPayload>;

export type SemesterQrData = {
  semester_id: number;
  title: string;
  token: string;
  geofence_latitude: number | null;
  geofence_longitude: number | null;
  geofence_radius_meters: number | null;
  qr_image_url: string;
};

export type SemesterApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData;
  errors?: Record<string, string[]> | null;
};

export type PaginatedSemesterResponse = {
  current_page: number;
  data: Semester[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type SemesterListParams = {
  search?: string;
  page?: number;
  per_page?: number;
};

export type SemesterMutationResponse = SemesterApiResponse<Semester>;

export type SemesterDeleteResponse = SemesterApiResponse<null>;

const sessionRequestOptions = {
  credentials: "include" as const,
};

export const semesterService = {
  getSemesters() {
    return apiClient.get<SemesterApiResponse<Semester[]>>(
      SEMESTER_API_ROUTES.semesters,
      sessionRequestOptions,
    );
  },

  listSemesters(params: SemesterListParams = {}) {
    return apiClient.get<SemesterApiResponse<PaginatedSemesterResponse>>(
      SEMESTER_API_ROUTES.semesters,
      {
        ...sessionRequestOptions,
        query: {
          search: params.search,
          page: params.page,
          per_page: params.per_page,
        },
      },
    );
  },

  getSemester(id: number | string) {
    return apiClient.get<SemesterApiResponse<Semester>>(
      SEMESTER_API_ROUTES.semesterById(id),
      sessionRequestOptions,
    );
  },

  getSemesterQr(id: number | string) {
    return apiClient.get<SemesterApiResponse<SemesterQrData>>(
      SEMESTER_API_ROUTES.semesterQr(id),
      sessionRequestOptions,
    );
  },

  createSemester(payload: SaveSemesterPayload) {
    return apiClient.post<SemesterMutationResponse>(
      SEMESTER_API_ROUTES.semesters,
      payload,
      sessionRequestOptions,
    );
  },

  updateSemester(id: number | string, payload: UpdateSemesterPayload) {
    return apiClient.put<SemesterMutationResponse>(
      SEMESTER_API_ROUTES.semesterById(id),
      payload,
      sessionRequestOptions,
    );
  },

  deleteSemester(id: number | string) {
    return apiClient.delete<SemesterDeleteResponse>(
      SEMESTER_API_ROUTES.semesterById(id),
      sessionRequestOptions,
    );
  },
};

export const {
  getSemesters,
  listSemesters,
  getSemester,
  getSemesterQr,
  createSemester,
  updateSemester,
  deleteSemester,
} = semesterService;
