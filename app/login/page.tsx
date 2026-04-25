"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/apiClient";
import { getPostAuthRoute, useSession } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

type FieldConfig = {
  key: "email" | "password";
  label: string;
  type: "email" | "password";
  icon: "mail" | "lock";
};

const LOGIN_FIELDS: FieldConfig[] = [
  {
    key: "email",
    label: "E-mail ID",
    type: "email",
    icon: "mail",
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    icon: "lock",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const fields = LOGIN_FIELDS;
  const title = "Go ahead and set up\nyour account";
  const subtitle = "Sign in-up to enjoy the best managing experience";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const user = await signIn({
        login: form.email.trim(),
        password: form.password,
        remember: rememberMe,
      });

      router.replace(getPostAuthRoute(user));
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_transparent_34%),linear-gradient(180deg,_#f6f8ff_0%,_#edf3ff_100%)] px-4 py-0 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(39,59,110,0.55),_transparent_34%),linear-gradient(180deg,_#16213A_0%,_#0f1729_100%)] dark:text-slate-100 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#dbeafe] sm:min-h-[720px] sm:max-w-6xl sm:rounded-[36px] sm:shadow-[0_30px_90px_rgba(148,163,184,0.28)] dark:bg-[#16213A] dark:sm:shadow-[0_30px_90px_rgba(2,6,23,0.38)] lg:grid lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
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
              {title}
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-5 text-slate-600 dark:text-[#9FAAC1] sm:text-[14px] sm:leading-6">
              {subtitle}
            </p>
          </div>

          <div className="relative z-10 hidden lg:grid lg:grid-cols-2 lg:gap-4">
            <FeatureCard
              title="Fast Access"
              description="Login and land in the protected admin workspace without extra steps."
            />
            <FeatureCard
              title="Session Ready"
              description="The same guard flow keeps public and private routes separated."
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
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Enter your account details to continue to the admin dashboard.
                </p>
              </div>

              <form className="flex flex-col gap-3.5 pt-6" onSubmit={handleSubmit}>
                {fields.map((field) => {
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
                      <input
                        type={isSecureField && !isVisible ? "password" : "text"}
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
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="text-[13px] font-semibold text-[#1642A8] dark:text-blue-400"
                  >
                    Forget Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 h-14 rounded-full bg-[#1642A8] text-base font-bold text-white shadow-[0_10px_24px_rgba(47,102,231,0.28)] transition hover:bg-[#12398f] dark:bg-blue-500 dark:shadow-[0_10px_24px_rgba(59,130,246,0.24)] dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : "Login"}
                </button>
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

function FieldIcon({ type }: { type: FieldConfig["icon"] }) {
  if (type === "mail") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7A3 3 0 0013.3 13.4" />
      <path d="M9.9 5.2A11.2 11.2 0 0112 5c6.5 0 10 7 10 7a18.8 18.8 0 01-4.2 4.8" />
      <path d="M6.2 6.3A18.2 18.2 0 002 12s3.5 7 10 7a9.7 9.7 0 004-.8" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  if (theme === "dark") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.5" />
        <path d="M12 19.5V22" />
        <path d="M4.93 4.93l1.77 1.77" />
        <path d="M17.3 17.3l1.77 1.77" />
        <path d="M2 12h2.5" />
        <path d="M19.5 12H22" />
        <path d="M4.93 19.07l1.77-1.77" />
        <path d="M17.3 6.7l1.77-1.77" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}
