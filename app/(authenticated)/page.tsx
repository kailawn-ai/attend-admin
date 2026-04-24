import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ChartColumnBig,
  Download,
  Eye,
  Wallet,
} from "lucide-react";
import { SectionCard, SectionPage } from "@/components/section-page";

export default function HomePage() {
  return (
    <SectionPage
      eyebrow="Home"
      title="Explore redesigned Able Pro"
      description="The brand new admin interface brings fast navigation, clean metrics, and a modular layout for day-to-day academic operations."
      stats={[
        { label: "All Earnings", value: "$3,020", hint: "30.6% this month" },
        { label: "Page Views", value: "290K+", hint: "30.6% this month" },
        { label: "Total Task", value: "839", hint: "+ New" },
        { label: "Download", value: "2,067", hint: "30.6% this month" },
      ]}
    >
      <SectionCard
        title="Featured Overview"
        description="A bright hero block and compact KPI cards keep the dashboard readable at a glance, much closer to the visual direction in your reference."
      >
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[24px] bg-linear-to-r from-blue-600 via-blue-500 to-indigo-400 p-6 text-white">
            <div className="absolute inset-y-0 right-[-10%] w-[45%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_58%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h3 className="text-2xl font-semibold tracking-tight">
                  Explore Redesigned Able Pro
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-blue-50/85">
                  The brand new User Interface with power of Bootstrap Components.
                  Explore the endless possibilities of Able Pro.
                </p>
                <button className="mt-4 rounded-full bg-white/18 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/24">
                  CodeThemes
                </button>
              </div>
              <div className="grid w-full max-w-xs grid-cols-2 gap-3 self-end">
                <MiniFeature icon={<Wallet className="size-4" />} label="Finance" />
                <MiniFeature icon={<Eye className="size-4" />} label="Analytics" />
                <MiniFeature icon={<Download className="size-4" />} label="Exports" />
                <MiniFeature icon={<ChartColumnBig className="size-4" />} label="Reports" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "All Earnings",
                value: "$3,020",
                tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
              },
              {
                title: "Page Views",
                value: "290K+",
                tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
              },
              {
                title: "Total Task",
                value: "839",
                tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
              },
              {
                title: "Download",
                value: "2,067",
                tone: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-[22px] border border-border/70 bg-background p-4 shadow-sm"
              >
                <div
                  className={`inline-flex rounded-xl px-3 py-2 text-xs font-semibold ${card.tone}`}
                >
                  {card.title}
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">30.6%</p>
                  </div>
                  <ArrowUpRight className="size-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Project Snapshot"
        description="A denser side panel matches the rhythm of the reference and gives you a place for progress widgets, quick status, or release notes."
      >
        <div className="space-y-4">
          <div className="rounded-[22px] bg-muted/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Project - Able Pro</p>
              <span className="text-xs text-muted-foreground">70%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-background">
              <div className="h-2 w-[70%] rounded-full bg-linear-to-r from-blue-500 to-cyan-400" />
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Release v1.2.0 is progressing on track.</p>
            <p>Dashboard shell, navigation, and responsive card layout are in place.</p>
            <p>Next step is wiring the content cards to real API-backed data.</p>
          </div>
        </div>
      </SectionCard>
    </SectionPage>
  );
}

function MiniFeature({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
      <div className="mb-2 inline-flex rounded-lg bg-white/15 p-2">{icon}</div>
      <p className="text-sm font-medium text-white">{label}</p>
    </div>
  );
}
