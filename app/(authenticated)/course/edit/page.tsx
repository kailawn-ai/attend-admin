import { SectionCard, SectionPage } from "@/components/section-page";

export default function EditCoursePage() {
  return (
    <SectionPage
      eyebrow="Course"
      title="Edit existing courses"
      description="Review course metadata, update assignments, and keep the academic catalog accurate."
      stats={[
        { label: "Courses", value: "42", hint: "Records available to update" },
        { label: "Flagged", value: "03", hint: "Entries needing attention" },
        { label: "Recent Changes", value: "11", hint: "Updates this week" },
        { label: "Sync", value: "Healthy", hint: "Catalog state is stable" },
      ]}
    >
      <SectionCard
        title="Course editor"
        description="Use this area for search, selection, and editing existing course records."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Editing workflow"
        description="Helpful controls for day-to-day catalog maintenance."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Find a course by code or title</p>
          <p>Update linked semester and faculty data</p>
          <p>Track revision history before saving</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
