import { SectionCard, SectionPage } from "@/components/section-page";

export default function AddSemesterPage() {
  return (
    <SectionPage
      eyebrow="Semester"
      title="Add a new semester"
      description="Set up semester timelines, academic metadata, and scheduling windows for new term cycles."
      stats={[
        { label: "Upcoming Terms", value: "02", hint: "Expected new semester entries" },
        { label: "Campuses", value: "03", hint: "Active scheduling groups" },
        { label: "Checklist", value: "05", hint: "Common setup steps" },
        { label: "Status", value: "Ready", hint: "Configuration workspace" },
      ]}
    >
      <SectionCard
        title="Semester creation form"
        description="Connect this screen to your create-semester API and date validation rules."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Configuration hints"
        description="Typical information required when opening a new semester."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Term name and code</p>
          <p>Start and end dates</p>
          <p>Linked courses and activation status</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
