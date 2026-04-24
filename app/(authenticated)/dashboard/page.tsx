import { SectionCard, SectionPage } from "@/components/section-page";

export default function DashboardPage() {
  return (
    <SectionPage
      eyebrow="Dashboard"
      title="High-level academic operations overview"
      description="A cleaner, card-based dashboard layout gives you room for analytics, alerts, and operational summaries in a style closer to your reference."
      stats={[
        { label: "Attendance Rate", value: "92%", hint: "Placeholder KPI card" },
        { label: "Pending Feedback", value: "18", hint: "Items waiting for review" },
        { label: "Active Users", value: "248", hint: "Current enrolled and staff accounts" },
        { label: "Open Sessions", value: "7", hint: "Running attendance windows" },
      ]}
    >
      <SectionCard
        title="Overview panel"
        description="Use this area for charts, recent system events, or time-based attendance comparisons."
      >
        <div className="rounded-[24px] bg-muted/40 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Repeat customer rate</p>
              <p className="text-xs text-muted-foreground">Performance trend</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">5.44%</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">+2.4%</p>
            </div>
          </div>
          <div className="h-52 rounded-[20px] border border-dashed border-border bg-background" />
        </div>
      </SectionCard>

      <SectionCard
        title="Recent signals"
        description="A good place for action queues and operational alerts."
      >
        <div className="space-y-3">
          {[
            "3 feedback submissions need review",
            "1 semester configuration was updated today",
            "2 attendance sessions are nearing end time",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border/60 bg-muted/60 px-4 py-3 text-sm text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>
    </SectionPage>
  );
}
