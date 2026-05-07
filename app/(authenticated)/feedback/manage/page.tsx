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
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/apiClient";
import {
  deleteComplaint,
  getComplaints,
  type ComplaintRecord,
  type ComplaintStatus,
  updateComplaint,
} from "@/lib/api/complaint-service";

type ComplaintForm = {
  complaint_type: string;
  date_of_class: string;
  reason: string;
  file_url: string;
  status: ComplaintStatus;
};

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

function getComplaintForm(record: ComplaintRecord): ComplaintForm {
  return {
    complaint_type: record.complaint_type,
    date_of_class: record.date_of_class,
    reason: record.reason,
    file_url: record.file_url ?? "",
    status: record.status,
  };
}

function getStatusTone(status: ComplaintStatus) {
  if (status === "approve") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }

  if (status === "reject") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  }

  return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
}

export default function ManageFeedbackPage() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ComplaintForm>({
    complaint_type: "",
    date_of_class: "",
    reason: "",
    file_url: "",
    status: "pending",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadComplaints() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getComplaints();

        if (!isMounted) {
          return;
        }

        setComplaints(response.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load feedback records right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const open = complaints.filter((record) => record.status === "pending").length;
    const approved = complaints.filter((record) => record.status === "approve").length;
    const rejected = complaints.filter((record) => record.status === "reject").length;
    const uploads = complaints.filter((record) => record.file_url).length;

    return [
      {
        label: "Open",
        value: isLoading ? "--" : String(open).padStart(2, "0"),
        hint: "Pending complaint items",
      },
      {
        label: "Approved",
        value: isLoading ? "--" : String(approved).padStart(2, "0"),
        hint: "Resolved in favor of submitters",
      },
      {
        label: "Rejected",
        value: isLoading ? "--" : String(rejected).padStart(2, "0"),
        hint: "Closed with rejection",
      },
      {
        label: "Uploads",
        value: isLoading ? "--" : String(uploads).padStart(2, "0"),
        hint: "Records with attachments",
      },
    ];
  }, [complaints, isLoading]);

  const recentComplaints = useMemo(
    () =>
      [...complaints]
        .sort((left, right) => {
          const leftTime = new Date(left.created_at).getTime();
          const rightTime = new Date(right.created_at).getTime();
          return rightTime - leftTime;
        })
        .slice(0, 8),
    [complaints],
  );

  const subjectLinked = complaints.filter((record) => record.subject).length;
  const periodLinked = complaints.filter((record) => record.period).length;

  function updateFormValue(key: keyof ComplaintForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleEdit(record: ComplaintRecord) {
    setSelectedComplaint(record);
    setForm(getComplaintForm(record));
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteId(null);
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.complaint_type.trim()) {
      nextErrors.complaint_type = "Complaint type is required.";
    }

    if (!form.date_of_class) {
      nextErrors.date_of_class = "Date of class is required.";
    }

    if (!form.reason.trim()) {
      nextErrors.reason = "Reason is required.";
    }

    return nextErrors;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedComplaint || isSaving) {
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage(
        Object.values(validationErrors)[0] ?? "Unable to update feedback.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setFieldErrors({});
      setErrorMessage("");
      setSuccessMessage("");

      const response = await updateComplaint(selectedComplaint.id, {
        complaint_type: form.complaint_type.trim(),
        date_of_class: form.date_of_class,
        reason: form.reason.trim(),
        file_url: form.file_url.trim() || null,
        status: form.status,
      });

      setComplaints((current) =>
        current.map((record) =>
          record.id === response.data.id
            ? { ...record, ...response.data }
            : record,
        ),
      );
      setSelectedComplaint((current) =>
        current && current.id === response.data.id
          ? { ...current, ...response.data }
          : current,
      );
      setForm(getComplaintForm({ ...selectedComplaint, ...response.data }));
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
        setErrorMessage("Unable to update feedback right now.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: ComplaintRecord) {
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

      const response = await deleteComplaint(record.id);

      setComplaints((current) =>
        current.filter((item) => item.id !== record.id),
      );
      setConfirmDeleteId(null);
      setSuccessMessage(response.message);

      if (selectedComplaint?.id === record.id) {
        setSelectedComplaint(null);
        setFieldErrors({});
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to delete feedback right now.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <SectionPage
      eyebrow="Feedback"
      title="Manage feedback submissions"
      description="Triage complaint submissions, review linked class context, and keep feedback resolution organized with the current complaint service."
      stats={stats}
    >
      <SectionCard
        title="Feedback queue"
        description="Recent complaints loaded from `getComplaints()` with status controls for admin review."
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
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 font-semibold">Attachment</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <LoaderCircle className="size-4 animate-spin" />
                          Loading feedback queue...
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && recentComplaints.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No feedback records found.
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading
                    ? recentComplaints.map((record) => (
                        <tr key={record.id} className="transition hover:bg-muted/30">
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusTone(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {record.complaint_type}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {record.user?.name ?? `User #${record.user_id ?? "--"}`}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            <div>
                              <p className="font-medium text-foreground">
                                {record.subject?.name ?? `Subject #${record.subject_id}`}
                              </p>
                              <p className="mt-1 text-xs">
                                {formatDate(record.date_of_class)} •{" "}
                                {record.period?.name ?? `Period #${record.period_id}`}
                              </p>
                            </div>
                          </td>
                          <td className="max-w-[260px] px-4 py-4 text-muted-foreground">
                            <p className="line-clamp-2">{record.reason}</p>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {record.file_url ? (
                              <a
                                href={record.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline-offset-4 hover:underline"
                              >
                                View file
                              </a>
                            ) : (
                              "--"
                            )}
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
        title={selectedComplaint ? "Edit selected feedback" : "Review tools"}
        description="Review the complaint details, adjust status, and keep the moderation workflow moving."
      >
        {successMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {selectedComplaint ? (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  Complaint #{selectedComplaint.id}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedComplaint.user?.name ?? `User #${selectedComplaint.user_id ?? "--"}`}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl"
                onClick={() => {
                  setSelectedComplaint(null);
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
              <label className="text-sm font-medium text-foreground" htmlFor="complaint-type">
                Complaint type
              </label>
              <input
                id="complaint-type"
                value={form.complaint_type}
                onChange={(event) => updateFormValue("complaint_type", event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
              {fieldErrors.complaint_type ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.complaint_type}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="complaint-date">
                Date of class
              </label>
              <input
                id="complaint-date"
                type="date"
                value={form.date_of_class}
                onChange={(event) => updateFormValue("date_of_class", event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
              {fieldErrors.date_of_class ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.date_of_class}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="complaint-status">
                Status
              </label>
              <select
                id="complaint-status"
                value={form.status}
                onChange={(event) =>
                  updateFormValue("status", event.target.value as ComplaintStatus)
                }
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="pending">Pending</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="complaint-file-url">
                File URL
              </label>
              <input
                id="complaint-file-url"
                value={form.file_url}
                onChange={(event) => updateFormValue("file_url", event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="complaint-reason">
                Reason
              </label>
              <textarea
                id="complaint-reason"
                value={form.reason}
                onChange={(event) => updateFormValue("reason", event.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
              {fieldErrors.reason ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.reason}
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
                onClick={() => setForm(getComplaintForm(selectedComplaint))}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Subject Coverage
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {isLoading ? "--" : subjectLinked}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Complaints that include linked subject metadata.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Period Coverage
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {isLoading ? "--" : periodLinked}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Complaints that include linked period details.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
              Use the edit button on any complaint row to update the complaint
              type, class date, reason, attachment URL, or approval status. Delete
              follows the same confirm-on-second-click pattern used across admin pages.
            </div>
          </div>
        )}
      </SectionCard>
    </SectionPage>
  );
}
