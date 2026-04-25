import { SectionCard, SectionPage } from "@/components/section-page";

export default function ManageUserPage() {
  return (
    <SectionPage
      eyebrow="Users"
      title="Manage users"
      description="Oversee account status, roles, assignments, and user lifecycle actions from a central workspace."
      stats={[
        { label: "Active Users", value: "228", hint: "Accounts currently enabled" },
        { label: "Pending Review", value: "20", hint: "Records needing admin action" },
        { label: "Locked", value: "05", hint: "Restricted accounts" },
        { label: "Status", value: "Monitored", hint: "Directory management is active" },
      ]}
    >
      <SectionCard
        title="User management table"
        description="A good home for filters, bulk actions, and account state updates."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Management actions"
        description="Key tools to support in the day-to-day user admin flow."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Search and filter user records</p>
          <p>Update role, access, and activation state</p>
          <p>Review linked course and semester details</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
