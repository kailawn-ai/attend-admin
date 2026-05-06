"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { SectionCard, SectionPage } from "@/components/section-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/apiClient";
import {
  type Course,
  deleteCourse,
  listCourses,
  updateCourse,
} from "@/lib/api/course-service";

type CourseForm = {
  title: string;
  description: string;
  is_active: boolean;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

function getCourseForm(course: Course): CourseForm {
  return {
    title: course.title,
    description: course.description ?? "",
    is_active: Boolean(course.is_active),
  };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function EditCoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [showingFrom, setShowingFrom] = useState(0);
  const [showingTo, setShowingTo] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadCourses = useCallback(async () => {
    const response = await listCourses({
      search: searchQuery.trim() || undefined,
      page,
      per_page: pageSize,
    });

    setCourses(response.data.data);
    setTotalCourses(response.data.total);
    setShowingFrom(response.data.from ?? 0);
    setShowingTo(response.data.to ?? 0);

    if (response.data.current_page !== page) {
      setPage(response.data.current_page);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadPaginatedCourses() {
      try {
        setIsLoading(true);
        const response = await listCourses({
          search: searchQuery.trim() || undefined,
          page,
          per_page: pageSize,
        });

        if (isMounted) {
          setCourses(response.data.data);
          setTotalCourses(response.data.total);
          setShowingFrom(response.data.from ?? 0);
          setShowingTo(response.data.to ?? 0);

          if (response.data.current_page !== page) {
            setPage(response.data.current_page);
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load courses right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPaginatedCourses();

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalCourses / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleCourses = courses;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const courseStats = useMemo(
    () => [
      {
        label: "Courses",
        value: isLoading ? "--" : String(totalCourses).padStart(2, "0"),
        hint: "Loaded from GET /courses",
      },
      {
        label: "Visible",
        value: isLoading ? "--" : String(courses.length).padStart(2, "0"),
        hint: "Rows on this page",
      },
      {
        label: "Active",
        value: isLoading
          ? "--"
          : String(courses.filter((course) => course.is_active).length).padStart(2, "0"),
        hint: "Active rows on this page",
      },
      {
        label: "Page",
        value: `${currentPage}/${totalPages}`,
        hint: `${pageSize} rows per page`,
      },
    ],
    [courses, currentPage, isLoading, pageSize, totalCourses, totalPages],
  );

  function handleEdit(course: Course) {
    setSelectedCourse(course);
    setForm(getCourseForm(course));
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteId(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCourse || isSaving) {
      return;
    }

    if (!form.title.trim()) {
      setFieldErrors({ title: "Course title is required." });
      setErrorMessage("Course title is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFieldErrors({});

      const response = await updateCourse(selectedCourse.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        is_active: form.is_active,
      });

      setCourses((current) =>
        current.map((course) =>
          course.id === response.data.id ? response.data : course,
        ),
      );
      setSelectedCourse(response.data);
      setForm(getCourseForm(response.data));
      setSuccessMessage(response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        const nextFieldErrors = Object.fromEntries(
          Object.entries(error.errors ?? {}).map(([key, messages]) => [
            key,
            messages[0] ?? "Invalid value.",
          ]),
        );

        setFieldErrors(nextFieldErrors);
        setErrorMessage(
          Object.values(nextFieldErrors)[0] ??
            error.message ??
            "Unable to update course.",
        );
      } else {
        setErrorMessage("Unable to update course right now.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(course: Course) {
    if (deletingId !== null) {
      return;
    }

    if (confirmDeleteId !== course.id) {
      setConfirmDeleteId(course.id);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    try {
      setDeletingId(course.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await deleteCourse(course.id);

      setCourses((current) => current.filter((item) => item.id !== course.id));
      setConfirmDeleteId(null);
      setSuccessMessage(response.message);
      setTotalCourses((current) => Math.max(0, current - 1));

      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
      }

      if (courses.length === 1 && currentPage > 1) {
        setPage((value) => Math.max(1, value - 1));
      } else {
        void loadCourses().catch(() => undefined);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to delete course right now.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <SectionPage
      eyebrow="Course"
      title="Edit existing courses"
      description="Search the course catalog, update records, and remove stale courses using the current Laravel course endpoints."
      stats={courseStats}
    >
      <SectionCard
        title="Course list"
        description="Fetched from GET /courses with backend search and pagination."
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title or description"
                className="h-11 rounded-2xl bg-background pl-9"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as typeof pageSize)
                }
                className="h-10 rounded-2xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <LoaderCircle className="size-4 animate-spin" />
                          Loading courses...
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && visibleCourses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No courses found.
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading
                    ? visibleCourses.map((course) => (
                        <tr
                          key={course.id}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {course.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                ID #{course.id}
                              </p>
                            </div>
                          </td>
                          <td className="max-w-xs px-4 py-4">
                            <p className="line-clamp-2 text-muted-foreground">
                              {course.description?.trim() ||
                                "No description provided."}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                course.is_active
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {course.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(course.updated_at)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => handleEdit(course)}
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                                disabled={deletingId === course.id}
                                onClick={() => void handleDelete(course)}
                              >
                                {deletingId === course.id ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                                {confirmDeleteId === course.id
                                  ? "Confirm"
                                  : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {showingFrom}-{showingTo} of {totalCourses}
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <span className="rounded-xl border border-border/70 bg-background px-3 py-1.5 text-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={selectedCourse ? "Edit selected course" : "Select a course"}
        description={
          selectedCourse
            ? "Changes save through PUT /courses/{id}."
            : "Use the edit button on any row to load its details here."
        }
      >
        {selectedCourse ? (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {selectedCourse.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Course ID #{selectedCourse.id}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl"
                onClick={() => {
                  setSelectedCourse(null);
                  setFieldErrors({});
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                aria-label="Close editor"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-course-title"
                className="text-sm font-medium text-foreground"
              >
                Course title
              </label>
              <Input
                id="edit-course-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                aria-invalid={Boolean(fieldErrors.title)}
                className="h-11 rounded-2xl bg-background"
              />
              {fieldErrors.title ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-course-description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="edit-course-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={5}
                className="w-full rounded-2xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
              {fieldErrors.description ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.description}
                </p>
              ) : null}
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-sm text-muted-foreground">
                  Sends `is_active` to the backend.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    is_active: !current.is_active,
                  }))
                }
                aria-pressed={form.is_active}
                className={`relative h-7 w-12 rounded-full transition ${
                  form.is_active
                    ? "bg-blue-200 dark:bg-blue-500/60"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    form.is_active ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                size="lg"
                className="rounded-2xl bg-blue-600 px-5 text-white hover:bg-blue-500"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Save changes
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-2xl px-5"
                disabled={isSaving}
                onClick={() => setForm(getCourseForm(selectedCourse))}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
            No course selected.
          </div>
        )}
      </SectionCard>
    </SectionPage>
  );
}
