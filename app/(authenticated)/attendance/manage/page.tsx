"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { SectionCard, SectionPage } from "@/components/section-page";
import {
  deleteAttendance,
  getAttendances,
  type AttendanceRecord,
  type AttendanceStatus,
  updateAttendance,
} from "@/lib/api/attendance-service";
import { ApiError } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";

type AttendanceForm = {
  status: AttendanceStatus;
  scanned_at: string;
  device_id: string;
  ip_address: string;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusTone(status: AttendanceRecord["status"]) {
  if (status === "present") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }

  if (status === "late") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  }

  return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
}

function formatDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const offsetMs = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getAttendanceForm(record: AttendanceRecord): AttendanceForm {
  return {
    status: record.status,
    scanned_at: formatDateTimeInput(record.scanned_at),
    device_id: record.device_id ?? "",
    ip_address: record.ip_address ?? "",
  };
}

export default function ManageAttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<AttendanceForm>({
    status: "present",
    scanned_at: "",
    device_id: "",
    ip_address: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAttendances() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getAttendances();

        if (!isMounted) {
          return;
        }

        setAttendances(response.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load attendance records right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAttendances();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateFormValue(key: keyof AttendanceForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleEdit(record: AttendanceRecord) {
    setSelectedAttendance(record);
    setForm(getAttendanceForm(record));
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteId(null);
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.status) {
      nextErrors.status = "Status is required.";
    }

    if (form.ip_address.trim()) {
      const ipPattern =
        /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
      if (!ipPattern.test(form.ip_address.trim())) {
        nextErrors.ip_address = "IP address must be a valid IPv4 value.";
      }
    }

    return nextErrors;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAttendance || isSaving) {
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage(
        Object.values(validationErrors)[0] ?? "Unable to update attendance.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setFieldErrors({});
      setErrorMessage("");
      setSuccessMessage("");

      const response = await updateAttendance(selectedAttendance.id, {
        status: form.status,
        scanned_at: form.scanned_at
          ? new Date(form.scanned_at).toISOString()
          : null,
        device_id: form.device_id.trim() || null,
        ip_address: form.ip_address.trim() || null,
      });

      setAttendances((current) =>
        current.map((record) =>
          record.id === response.data.id
            ? { ...record, ...response.data }
            : record,
        ),
      );
      setSelectedAttendance((current) =>
        current && current.id === response.data.id
          ? { ...current, ...response.data }
          : current,
      );
      setForm(getAttendanceForm({ ...selectedAttendance, ...response.data }));
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
          Object.values(nextFieldErrors)[0] ?? error.message,
        );
      } else {
        setErrorMessage("Unable to update attendance right now.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: AttendanceRecord) {
    if (deletingId !== null) {
      return;
    }

    if (confirmDeleteId !== record.id) {
      setConfirmDeleteId(record.id);
      setErrorMessage("");
      setSuccessMessage("");
      return;
    }

    try {
      setDeletingId(record.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await deleteAttendance(record.id);

      setAttendances((current) =>
        current.filter((item) => item.id !== record.id),
      );
      setConfirmDeleteId(null);
      setSuccessMessage(response.message);

      if (selectedAttendance?.id === record.id) {
        setSelectedAttendance(null);
        setFieldErrors({});
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to delete attendance right now.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => {
    const total = attendances.length;
    const present = attendances.filter((record) => record.status === "present").length;
    const late = attendances.filter((record) => record.status === "late").length;
    const absent = attendances.filter((record) => record.status === "absent").length;

    return [
      {
        label: "Records",
        value: isLoading ? "--" : String(total).padStart(2, "0"),
        hint: "Fetched from GET /attendances",
      },
      {
        label: "Present",
        value: isLoading ? "--" : String(present).padStart(2, "0"),
        hint: "Attendance marked present",
      },
      {
        label: "Late",
        value: isLoading ? "--" : String(late).padStart(2, "0"),
        hint: "Late entries in current dataset",
      },
      {
        label: "Absent",
        value: isLoading ? "--" : String(absent).padStart(2, "0"),
        hint: "Absent records in current dataset",
      },
    ];
  }, [attendances, isLoading]);

  const recentAttendances = useMemo(
    () =>
      [...attendances]
        .sort((left, right) => {
          const leftTime = new Date(left.scanned_at ?? left.created_at).getTime();
          const rightTime = new Date(right.scanned_at ?? right.created_at).getTime();
          return rightTime - leftTime;
        })
        .slice(0, 8),
    [attendances],
  );

  const recordsWithDevice = attendances.filter((record) => record.device_id).length;
  const recordsWithSession = attendances.filter((record) => record.session).length;

  return (
    <SectionPage
      eyebrow="Attendance"
      title="Manage attendance operations"
      description="Review live attendance records, inspect recent scan activity, and use the current attendance service data as an admin control surface."
      stats={stats}
    >
      <SectionCard
        title="Attendance records"
        description="Recent records loaded from `getAttendances()` with session-linked details where available."
      >
        <div className="space-y-4">
          {errorMessage ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-3xl border border-border/70 bg-background">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Session</th>
                    <th className="px-4 py-3 font-semibold">Scanned</th>
                    <th className="px-4 py-3 font-semibold">Device</th>
                    <th className="px-4 py-3 font-semibold">IP</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <LoaderCircle className="size-4 animate-spin" />
                          Loading attendance records...
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && recentAttendances.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No attendance records found.
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading
                    ? recentAttendances.map((record) => (
                        <tr key={record.id} className="transition hover:bg-muted/30">
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusTone(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            User #{record.user_id}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {record.session ? (
                              <div>
                                <p className="font-medium text-foreground">
                                  Session #{record.attendance_session_id}
                                </p>
                                <p className="mt-1 text-xs">
                                  Semester #{record.session.semester_id} • Period #
                                  {record.session.period_id}
                                </p>
                              </div>
                            ) : (
                              `Session #${record.attendance_session_id}`
                            )}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDateTime(record.scanned_at ?? record.created_at)}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {record.device_id ?? "--"}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {record.ip_address ?? "--"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => handleEdit(record)}
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                                disabled={deletingId === record.id}
                                onClick={() => void handleDelete(record)}
                              >
                                {deletingId === record.id ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                                {confirmDeleteId === record.id ? "Confirm" : "Delete"}
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
        </div>
      </SectionCard>

      <SectionCard
        title={selectedAttendance ? "Edit selected attendance" : "Operational checks"}
        description="Quick breakdowns from the same attendance dataset for admin review."
      >
        {successMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {selectedAttendance ? (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  Attendance #{selectedAttendance.id}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  User #{selectedAttendance.user_id} • Session #{selectedAttendance.attendance_session_id}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl"
                onClick={() => {
                  setSelectedAttendance(null);
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
              <label className="text-sm font-medium text-foreground" htmlFor="attendance-status">
                Status
              </label>
              <select
                id="attendance-status"
                value={form.status}
                onChange={(event) =>
                  updateFormValue("status", event.target.value as AttendanceStatus)
                }
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
              {fieldErrors.status ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.status}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="attendance-scanned-at">
                Scanned at
              </label>
              <input
                id="attendance-scanned-at"
                type="datetime-local"
                value={form.scanned_at}
                onChange={(event) => updateFormValue("scanned_at", event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="attendance-device-id">
                Device ID
              </label>
              <input
                id="attendance-device-id"
                value={form.device_id}
                onChange={(event) => updateFormValue("device_id", event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="Device identifier"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="attendance-ip-address">
                IP address
              </label>
              <input
                id="attendance-ip-address"
                value={form.ip_address}
                onChange={(event) => updateFormValue("ip_address", event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="127.0.0.1"
              />
              {fieldErrors.ip_address ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.ip_address}
                </p>
              ) : null}
            </div>

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
                onClick={() => setForm(getAttendanceForm(selectedAttendance))}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Session Coverage
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {isLoading ? "--" : recordsWithSession}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Records that include linked session metadata.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Device Tracking
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {isLoading ? "--" : recordsWithDevice}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Records that include a captured device identifier.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
              Use the edit button on any attendance row to update status, scan time,
              device ID, or IP address. Delete follows the same two-step confirm flow
              used elsewhere in the admin.
            </div>
          </div>
        )}
      </SectionCard>
    </SectionPage>
  );
}
