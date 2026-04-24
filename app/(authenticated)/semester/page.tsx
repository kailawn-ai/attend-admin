import { SectionCard, SectionPage } from "@/components/section-page";

export default function SemesterPage() {
  return (
    <SectionPage
      eyebrow="Semester"
      title="Configure semester structure and context"
      description="This page is ready for semester listings, QR configuration, geofence setup, and mappings back to academic courses."
      stats={[
        { label: "Semesters", value: "24", hint: "Configured terms across all courses" },
        { label: "Geofenced", value: "18", hint: "Terms with attendance boundaries" },
        { label: "QR Enabled", value: "20", hint: "Semesters with scan support" },
        { label: "Status", value: "Draft", hint: "Waiting for live data" },
      ]}
    >
      <SectionCard
        title="Semester management"
        description="Ideal for a table plus create/edit form wired to the semester service."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Configuration notes"
        description="Keep operational settings visible for quick admin access."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Geofence latitude and longitude</p>
          <p>Radius configuration for scan validation</p>
          <p>QR token and image generation state</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
