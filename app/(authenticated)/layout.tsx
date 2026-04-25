"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AppShellHeader } from "@/components/app-shell-header";
import { AppSidebar } from "@/components/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const desktopSidebarOffset = "18rem";
  const collapsedSidebarOffset = "4.5rem";
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
      return;
    }

    setCollapsed((value) => !value);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-muted/30">
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          isMobile={isMobile}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div
          style={
            {
              "--sidebar-offset": isMobile
                ? "0rem"
                : collapsed
                  ? collapsedSidebarOffset
                  : desktopSidebarOffset,
            } as React.CSSProperties
          }
          className="min-h-screen pl-0 transition-[padding] duration-300 md:pl-[var(--sidebar-offset)]"
        >
          <AppShellHeader
            collapsed={collapsed}
            isMobile={isMobile}
            onToggleSidebar={handleToggleSidebar}
          />
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
