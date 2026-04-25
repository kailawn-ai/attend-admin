"use client";

import {
  Moon,
  PanelLeft,
  PanelLeftClose,
  Search,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme-context";

type AppShellHeaderProps = {
  collapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
};

export function AppShellHeader({
  collapsed,
  isMobile,
  onToggleSidebar,
}: AppShellHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6">
      <div className="flex w-full items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="-ml-1 rounded-xl border-border/70 bg-card shadow-sm"
          onClick={onToggleSidebar}
          aria-label={
            isMobile
              ? "Open sidebar"
              : collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
        >
          {isMobile || collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>

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
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl text-muted-foreground hover:bg-muted/80"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
