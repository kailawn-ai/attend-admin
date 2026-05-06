"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/apiClient";
import { SectionCard, SectionPage } from "@/components/section-page";
import { createStaffDetail } from "@/lib/api/staff-detail-service";

const STAFF_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "receptionist", label: "Receptionist" },
] as const;

function getRoleFlags(role: string) {
  return {
    is_admin: role === "admin",
    is_teacher: role === "teacher",
    is_receptionist: role === "receptionist",
  };
}

export default function SetupStaffDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    position: "",
    phone_1: "",
    phone_2: "",
    notes: "",
    is_approved: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = searchParams.get("userId");
  const role = searchParams.get("role") ?? "teacher";
  const roleLabel =
    STAFF_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;

  const roleFlags = useMemo(() => getRoleFlags(role), [role]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!userId) {
      setErrorMessage("Missing registered user reference. Please register again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await createStaffDetail({
        user_id: Number(userId),
        position: form.position.trim() || null,
        phone_1: form.phone_1.trim() || null,
        phone_2: form.phone_2.trim() || null,
        notes: form.notes.trim() || null,
        is_approved: form.is_approved,
        ...roleFlags,
      });

      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError) {
        const validationMessage = error.errors
          ? Object.values(error.errors).flat()[0]
          : undefined;

        setErrorMessage(validationMessage ?? error.message);
      } else {
        setErrorMessage("Something went wrong while saving staff details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionPage
      eyebrow="Staff Setup"
      title="Finish the staff profile"
      description="This temporary step creates the matching staff detail record right after account registration."
      stats={[
        { label: "User ID", value: userId ?? "Missing", hint: "Newly registered user" },
        { label: "Role", value: roleLabel, hint: "Used to set staff flags" },
        { label: "Approval", value: "Pending", hint: "Defaults to unapproved" },
        { label: "Next", value: "Dashboard", hint: "After saving details" },
      ]}
    >
      <SectionCard
        title="Staff detail form"
        description="These fields map directly to the backend `staff_details` payload."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Position</span>
              <input
                type="text"
                value={form.position}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    position: event.target.value,
                  }))
                }
                placeholder="Lecturer, HOD, Office Admin..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Primary phone</span>
              <input
                type="text"
                value={form.phone_1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone_1: event.target.value,
                  }))
                }
                placeholder="Primary contact number"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Secondary phone</span>
              <input
                type="text"
                value={form.phone_2}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone_2: event.target.value,
                  }))
                }
                placeholder="Optional backup number"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            </label>

            <div className="space-y-2 rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <span className="text-sm font-medium text-foreground">Role flags</span>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <FlagPill active={roleFlags.is_admin}>Admin</FlagPill>
                <FlagPill active={roleFlags.is_teacher}>Teacher</FlagPill>
                <FlagPill active={roleFlags.is_receptionist}>Receptionist</FlagPill>
              </div>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Notes</span>
            <textarea
              rows={5}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Anything useful about the staff profile or onboarding context."
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <input
              type="checkbox"
              checked={form.is_approved}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_approved: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-foreground">
              Mark as approved now
            </span>
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving details..." : "Save staff details"}
            </button>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Skip for now
            </Link>
          </div>
        </form>
      </SectionCard>
    </SectionPage>
  );
}

function FlagPill({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1",
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
