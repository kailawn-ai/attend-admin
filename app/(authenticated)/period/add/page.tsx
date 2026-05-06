"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, PlusCircle } from "lucide-react";
import { SectionCard, SectionPage } from "@/components/section-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/apiClient";
import { type Course, getCourses } from "@/lib/api/course-service";
import { type Semester, getSemesters } from "@/lib/api/semester-service";
import {
  type PeriodRecord,
  createPeriod,
  getPeriods,
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

const INITIAL_FORM: PeriodForm = {
  name: "",
  start_time: "",
  end_time: "",
  scan_window_minutes: "5",
  course_id: "",
  semester_id: "",
  is_active: true,
};

function getFirstFieldMessage(errors: Record<string, string>) {
  return Object.values(errors)[0] ?? "Unable to create period.";
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function AddPeriodPage() {
  const [form, setForm] = useState<PeriodForm>(INITIAL_FORM);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
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
            : "Unable to load period setup data right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSemesters = useMemo(() => {
    if (!form.course_id) {
      return semesters;
    }

    return semesters.filter(
      (semester) => semester.course_id === Number(form.course_id),
    );
  }, [form.course_id, semesters]);

  const periodStats = useMemo(
    () => [
      {
        label: "Saved Periods",
        value: isLoadingData ? "--" : String(periods.length).padStart(2, "0"),
        hint: "Fetched from the period service",
      },
      {
        label: "Courses",
        value: isLoadingData ? "--" : String(courses.length).padStart(2, "0"),
        hint: "Optional course links",
      },
      {
        label: "Semesters",
        value: isLoadingData ? "--" : String(semesters.length).padStart(2, "0"),
        hint: "Optional semester context",
      },
      {
        label: "API Route",
        value: "POST",
        hint: "/periods",
      },
    ],
    [courses.length, isLoadingData, periods.length, semesters.length],
  );

  function updateForm(key: keyof PeriodForm, value: string | boolean) {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage(getFirstFieldMessage(validationErrors));
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFieldErrors({});

      const response = await createPeriod({
        name: form.name.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        scan_window_minutes: Number(form.scan_window_minutes),
        course_id: form.course_id ? Number(form.course_id) : null,
        semester_id: form.semester_id ? Number(form.semester_id) : null,
        is_active: form.is_active,
      });

      setPeriods((current) => [response.data, ...current]);
      setForm({
        ...INITIAL_FORM,
        course_id: form.course_id,
        semester_id: form.semester_id,
      });
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
        setErrorMessage("Unable to create period right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionPage
      eyebrow="Period"
      title="Add a new period"
      description="This screen uses the real period service. The backend expects a name, start and end time, optional scan window, optional course or semester context, and active status."
      stats={periodStats}
    >
      <SectionCard
        title="Period setup form"
        description="Wired to `createPeriod()` and aligned to the current Laravel period validation."
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="period-name"
              className="text-sm font-medium text-foreground"
            >
              Period name
            </label>
            <Input
              id="period-name"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Period 1"
              aria-invalid={Boolean(fieldErrors.name)}
              className="h-11 rounded-2xl bg-background"
            />
            {fieldErrors.name ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Required. Use the label shown in timetables and scan windows.
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                htmlFor="period-start-time"
                className="text-sm font-medium text-foreground"
              >
                Start time
              </label>
              <Input
                id="period-start-time"
                type="time"
                value={form.start_time}
                onChange={(event) =>
                  updateForm("start_time", event.target.value)
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
                htmlFor="period-end-time"
                className="text-sm font-medium text-foreground"
              >
                End time
              </label>
              <Input
                id="period-end-time"
                type="time"
                value={form.end_time}
                onChange={(event) => updateForm("end_time", event.target.value)}
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
                htmlFor="period-scan-window"
                className="text-sm font-medium text-foreground"
              >
                Scan window
              </label>
              <Input
                id="period-scan-window"
                type="number"
                min="1"
                max="60"
                value={form.scan_window_minutes}
                onChange={(event) =>
                  updateForm("scan_window_minutes", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.scan_window_minutes)}
                className="h-11 rounded-2xl bg-background"
              />
              {fieldErrors.scan_window_minutes ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.scan_window_minutes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Minutes after start time. Backend default is 5.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="period-course"
                className="text-sm font-medium text-foreground"
              >
                Course
              </label>
              <select
                id="period-course"
                value={form.course_id}
                onChange={(event) =>
                  updateForm("course_id", event.target.value)
                }
                disabled={isLoadingData}
                aria-invalid={Boolean(fieldErrors.course_id)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/30"
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  Optional. Link the period to a course when it is course-specific.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="period-semester"
                className="text-sm font-medium text-foreground"
              >
                Semester
              </label>
              <select
                id="period-semester"
                value={form.semester_id}
                onChange={(event) =>
                  updateForm("semester_id", event.target.value)
                }
                disabled={isLoadingData || filteredSemesters.length === 0}
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  Optional. Choosing a course narrows this list.
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active now</p>
              <p className="text-sm text-muted-foreground">
                Sends `is_active` to the period service.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateForm("is_active", !form.is_active)}
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

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              size="lg"
              className="rounded-2xl bg-blue-600 px-5 text-white hover:bg-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving period...
                </>
              ) : (
                <>
                  <PlusCircle className="size-4" />
                  Create period
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-2xl px-5"
              disabled={isSubmitting}
              onClick={() => {
                setForm(INITIAL_FORM);
                setFieldErrors({});
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Reset form
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Backend readback"
        description="A quick view of what the current backend and service are doing."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>
              `PeriodController@store` validates `name`, `start_time`,
              `end_time`, optional `scan_window_minutes`, optional `course_id`,
              optional `semester_id`, and `is_active`.
            </p>
            <p className="mt-2">
              The period service posts to `/periods` and reads existing periods
              with `getPeriods()`.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Recent periods
                </p>
                <p className="text-sm text-muted-foreground">
                  Loaded with `getPeriods()`
                </p>
              </div>
              {isLoadingData ? (
                <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>

            <div className="space-y-2">
              {periods.slice(0, 5).map((period) => (
                <div
                  key={period.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {period.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatTime(period.start_time)} -{" "}
                        {formatTime(period.end_time)} -{" "}
                        {period.course?.title ?? "No course loaded"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        period.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {period.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}

              {!isLoadingData && periods.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  No periods found yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
