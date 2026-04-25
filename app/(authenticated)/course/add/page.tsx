"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, PlusCircle } from "lucide-react";
import { SectionCard, SectionPage } from "@/components/section-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/apiClient";
import { type Course, createCourse, getCourses } from "@/lib/api/course-service";

type CourseForm = {
  title: string;
  description: string;
  is_active: boolean;
};

const INITIAL_FORM: CourseForm = {
  title: "",
  description: "",
  is_active: true,
};

export default function AddCoursePage() {
  const [form, setForm] = useState<CourseForm>(INITIAL_FORM);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        const response = await getCourses();

        if (isMounted) {
          setCourses(response.data);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load existing courses right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    }

    void loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const courseStats = useMemo(
    () => [
      {
        label: "Saved Courses",
        value: isLoadingCourses ? "--" : String(courses.length).padStart(2, "0"),
        hint: "Fetched from the course service",
      },
      {
        label: "Required Fields",
        value: "01",
        hint: "Backend requires the course title",
      },
      {
        label: "Optional Fields",
        value: "02",
        hint: "Description and active status are supported",
      },
      {
        label: "API Route",
        value: "POST",
        hint: "/courses",
      },
    ],
    [courses.length, isLoadingCourses],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!form.title.trim()) {
      setFieldErrors({ title: "Course title is required." });
      setErrorMessage("Course title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFieldErrors({});

      const response = await createCourse({
        title: form.title.trim(),
        description: form.description.trim() || null,
        is_active: form.is_active,
      });

      setCourses((current) => [response.data, ...current]);
      setForm(INITIAL_FORM);
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
          Object.values(nextFieldErrors)[0] ?? error.message ?? "Unable to create course.",
        );
      } else {
        setErrorMessage("Unable to create course right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionPage
      eyebrow="Course"
      title="Add a new course"
      description="This screen now uses the real course service. The backend currently expects `title`, optional `description`, and optional `is_active` when creating a course."
      stats={courseStats}
    >
      <SectionCard
        title="Course setup form"
        description="Wired to `createCourse()` and aligned to the current Laravel controller and model behavior."
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="course-title"
              className="text-sm font-medium text-foreground"
            >
              Course title
            </label>
            <Input
              id="course-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="B.Sc Computer Science"
              aria-invalid={Boolean(fieldErrors.title)}
              className="h-11 rounded-2xl bg-background"
            />
            {fieldErrors.title ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.title}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Required by the backend controller.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="course-description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="course-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Add a short description for admins and academic staff."
              rows={5}
              className="w-full rounded-2xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
            {fieldErrors.description ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Optional. The backend accepts nullable text here.
              </p>
            )}
          </div>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active now</p>
              <p className="text-sm text-muted-foreground">
                Sends `is_active` to the course service.
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
                  Saving course...
                </>
              ) : (
                <>
                  <PlusCircle className="size-4" />
                  Create course
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
              `CourseController@store` validates `title`, optional `role`,
              `description`, and `is_active`.
            </p>
            <p className="mt-2">
              The `Course` model only marks `title`, `description`,
              `static_qr_token`, and `is_active` as fillable, so `role` is
              currently validated but not persisted.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Recent courses
                </p>
                <p className="text-sm text-muted-foreground">
                  Loaded with `getCourses()`
                </p>
              </div>
              {isLoadingCourses ? (
                <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>

            <div className="space-y-2">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {course.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {course.description?.trim() || "No description provided."}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        course.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {course.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}

              {!isLoadingCourses && courses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  No courses found yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
