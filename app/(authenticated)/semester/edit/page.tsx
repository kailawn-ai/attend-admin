"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  QrCode,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { SemesterQrModal } from "@/components/semester/semester-qr-modal";
import { SectionCard, SectionPage } from "@/components/section-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/apiClient";
import { type Course, getCourses } from "@/lib/api/course-service";
import {
  type Semester,
  deleteSemester,
  listSemesters,
  updateSemester,
} from "@/lib/api/semester-service";

type SemesterForm = {
  course_id: string;
  title: string;
  description: string;
  semester_number: string;
  geofence_latitude: string;
  geofence_longitude: string;
  geofence_radius_meters: string;
  is_active: boolean;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

function getSemesterForm(semester: Semester): SemesterForm {
  return {
    course_id: semester.course_id.toString(),
    title: semester.title,
    description: semester.description ?? "",
    semester_number: semester.semester_number.toString(),
    geofence_latitude: semester.geofence_latitude?.toString() ?? "",
    geofence_longitude: semester.geofence_longitude?.toString() ?? "",
    geofence_radius_meters: semester.geofence_radius_meters?.toString() ?? "",
    is_active: Boolean(semester.is_active),
  };
}

function getFirstFieldMessage(errors: Record<string, string>) {
  return Object.values(errors)[0] ?? "Unable to update semester.";
}

export default function EditSemesterPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [form, setForm] = useState<SemesterForm>({
    course_id: "",
    title: "",
    description: "",
    semester_number: "1",
    geofence_latitude: "",
    geofence_longitude: "",
    geofence_radius_meters: "100",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [totalSemesters, setTotalSemesters] = useState(0);
  const [showingFrom, setShowingFrom] = useState(0);
  const [showingTo, setShowingTo] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [qrSemester, setQrSemester] = useState<Semester | null>(null);

  const loadSemesters = useCallback(async () => {
    const response = await listSemesters({
      search: searchQuery.trim() || undefined,
      page,
      per_page: pageSize,
    });

    setSemesters(response.data.data);
    setTotalSemesters(response.data.total);
    setShowingFrom(response.data.from ?? 0);
    setShowingTo(response.data.to ?? 0);

    if (response.data.current_page !== page) {
      setPage(response.data.current_page);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [coursesResponse, semestersResponse] = await Promise.all([
          getCourses(),
          listSemesters({
            search: searchQuery.trim() || undefined,
            page,
            per_page: pageSize,
          }),
        ]);

        if (isMounted) {
          setCourses(coursesResponse.data);
          setSemesters(semestersResponse.data.data);
          setTotalSemesters(semestersResponse.data.total);
          setShowingFrom(semestersResponse.data.from ?? 0);
          setShowingTo(semestersResponse.data.to ?? 0);

          if (semestersResponse.data.current_page !== page) {
            setPage(semestersResponse.data.current_page);
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load semesters right now.",
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
  }, [page, pageSize, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalSemesters / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleSemesters = semesters;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const semesterStats = useMemo(
    () => [
      {
        label: "Semesters",
        value: isLoading ? "--" : String(totalSemesters).padStart(2, "0"),
        hint: "Loaded from GET /semesters",
      },
      {
        label: "Visible",
        value: isLoading ? "--" : String(semesters.length).padStart(2, "0"),
        hint: "Rows on this page",
      },
      {
        label: "Active",
        value: isLoading
          ? "--"
          : String(semesters.filter((semester) => semester.is_active).length).padStart(2, "0"),
        hint: "Active rows on this page",
      },
      {
        label: "Page",
        value: `${currentPage}/${totalPages}`,
        hint: `${pageSize} rows per page`,
      },
    ],
    [currentPage, isLoading, pageSize, semesters, totalPages, totalSemesters],
  );

  function updateForm(key: keyof SemesterForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    const latitude = Number(form.geofence_latitude);
    const longitude = Number(form.geofence_longitude);

    if (!form.course_id) {
      nextErrors.course_id = "Course is required.";
    }

    if (!form.title.trim()) {
      nextErrors.title = "Semester title is required.";
    }

    if (!Number.isFinite(Number(form.semester_number)) || Number(form.semester_number) < 1) {
      nextErrors.semester_number = "Semester number must be at least 1.";
    }

    if (
      !form.geofence_latitude.trim() ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      nextErrors.geofence_latitude = "Latitude must be between -90 and 90.";
    }

    if (
      !form.geofence_longitude.trim() ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      nextErrors.geofence_longitude = "Longitude must be between -180 and 180.";
    }

    if (
      !Number.isFinite(Number(form.geofence_radius_meters)) ||
      Number(form.geofence_radius_meters) < 5
    ) {
      nextErrors.geofence_radius_meters = "Radius must be at least 5 meters.";
    }

    return nextErrors;
  }

  function handleEdit(semester: Semester) {
    setSelectedSemester(semester);
    setForm(getSemesterForm(semester));
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteId(null);
  }

  function handleOpenQrModal(semester: Semester) {
    if (!semester.static_qr_token) {
      return;
    }

    setQrSemester(semester);
    setErrorMessage("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSemester || isSaving) {
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

      const response = await updateSemester(selectedSemester.id, {
        course_id: Number(form.course_id),
        title: form.title.trim(),
        description: form.description.trim() || null,
        semester_number: Number(form.semester_number),
        geofence_latitude: Number(form.geofence_latitude),
        geofence_longitude: Number(form.geofence_longitude),
        geofence_radius_meters: Number(form.geofence_radius_meters),
        is_active: form.is_active,
      });

      setSemesters((current) =>
        current.map((semester) =>
          semester.id === response.data.id ? response.data : semester,
        ),
      );
      setSelectedSemester(response.data);
      setForm(getSemesterForm(response.data));
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
        setErrorMessage("Unable to update semester right now.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(semester: Semester) {
    if (deletingId !== null) {
      return;
    }

    if (confirmDeleteId !== semester.id) {
      setConfirmDeleteId(semester.id);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    try {
      setDeletingId(semester.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await deleteSemester(semester.id);

      setSemesters((current) =>
        current.filter((item) => item.id !== semester.id),
      );
      setConfirmDeleteId(null);
      setSuccessMessage(response.message);
      setTotalSemesters((current) => Math.max(0, current - 1));

      if (selectedSemester?.id === semester.id) {
        setSelectedSemester(null);
      }

      if (semesters.length === 1 && currentPage > 1) {
        setPage((value) => Math.max(1, value - 1));
      } else {
        void loadSemesters().catch(() => undefined);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to delete semester right now.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <SectionPage
      eyebrow="Semester"
      title="Edit semester settings"
      description="Search semester records, update term details, and remove stale entries using the current Laravel semester endpoints."
      stats={semesterStats}
    >
      <SemesterQrModal
        open={qrSemester !== null}
        semester={qrSemester}
        onOpenChange={(open) => {
          if (!open) {
            setQrSemester(null);
          }
        }}
        onError={setErrorMessage}
      />

      <SectionCard
        title="Semester list"
        description="Fetched from GET /semesters with backend search and pagination."
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, description, or course"
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
                    <th className="px-4 py-3 font-semibold">Semester</th>
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 font-semibold">Geofence</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Token</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <LoaderCircle className="size-4 animate-spin" />
                          Loading semesters...
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && visibleSemesters.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No semesters found.
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading
                    ? visibleSemesters.map((semester) => (
                        <tr
                          key={semester.id}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {semester.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                ID #{semester.id} - Semester{" "}
                                {semester.semester_number}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {semester.course?.title ?? `Course #${semester.course_id}`}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            <p>
                              {semester.geofence_latitude ?? "--"},{" "}
                              {semester.geofence_longitude ?? "--"}
                            </p>
                            <p className="mt-1 text-xs">
                              Radius {semester.geofence_radius_meters ?? "--"} m
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                semester.is_active
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {semester.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="block max-w-[220px] truncate font-mono text-xs">
                                {semester.static_qr_token ?? "--"}
                              </span>
                              {semester.static_qr_token ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenQrModal(semester)}
                                  className="inline-flex size-7 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition hover:text-foreground"
                                  aria-label={`Open QR code for ${semester.title}`}
                                  title="Open QR code"
                                >
                                  <QrCode className="size-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => handleEdit(semester)}
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                                disabled={deletingId === semester.id}
                                onClick={() => void handleDelete(semester)}
                              >
                                {deletingId === semester.id ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                                {confirmDeleteId === semester.id
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
              Showing {showingFrom}-{showingTo} of {totalSemesters}
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
        title={selectedSemester ? "Edit selected semester" : "Select a semester"}
        description={
          selectedSemester
            ? "Changes save through PUT /semesters/{id}."
            : "Use the edit button on any row to load its details here."
        }
      >
        {selectedSemester ? (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {selectedSemester.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Semester ID #{selectedSemester.id}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl"
                onClick={() => {
                  setSelectedSemester(null);
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
                htmlFor="edit-semester-course"
                className="text-sm font-medium text-foreground"
              >
                Course
              </label>
              <select
                id="edit-semester-course"
                value={form.course_id}
                onChange={(event) => updateForm("course_id", event.target.value)}
                aria-invalid={Boolean(fieldErrors.course_id)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
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

            <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
              <div className="space-y-2">
                <label
                  htmlFor="edit-semester-title"
                  className="text-sm font-medium text-foreground"
                >
                  Semester title
                </label>
                <Input
                  id="edit-semester-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
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
                  htmlFor="edit-semester-number"
                  className="text-sm font-medium text-foreground"
                >
                  Number
                </label>
                <Input
                  id="edit-semester-number"
                  type="number"
                  min="1"
                  value={form.semester_number}
                  onChange={(event) =>
                    updateForm("semester_number", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.semester_number)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.semester_number ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.semester_number}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-semester-description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="edit-semester-description"
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                rows={4}
                className="w-full rounded-2xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
              {fieldErrors.description ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="edit-semester-latitude"
                  className="text-sm font-medium text-foreground"
                >
                  Latitude
                </label>
                <Input
                  id="edit-semester-latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={form.geofence_latitude}
                  onChange={(event) =>
                    updateForm("geofence_latitude", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.geofence_latitude)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.geofence_latitude ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.geofence_latitude}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-semester-longitude"
                  className="text-sm font-medium text-foreground"
                >
                  Longitude
                </label>
                <Input
                  id="edit-semester-longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={form.geofence_longitude}
                  onChange={(event) =>
                    updateForm("geofence_longitude", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.geofence_longitude)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.geofence_longitude ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.geofence_longitude}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-semester-radius"
                  className="text-sm font-medium text-foreground"
                >
                  Radius meters
                </label>
                <Input
                  id="edit-semester-radius"
                  type="number"
                  min="5"
                  max="5000"
                  value={form.geofence_radius_meters}
                  onChange={(event) =>
                    updateForm("geofence_radius_meters", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.geofence_radius_meters)}
                  className="h-11 rounded-2xl bg-background"
                />
                {fieldErrors.geofence_radius_meters ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.geofence_radius_meters}
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
                onClick={() => setForm(getSemesterForm(selectedSemester))}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
            No semester selected.
          </div>
        )}
      </SectionCard>
    </SectionPage>
  );
}
