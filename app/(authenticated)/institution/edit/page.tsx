import { SectionCard, SectionPage } from "@/components/section-page";

export default function EditInstitutionPage() {
  return (
    <SectionPage
      eyebrow="Institution"
      title="Edit institution settings"
      description="Update institution details, status, location, and linked course mappings."
      stats={[
        { label: "Institutions", value: "01", hint: "Available records" },
        { label: "Course Links", value: "Pivot", hint: "course_institution table" },
        { label: "Location", value: "Mapped", hint: "Latitude and longitude ready" },
        { label: "Status", value: "Stable", hint: "Institution data layer" },
      ]}
    >
      <SectionCard
        title="Institution editor"
        description="Use this panel for search, selection, and institution updates."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Editing checklist"
        description="Common institution updates that belong here."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Update institution identity and address fields.</p>
          <p>Review course assignments.</p>
          <p>Confirm active status and coordinates.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
