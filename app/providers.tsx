"use client";

import type { PropsWithChildren } from "react";
import { AuthGate } from "@/components/auth-gate";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
