"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getPostAuthRoute, useSession } from "@/lib/auth-context";

const PUBLIC_ROUTES = new Set(["/login"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authStatus, isAuthenticated, user } = useSession();

  useEffect(() => {
    if (
      authStatus === "checking" ||
      authStatus === "signing-in" ||
      authStatus === "signing-out"
    ) {
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.has(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublicRoute && user) {
      router.replace(getPostAuthRoute(user));
    }
  }, [authStatus, isAuthenticated, pathname, router, user]);

  if (
    authStatus === "checking" ||
    authStatus === "signing-in" ||
    authStatus === "signing-out"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16213A] px-6">
        <div className="w-full max-w-sm rounded-[28px] bg-white/10 px-6 py-8 text-center text-white backdrop-blur-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="mt-4 text-sm text-slate-200">
            {authStatus === "signing-in"
              ? "Signing you in..."
              : authStatus === "signing-out"
                ? "Signing you out..."
                : "Checking your session..."}
          </p>
        </div>
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if ((!isAuthenticated && !isPublicRoute) || (isAuthenticated && isPublicRoute)) {
    return null;
  }

  return <>{children}</>;
}
