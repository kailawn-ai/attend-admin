"use client";

import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { SectionCard, SectionPage } from "@/components/section-page";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SectionPage
      eyebrow="Profile"
      title="Your account and access settings"
      description="Use this space for personal details, admin permissions, security preferences, and linked institutional information."
      stats={[
        { label: "Role", value: user?.role ?? "Administrator", hint: "Primary access level" },
        { label: "Status", value: user?.is_active ? "Active" : "Inactive", hint: "Current account state" },
        { label: "Security", value: "Protected", hint: "Session safeguards enabled" },
        { label: "Updates", value: "3", hint: "Recent profile-related events" },
      ]}
    >
      <SectionCard
        title="Account details"
        description="Connect this panel to the authenticated user record and editable profile metadata."
      >
        <div className="space-y-3">
          {[
            ["Full name", user?.name ?? "Admin User"],
            ["Email", user?.email ?? "admin@example.com"],
            ["Role", user?.role ?? "Administrator"],
            ["Timezone", "Asia/Calcutta"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-4 py-3"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Security and preferences"
        description="A good home for password updates, session management, notification settings, and audit history."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Session protection</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review active sessions, password settings, and access safety from
                  this panel.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="mt-1 text-sm text-muted-foreground">
              End the current admin session on this device.
            </p>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-4 w-full justify-center rounded-xl"
            >
              <LogOut className="size-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
