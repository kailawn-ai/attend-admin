import { SectionCard, SectionPage } from "@/components/section-page";

export default function CoursePage() {
  return (
    <SectionPage
      eyebrow="Course"
      title="Manage academic course definitions"
      description="Use this section to list courses, create new programs, and keep course metadata aligned with semesters and user assignments."
      stats={[
        { label: "Courses", value: "12", hint: "Configured academic programs" },
        { label: "Active", value: "10", hint: "Currently available for enrollment" },
        { label: "Archived", value: "2", hint: "Inactive course records" },
        { label: "Sync", value: "Ready", hint: "Prepared for API integration" },
      ]}
    >
      <SectionCard
        title="Course list"
        description="Replace this placeholder with a table connected to `getCourses()` and course mutations."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Suggested actions"
        description="Typical admin workflows for course management."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Create new course records.</p>
          <p>Edit descriptions and active status.</p>
          <p>Link semesters to the correct program.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
