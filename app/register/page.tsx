"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/apiClient";
import { useSession } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

type RegisterFieldKey =
  | "name"
  | "email"
  | "role"
  | "password"
  | "passwordConfirmation";

type FieldConfig = {
  key: RegisterFieldKey;
  label: string;
  type: "text" | "email" | "password" | "select";
  icon: "user" | "mail" | "lock" | "briefcase";
};

const STAFF_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "receptionist", label: "Receptionist" },
] as const;

const REGISTER_FIELDS: FieldConfig[] = [
  {
    key: "name",
    label: "Full name",
    type: "text",
    icon: "user",
  },
  {
    key: "email",
    label: "E-mail ID",
    type: "email",
    icon: "mail",
  },
  {
    key: "role",
    label: "Staff role",
    type: "select",
    icon: "briefcase",
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    icon: "lock",
  },
  {
    key: "passwordConfirmation",
    label: "Confirm password",
    type: "password",
    icon: "lock",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "teacher",
    password: "",
    passwordConfirmation: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.role.trim() ||
      !form.password.trim()
    ) {
      setErrorMessage("Name, email, role, and password are required.");
      return;
    }

    if (form.password !== form.passwordConfirmation) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const user = await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
        remember: rememberMe,
      });

      router.replace(
        `/staff-details/setup?userId=${user.id}&role=${encodeURIComponent(
          form.role,
        )}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const validationMessage = error.errors
          ? Object.values(error.errors).flat()[0]
          : undefined;

        setErrorMessage(validationMessage ?? error.message);
      } else {
        setErrorMessage("Something went wrong. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_transparent_34%),linear-gradient(180deg,_#f6f8ff_0%,_#edf3ff_100%)] px-4 py-0 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(39,59,110,0.55),_transparent_34%),linear-gradient(180deg,_#16213A_0%,_#0f1729_100%)] dark:text-slate-100 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#dbeafe] sm:min-h-[calc(100vh-4rem)] sm:max-w-6xl sm:rounded-[36px] sm:shadow-[0_30px_90px_rgba(148,163,184,0.28)] dark:bg-[#16213A] dark:sm:shadow-[0_30px_90px_rgba(2,6,23,0.38)] lg:grid lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/75 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900 sm:right-7 sm:top-7"
        >
          <ThemeIcon theme={theme} />
        </button>

        <div className="relative overflow-hidden bg-[linear-gradient(180deg,_#dbeafe_0%,_#bfdbfe_100%)] px-6 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-12 dark:bg-none lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14 xl:px-16">
          <div className="absolute -right-24 -top-8 h-64 w-64 rounded-full bg-[#bfdbfe] opacity-95 sm:-right-10 sm:top-0 sm:h-72 sm:w-72 dark:bg-[#2A3550] lg:right-[-70px] lg:top-[-40px] lg:h-80 lg:w-80" />
          <div className="absolute right-6 top-4 h-48 w-48 rounded-full bg-[#93c5fd] opacity-85 sm:right-14 sm:top-10 sm:h-56 sm:w-56 dark:bg-[#202B44] lg:right-12 lg:top-16 lg:h-72 lg:w-72" />
          <div className="absolute bottom-[-90px] left-[-30px] hidden h-52 w-52 rounded-full bg-[#60a5fa] opacity-40 dark:bg-[#23314D] dark:opacity-70 lg:block" />

          <div className="relative z-10 mt-10 max-w-[78%] sm:mt-6 sm:max-w-[60%] lg:mt-0 lg:max-w-[440px]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#4b5563] dark:text-[#9FAAC1]">
              Attend Admin
            </p>
            <h1 className="whitespace-pre-line text-[2.35rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-slate-50 sm:text-[2.7rem] lg:text-[3.35rem]">
              Create a temporary admin account
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-5 text-slate-600 dark:text-[#9FAAC1] sm:text-[14px] sm:leading-6">
              This page is just for now so we can create accounts quickly while
              the rest of the auth flow is still in motion.
            </p>
          </div>

          <div className="relative z-10 hidden lg:grid lg:grid-cols-2 lg:gap-4">
            <FeatureCard
              title="Quick Setup"
              description="Create a user and immediately drop into the admin workspace."
            />
            <FeatureCard
              title="Temporary Flow"
              description="Easy to remove later without touching the protected dashboard routes."
            />
          </div>
        </div>

        <div className="-mt-12 flex flex-1 flex-col rounded-t-[34px] bg-white px-5 pb-10 pt-5 shadow-[0_-8px_40px_rgba(7,15,30,0.12)] dark:bg-[#0f1729] dark:shadow-[0_-8px_40px_rgba(7,15,30,0.18)] sm:-mt-0 sm:rounded-none sm:px-8 sm:pb-12 sm:pt-10 lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto flex w-full max-w-md flex-1 items-center lg:max-w-[440px]">
            <div className="w-full">
              <div className="mb-6 lg:mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8D98AE] dark:text-slate-400 lg:hidden">
                  Attend Admin
                </p>
                <h2 className="mt-2 text-[1.8rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-slate-50 sm:text-[2rem]">
                  Register
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Fill in the basics and we&apos;ll create the account with the existing
                  backend register endpoint.
                </p>
              </div>

              <form className="flex flex-col gap-3.5 pt-6" onSubmit={handleSubmit}>
                {REGISTER_FIELDS.map((field) => {
                  const value = form[field.key];
                  const isSecureField = field.type === "password";
                  const isVisible = visiblePasswords[field.key];

                  return (
                    <label
                      key={field.key}
                      className="flex h-14 items-center gap-3 rounded-[18px] border border-[#E4EAF4] bg-white px-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <span className="text-[#1642A8] dark:text-blue-400">
                        <FieldIcon type={field.icon} />
                      </span>
                      {field.type === "select" ? (
                        <select
                          value={value}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          className="w-full flex-1 border-0 bg-transparent text-[15px] text-slate-800 outline-none dark:text-slate-100"
                        >
                          {STAFF_ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={isSecureField && !isVisible ? "password" : field.type}
                          placeholder={field.label}
                          autoCapitalize="none"
                          autoCorrect="off"
                          value={value}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          className="w-full flex-1 border-0 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-[#8D98AE] dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                      )}
                      {isSecureField ? (
                        <button
                          type="button"
                          onClick={() =>
                            setVisiblePasswords((current) => ({
                              ...current,
                              [field.key]: !current[field.key],
                            }))
                          }
                          className="text-[#8D98AE] transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                          aria-label={
                            isVisible ? "Hide password" : "Show password"
                          }
                        >
                          <EyeIcon open={Boolean(isVisible)} />
                        </button>
                      ) : null}
                    </label>
                  );
                })}

                {errorMessage ? (
                  <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="mb-2 mt-1 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-[13px] text-[#7A869B] dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => setRememberMe((current) => !current)}
                      aria-pressed={rememberMe}
                      className={[
                        "relative h-7 w-12 rounded-full transition",
                        rememberMe
                          ? "bg-[#BFD1FF] dark:bg-blue-500/60"
                          : "bg-[#D8DEEA] dark:bg-slate-700",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                          rememberMe ? "left-6" : "left-1",
                        ].join(" ")}
                      />
                    </button>
                    <span>Keep me signed in</span>
                  </label>

                  <Link
                    href="/login"
                    className="text-[13px] font-semibold text-[#1642A8] dark:text-blue-400"
                  >
                    Back to login
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 h-14 rounded-full bg-[#1642A8] text-base font-bold text-white shadow-[0_10px_24px_rgba(47,102,231,0.28)] transition hover:bg-[#12398f] dark:bg-blue-500 dark:shadow-[0_10px_24px_rgba(59,130,246,0.24)] dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have access?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#1642A8] transition hover:text-[#12398f] dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-900/5 bg-white/45 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#9FAAC1]">{description}</p>
    </div>
  );
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  if (theme === "dark") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3c0 .34-.02.67-.02 1.01A7.99 7.99 0 0 0 21 12.79Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.2" />
      <path d="M12 19.8V22" />
      <path d="m4.93 4.93 1.56 1.56" />
      <path d="m17.51 17.51 1.56 1.56" />
      <path d="M2 12h2.2" />
      <path d="M19.8 12H22" />
      <path d="m4.93 19.07 1.56-1.56" />
      <path d="m17.51 6.49 1.56-1.56" />
    </svg>
  );
}

function FieldIcon({ type }: { type: "user" | "mail" | "lock" | "briefcase" }) {
  if (type === "user") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (type === "briefcase") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.46 17.46 0 0 1-4.23 5.01" />
      <path d="M6.61 6.61A17.34 17.34 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.39-1.39" />
    </svg>
  );
}
