import { SectionCard, SectionPage } from "@/components/section-page";

export default function InstitutionPage() {
  return (
    <SectionPage
      eyebrow="Institution"
      title="Manage institutions"
      description="Use this section to manage colleges, universities, and their linked academic courses."
      stats={[
        { label: "Institutions", value: "01", hint: "Seeded institution records" },
        { label: "Courses", value: "Linked", hint: "Many-to-many course mapping" },
        { label: "Location", value: "Ready", hint: "Address and geofence metadata" },
        { label: "Status", value: "Active", hint: "Institution workspace" },
      ]}
    >
      <SectionCard
        title="Institution list"
        description="A good place for institution records and course mappings."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Suggested actions"
        description="Typical institution management workflows."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Create college or university profiles.</p>
          <p>Attach courses through the course-institution pivot.</p>
          <p>Maintain address and coordinate metadata.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
