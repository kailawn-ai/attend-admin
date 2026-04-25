import { SectionCard, SectionPage } from "@/components/section-page";

export default function AddUserPage() {
  return (
    <SectionPage
      eyebrow="Users"
      title="Add a new user"
      description="Create staff and student accounts with the right role, assignment, and access controls from the start."
      stats={[
        { label: "Pending Invites", value: "09", hint: "Users awaiting creation" },
        { label: "Roles", value: "04", hint: "Supported access types" },
        { label: "Required Fields", value: "07", hint: "Typical user inputs" },
        { label: "Status", value: "Ready", hint: "Onboarding form prepared" },
      ]}
    >
      <SectionCard
        title="User onboarding form"
        description="Connect this section to your create-user API and validation rules."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Suggested fields"
        description="Important information to capture during account creation."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Name, email, and identifier</p>
          <p>Role, department, and course assignment</p>
          <p>Activation and notification preferences</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
