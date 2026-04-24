"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BellRing,
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-context";

const navigationItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Course", href: "/course", icon: BookOpen },
  { title: "Semester", href: "/semester", icon: GraduationCap },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck2 },
  { title: "Feedback", href: "/feedback", icon: MessageSquareWarning },
  { title: "Users", href: "/users", icon: Users },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useSession();

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r-0">
      <SidebarHeader className="px-3 py-5">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-[0_10px_25px_rgba(59,130,246,0.35)]">
            <BellRing className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-lg font-semibold tracking-tight">Able</p>
            <p className="truncate text-[11px] uppercase tracking-[0.28em] text-blue-500/80 dark:text-blue-400/80">
              v4.0.1
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-sidebar-border/70 bg-white/80 p-3 shadow-sm dark:bg-sidebar-accent/40 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-blue-600 text-sm font-semibold text-white">
              {user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name ?? "John Smith"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/65">
                {user?.role ?? "Administrator"}
              </p>
            </div>
            <ChevronDown className="size-4 text-sidebar-foreground/60" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-[0.24em] text-sidebar-foreground/45">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      size="lg"
                      className="mx-2 rounded-xl px-3 data-[active=true]:bg-linear-to-r data-[active=true]:from-blue-500/12 data-[active=true]:to-sky-400/10 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <div className="rounded-2xl border border-sidebar-border/70 bg-white/80 p-3 shadow-sm dark:bg-sidebar-accent/40 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">Admin Panel</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Secure access active
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full justify-start rounded-xl border-sidebar-border/70 bg-background/70 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
          >
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
