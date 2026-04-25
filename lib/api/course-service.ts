import { apiClient } from "@/lib/api/apiClient";

export type Semester = {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  semester_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  semesters?: Semester[];
};

export type SaveCoursePayload = {
  title: string;
  description?: string | null;
  is_active?: boolean;
};

export type UpdateCoursePayload = Partial<SaveCoursePayload>;

export type CourseApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const courseService = {
  getCourses() {
    return apiClient.get<CourseApiResponse<Course[]>>("/courses");
  },

  getCourse(id: number | string) {
    return apiClient.get<CourseApiResponse<Course>>(`/courses/${id}`);
  },

  createCourse(payload: SaveCoursePayload) {
    return apiClient.post<CourseApiResponse<Course>>("/courses", payload);
  },

  updateCourse(id: number | string, payload: UpdateCoursePayload) {
    return apiClient.put<CourseApiResponse<Course>>(`/courses/${id}`, payload);
  },

  deleteCourse(id: number | string) {
    return apiClient.delete<CourseApiResponse<null>>(`/courses/${id}`);
  },
};

export const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = courseService;
