import { SectionCard, SectionPage } from "@/components/section-page";

export default function ManageAttendancePage() {
  return (
    <SectionPage
      eyebrow="Attendance"
      title="Manage attendance operations"
      description="Monitor attendance sessions, resolve exceptions, and review ongoing classroom activity from one place."
      stats={[
        { label: "Live Sessions", value: "07", hint: "Attendance windows currently active" },
        { label: "Exceptions", value: "12", hint: "Records needing review" },
        { label: "Processed", value: "148", hint: "Sessions completed this week" },
        { label: "Status", value: "Live", hint: "Monitoring is active" },
      ]}
    >
      <SectionCard
        title="Attendance control desk"
        description="This panel is a good home for filtering sessions, reviewing logs, and taking admin actions."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Common actions"
        description="High-value attendance tasks to support here."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Review session status and timing</p>
          <p>Resolve missing or duplicate scans</p>
          <p>Export reports for audit and follow-up</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
