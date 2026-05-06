"use client";

import { useEffect, useMemo, useState } from "react";
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
import { type Course, getCourses } from "@/lib/api/course-service";
import { type Semester, getSemesters } from "@/lib/api/semester-service";
import {
  type PeriodRecord,
  deletePeriod,
  getPeriods,
  updatePeriod,
} from "@/lib/api/period-service";

type PeriodForm = {
  name: string;
  start_time: string;
  end_time: string;
  scan_window_minutes: string;
  course_id: string;
  semester_id: string;
  is_active: boolean;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

function getPeriodForm(period: PeriodRecord): PeriodForm {
  return {
    name: period.name,
    start_time: formatTimeInput(period.start_time),
    end_time: formatTimeInput(period.end_time),
    scan_window_minutes: (period.scan_window_minutes ?? 5).toString(),
    course_id: period.course_id?.toString() ?? "",
    semester_id: period.semester_id?.toString() ?? "",
    is_active: Boolean(period.is_active),
  };
}

function formatTimeInput(value: string) {
  return value.slice(0, 5);
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

function getFirstFieldMessage(errors: Record<string, string>) {
  return Object.values(errors)[0] ?? "Unable to update period.";
}

function getPeriodSearchText(period: PeriodRecord) {
  return [
    period.name,
    period.start_time,
    period.end_time,
    period.course?.title,
    period.semester?.title,
    period.course_id ? `course ${period.course_id}` : "",
    period.semester_id ? `semester ${period.semester_id}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function EditPeriodPage() {
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodRecord | null>(null);
  const [form, setForm] = useState<PeriodForm>({
    name: "",
    start_time: "",
    end_time: "",
    scan_window_minutes: "5",
    course_id: "",
    semester_id: "",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [coursesResponse, semestersResponse, periodsResponse] =
          await Promise.all([getCourses(), getSemesters(), getPeriods()]);

        if (isMounted) {
          setCourses(coursesResponse.data);
          setSemesters(semestersResponse.data);
          setPeriods(periodsResponse.data);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load periods right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPeriods = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return periods;
    }

    return periods.filter((period) =>
      getPeriodSearchText(period).includes(query),
    );
  }, [periods, searchQuery]);

  const totalPeriods = filteredPeriods.length;
  const totalPages = Math.max(1, Math.ceil(totalPeriods / pageSize));
  const currentPage = Math.min(page, totalPages);
  const showingFrom =
    totalPeriods === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalPeriods);
  const visiblePeriods = filteredPeriods.slice(showingFrom - 1, showingTo);

  const filteredSemesters = useMemo(() => {
    if (!form.course_id) {
      return semesters;
    }

    return semesters.filter(
      (semester) => semester.course_id === Number(form.course_id),
    );
  }, [form.course_id, semesters]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const periodStats = useMemo(
    () => [
      {
        label: "Periods",
        value: isLoading ? "--" : String(periods.length).padStart(2, "0"),
        hint: "Loaded from GET /periods",
      },
      {
        label: "Visible",
        value: isLoading ? "--" : String(visiblePeriods.length).padStart(2, "0"),
        hint: "Rows on this page",
      },
      {
        label: "Active",
        value: isLoading
          ? "--"
          : String(filteredPeriods.filter((period) => period.is_active).length).padStart(2, "0"),
        hint: "Active rows in this view",
      },
      {
        label: "Page",
        value: `${currentPage}/${totalPages}`,
        hint: `${pageSize} rows per page`,
      },
    ],
    [
      currentPage,
      filteredPeriods,
      isLoading,
      pageSize,
      periods.length,
      totalPages,
      visiblePeriods.length,
    ],
  );

  function updateFormValue(key: keyof PeriodForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "course_id" ? { semester_id: "" } : {}),
    }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    const scanWindowMinutes = Number(form.scan_window_minutes);

    if (!form.name.trim()) {
      nextErrors.name = "Period name is required.";
    }

    if (!form.start_time) {
      nextErrors.start_time = "Start time is required.";
    }

    if (!form.end_time) {
      nextErrors.end_time = "End time is required.";
    }

    if (form.start_time && form.end_time && form.end_time <= form.start_time) {
      nextErrors.end_time = "End time must be after start time.";
    }

    if (
      !Number.isInteger(scanWindowMinutes) ||
      scanWindowMinutes < 1 ||
      scanWindowMinutes > 60
    ) {
      nextErrors.scan_window_minutes =
        "Scan window must be between 1 and 60 minutes.";
    }

    return nextErrors;
  }

  function handleEdit(period: PeriodRecord) {
    setSelectedPeriod(period);
    setForm(getPeriodForm(period));
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteId(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPeriod || isSaving) {
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage(getFirstFieldMessage(validationErrors));
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFieldErrors({});

      const response = await updatePeriod(selectedPeriod.id, {
        name: form.name.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        scan_window_minutes: Number(form.scan_window_minutes),
        course_id: form.course_id ? Number(form.course_id) : null,
        semester_id: form.semester_id ? Number(form.semester_id) : null,
        is_active: form.is_active,
      });

      setPeriods((current) =>
        current.map((period) =>
          period.id === response.data.id ? response.data : period,
        ),
      );
      setSelectedPeriod(response.data);
      setForm(getPeriodForm(response.data));
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
        setErrorMessage(getFirstFieldMessage(nextFieldErrors) || error.message);
      } else {
        setErrorMessage("Unable to update period right now.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(period: PeriodRecord) {
    if (deletingId !== null) {
      return;
    }

    if (confirmDeleteId !== period.id) {
      setConfirmDeleteId(period.id);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    try {
      setDeletingId(period.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await deletePeriod(period.id);

      setPeriods((current) => current.filter((item) => item.id !== period.id));
      setConfirmDeleteId(null);
      setSuccessMessage(response.message);

      if (selectedPeriod?.id === period.id) {
        setSelectedPeriod(null);
      }

      if (visiblePeriods.length === 1 && currentPage > 1) {
        setPage((value) => Math.max(1, value - 1));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to delete period right now.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <SectionPage
      eyebrow="Period"
      title="Edit period settings"
      description="Search period records, update timetable windows, and remove stale periods using the current Laravel period endpoints."
      stats={periodStats}
    >
      <SectionCard
        title="Period list"
        description="Fetched from GET /periods with client-side search and pagination."
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, time, course, or semester"
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
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Context</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <LoaderCircle className="size-4 animate-spin" />
                          Loading periods...
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && visiblePeriods.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No periods found.
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading
                    ? visiblePeriods.map((period) => (
                        <tr
                          key={period.id}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {period.name}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                ID #{period.id}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            <p>
                              {formatTimeInput(period.start_time)} -{" "}
                              {formatTimeInput(period.end_time)}
                            </p>
                            <p className="mt-1 text-xs">
                              Scan window {period.scan_window_minutes ?? 5} min
                            </p>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            <p>
                              {period.course?.title ??
                                (period.course_id
                                  ? `Course #${period.course_id}`
                                  : "No course")}
                            </p>
                            <p className="mt-1 text-xs">
                              {period.semester?.title ??
                                (period.semester_id
                                  ? `Semester #${period.semester_id}`
                                  : "No semester")}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                period.is_active
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {period.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(period.updated_at)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => handleEdit(period)}
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                                disabled={deletingId === period.id}
                                onClick={() => void handleDelete(period)}
                              >
                                {deletingId === period.id ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                                {confirmDeleteId === period.id
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
              Showing {showingFrom}-{showingTo} of {totalPeriods}
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
        title={selectedPeriod ? "Edit selected period" : "Select a period"}
        description={
          selectedPeriod
            ? "Changes save through PUT /periods/{id}."
            : "Use the edit button on any row to load its details here."
        }
      >
        {selectedPeriod ? (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {selectedPeriod.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Period ID #{selectedPeriod.id}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl"
                onClick={() => {
                  setSelectedPeriod(null);
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
                htmlFor="edit-period-name"
                className="text-sm font-medium text-foreground"
              >
                Period name
              </label>
              <Input
                id="edit-period-name"
                value={form.name}
                onChange={(event) =>
                  updateFormValue("name", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.name)}
                className="h-11 rounded-2xl bg-background"
              />
              {fieldErrors.name ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="edit-period-start-time"
                  className="text-sm font-medium text-foreground"
                >
                  Start time
                </label>
                <Input
                  id="edit-period-start-time"
                  type="time"
                  value={form.start_time}
                  onChange={(event) =>
                    updateFormValue("start_time", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.start_time)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.start_time ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.start_time}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-period-end-time"
                  className="text-sm font-medium text-foreground"
                >
                  End time
                </label>
                <Input
                  id="edit-period-end-time"
                  type="time"
                  value={form.end_time}
                  onChange={(event) =>
                    updateFormValue("end_time", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.end_time)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.end_time ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.end_time}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-period-scan-window"
                  className="text-sm font-medium text-foreground"
                >
                  Scan window
                </label>
                <Input
                  id="edit-period-scan-window"
                  type="number"
                  min="1"
                  max="60"
                  value={form.scan_window_minutes}
                  onChange={(event) =>
                    updateFormValue("scan_window_minutes", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.scan_window_minutes)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.scan_window_minutes ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.scan_window_minutes}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="edit-period-course"
                  className="text-sm font-medium text-foreground"
                >
                  Course
                </label>
                <select
                  id="edit-period-course"
                  value={form.course_id}
                  onChange={(event) =>
                    updateFormValue("course_id", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.course_id)}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">No course context</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {fieldErrors.course_id ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.course_id}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-period-semester"
                  className="text-sm font-medium text-foreground"
                >
                  Semester
                </label>
                <select
                  id="edit-period-semester"
                  value={form.semester_id}
                  onChange={(event) =>
                    updateFormValue("semester_id", event.target.value)
                  }
                  disabled={filteredSemesters.length === 0}
                  aria-invalid={Boolean(fieldErrors.semester_id)}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/30"
                >
                  <option value="">No semester context</option>
                  {filteredSemesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.title}
                    </option>
                  ))}
                </select>
                {fieldErrors.semester_id ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.semester_id}
                  </p>
                ) : null}
              </div>
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
                  updateFormValue("is_active", !form.is_active)
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
                onClick={() => setForm(getPeriodForm(selectedPeriod))}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
            No period selected.
          </div>
        )}
      </SectionCard>
    </SectionPage>
  );
}
