"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  BellRing,
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  ChevronRight,
  FilePenLine,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  MessageSquareMore,
  MessageSquareWarning,
  PlusCircle,
  UserPlus,
  UsersRound,
  Users,
  X,
  Calendar1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-context";
import Image from "next/image";

const navigationItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Course",
    href: "/course",
    icon: BookOpen,
    children: [
      { title: "Add Course", href: "/course/add", icon: PlusCircle },
      { title: "Edit Course", href: "/course/edit", icon: FilePenLine },
    ],
  },

  {
    title: "Semester",
    href: "/semester",
    icon: GraduationCap,
    children: [
      { title: "Add Semester", href: "/semester/add", icon: PlusCircle },
      { title: "Edit Semester", href: "/semester/edit", icon: FilePenLine },
    ],
  },
  {
    title: "Institution",
    href: "/institution",
    icon: Landmark,
    children: [
      { title: "Add Institution", href: "/institution/add", icon: PlusCircle },
      {
        title: "Edit Institution",
        href: "/institution/edit",
        icon: FilePenLine,
      },
    ],
  },
  {
    title: "Period",
    href: "/period",
    icon: Calendar1,
    children: [
      { title: "Add Period", href: "/period/add", icon: PlusCircle },
      { title: "Edit Period", href: "/period/edit", icon: FilePenLine },
    ],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: CalendarCheck2,
    children: [
      {
        title: "Manage Attendance",
        href: "/attendance/manage",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquareWarning,
    children: [
      {
        title: "Manage Feedback",
        href: "/feedback/manage",
        icon: MessageSquareMore,
      },
    ],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    children: [
      { title: "Add User", href: "/users/add", icon: UserPlus },
      { title: "Manage User", href: "/users/manage", icon: UsersRound },
    ],
  },
] as const;

type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onCloseMobile: () => void;
};

export function AppSidebar({
  collapsed,
  mobileOpen,
  isMobile,
  onCloseMobile,
}: AppSidebarProps) {
  const desktopSidebarWidth = "w-72";
  const collapsedSidebarWidth = "w-[4.5rem]";
  const pathname = usePathname();
  const { user } = useSession();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const showCollapsed = collapsed && !isMobile;

  const toggleSection = (href: string) => {
    setOpenSections((current) => ({
      ...current,
      [href]: !(
        current[href] ??
        (pathname === href || pathname.startsWith(`${href}/`))
      ),
    }));
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border/60 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 dark:bg-sidebar/95",
          isMobile
            ? cn(
                desktopSidebarWidth,
                mobileOpen ? "translate-x-0" : "-translate-x-full",
              )
            : collapsed
              ? collapsedSidebarWidth
              : desktopSidebarWidth,
        )}
      >
        <div className="flex h-full flex-col px-3 py-1">
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <div
              className={cn(
                "flex items-center gap-3 overflow-hidden",
                showCollapsed && "justify-center",
              )}
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)] overflow-hidden">
                <Image
                  src="/logo.jpg"
                  alt="Able Logo"
                  width={42}
                  height={42}
                  className="rounded-3xl object-cover"
                />
              </div>
              {!showCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                    AttendHub
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-[0.28em] text-blue-500/80 dark:text-blue-400/80">
                    Admin Panel
                  </p>
                </div>
              )}
            </div>

            {isMobile && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl text-muted-foreground"
                onClick={onCloseMobile}
                aria-label="Close sidebar"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="mt-6 flex-1">
            {!showCollapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                Navigation
              </p>
            )}

            <nav className="mt-3 space-y-1.5">
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const isSectionOpen =
                  openSections[item.href] ??
                  (pathname === item.href ||
                    pathname.startsWith(`${item.href}/`));

                const hasChildren = Boolean(item.children?.length);

                const link = (
                  <div className="space-y-1">
                    {hasChildren && !showCollapsed ? (
                      <button
                        type="button"
                        className={cn(
                          "group flex w-full items-center rounded-2xl text-sm font-medium transition-all duration-200",
                          "gap-3 px-3.5 py-3",
                          isActive
                            ? "bg-linear-to-r from-blue-500/14 to-sky-400/10 text-blue-600 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.16)] dark:text-blue-400"
                            : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-950 dark:text-sidebar-foreground/80 dark:hover:bg-sidebar-accent/70 dark:hover:text-sidebar-foreground",
                        )}
                        onClick={() => toggleSection(item.href)}
                        aria-label={`${isSectionOpen ? "Collapse" : "Expand"} ${item.title}`}
                        aria-expanded={isSectionOpen}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-left">
                          {item.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            isSectionOpen && "rotate-180",
                          )}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center rounded-2xl text-sm font-medium transition-all duration-200",
                          showCollapsed
                            ? "mx-auto size-12 justify-center"
                            : "gap-3 px-3.5 py-3",
                          isActive
                            ? "bg-linear-to-r from-blue-500/14 to-sky-400/10 text-blue-600 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.16)] dark:text-blue-400"
                            : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-950 dark:text-sidebar-foreground/80 dark:hover:bg-sidebar-accent/70 dark:hover:text-sidebar-foreground",
                        )}
                        onClick={() => {
                          if (isMobile) {
                            onCloseMobile();
                          }
                        }}
                      >
                        <item.icon
                          className={cn(
                            "shrink-0",
                            showCollapsed ? "size-5" : "size-4",
                          )}
                        />
                        {!showCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </Link>
                    )}

                    {!showCollapsed &&
                    item.children?.length &&
                    isSectionOpen ? (
                      <div className="ml-4 space-y-1 border-l border-border/60 pl-3">
                        {item.children.map((child) => {
                          const childActive = pathname.startsWith(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                childActive
                                  ? "bg-blue-50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.14)] dark:bg-sidebar-accent dark:text-blue-400"
                                  : "text-muted-foreground hover:bg-slate-100/80 hover:text-foreground dark:hover:bg-sidebar-accent/70 dark:hover:text-sidebar-foreground",
                              )}
                              onClick={() => {
                                if (isMobile) {
                                  onCloseMobile();
                                }
                              }}
                            >
                              <child.icon className="size-3.5 shrink-0" />
                              <span className="truncate">{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );

                if (!showCollapsed) {
                  return <div key={item.href}>{link}</div>;
                }

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" align="center" sideOffset={10}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 space-y-3">
            {showCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/profile"
                    className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-linear-to-br from-white to-slate-50 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-slate-50 dark:from-sidebar dark:to-sidebar-accent/30"
                    onClick={() => {
                      if (isMobile) {
                        onCloseMobile();
                      }
                    }}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 to-blue-600 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(14,116,144,0.28)]">
                      {user?.name?.charAt(0) ?? "A"}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" sideOffset={10}>
                  Profile
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/profile"
                className="block rounded-3xl border border-border/70 bg-linear-to-br from-white to-slate-50 p-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:from-sidebar dark:to-sidebar-accent/30"
                onClick={() => {
                  if (isMobile) {
                    onCloseMobile();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 to-blue-600 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(14,116,144,0.28)]">
                    {user?.name?.charAt(0) ?? "A"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.name ?? "John Smith"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.role ?? "Administrator"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
