import { SectionCard, SectionPage } from "@/components/section-page";

export default function EditSemesterPage() {
  return (
    <SectionPage
      eyebrow="Semester"
      title="Edit semester settings"
      description="Update term details, status, and linked academic records without leaving the admin workflow."
      stats={[
        { label: "Semesters", value: "10", hint: "Active term records" },
        { label: "Locked", value: "02", hint: "Limited-edit entries" },
        { label: "Recent Updates", value: "06", hint: "Changes this month" },
        { label: "Status", value: "Stable", hint: "Scheduling remains aligned" },
      ]}
    >
      <SectionCard
        title="Semester editor"
        description="Use this panel for search, selection, and semester updates."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Editing checklist"
        description="Common semester updates that belong here."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Adjust timeline and availability dates</p>
          <p>Review linked course assignments</p>
          <p>Confirm visibility for staff and students</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
