import { SectionCard, SectionPage } from "@/components/section-page";

export default function AttendancePage() {
  return (
    <SectionPage
      eyebrow="Attendance"
      title="Track sessions, records, and scanning flow"
      description="Use the attendance module to monitor session activity, inspect recorded scans, and surface summaries for staff and students."
      stats={[
        { label: "Today", value: "438", hint: "Recorded attendance entries" },
        { label: "Late", value: "21", hint: "Late arrivals captured" },
        { label: "Sessions", value: "9", hint: "Attendance sessions opened" },
        { label: "Static Scan", value: "Enabled", hint: "Manual token entry supported" },
      ]}
    >
      <SectionCard
        title="Attendance records"
        description="A table view here can be wired to `getAttendances()` and session summary APIs."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Operational checks"
        description="Use this space for quick validation or admin shortcuts."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Review user attendance summary data.</p>
          <p>Inspect active attendance sessions.</p>
          <p>Support manual scan troubleshooting.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
