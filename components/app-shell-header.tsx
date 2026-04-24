"use client";

import { usePathname } from "next/navigation";
import { Bell, Languages, Maximize2, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-context";

const sectionTitles: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/course": "Course",
  "/semester": "Semester",
  "/attendance": "Attendance",
  "/feedback": "Feedback",
  "/users": "Users",
};

export function AppShellHeader() {
  const pathname = usePathname();
  const { user } = useSession();

  const title = sectionTitles[pathname] ?? "Attend Admin";

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6">
      <div className="flex w-full items-center gap-3">
        <SidebarTrigger className="-ml-1 rounded-xl border border-border/70 bg-card shadow-sm" />

        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <div className="relative w-72 lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              value=""
              placeholder="Ctrl + K"
              className="h-10 rounded-xl border-border/70 bg-card pl-9 text-sm shadow-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          {[Settings, Languages, Maximize2, Bell].map((Icon, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon-sm"
              className="rounded-xl text-muted-foreground hover:bg-muted/80"
            >
              <Icon className="size-4" />
            </Button>
          ))}

          <div className="ml-1 flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-2 py-1.5 shadow-sm">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-foreground">{title}</p>
              <p className="text-[11px] text-muted-foreground">
                {user?.name ?? "Admin User"}
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-blue-600 text-sm font-semibold text-white">
              {user?.name?.charAt(0) ?? "A"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
