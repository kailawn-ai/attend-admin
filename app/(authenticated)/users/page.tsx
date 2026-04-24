import { SectionCard, SectionPage } from "@/components/section-page";

export default function UsersPage() {
  return (
    <SectionPage
      eyebrow="Users"
      title="View and manage platform users"
      description="The users section is ready for account listing, role oversight, and linking people to courses and semesters."
      stats={[
        { label: "Students", value: "210", hint: "Registered student accounts" },
        { label: "Staff", value: "38", hint: "Teaching and admin team members" },
        { label: "Active", value: "228", hint: "Accounts currently enabled" },
        { label: "Pending", value: "20", hint: "Records requiring review" },
      ]}
    >
      <SectionCard
        title="User directory"
        description="Connect this section to `getUsers()` and related profile details."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Admin actions"
        description="Frequent user management tasks to support from this area."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Search and filter user records.</p>
          <p>Review course and semester assignments.</p>
          <p>Update role and activation status.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
