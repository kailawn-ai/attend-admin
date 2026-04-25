import { SectionCard, SectionPage } from "@/components/section-page";

export default function ManageFeedbackPage() {
  return (
    <SectionPage
      eyebrow="Feedback"
      title="Manage feedback submissions"
      description="Triage submitted feedback, surface urgent cases, and keep the response process organized."
      stats={[
        { label: "Open", value: "18", hint: "Items awaiting review" },
        { label: "Escalated", value: "04", hint: "Need prompt action" },
        { label: "Resolved", value: "26", hint: "Closed this month" },
        { label: "Status", value: "Active", hint: "Review queue is live" },
      ]}
    >
      <SectionCard
        title="Feedback queue"
        description="Use this area for filtering, reviewing, and resolving feedback records."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Review tools"
        description="Helpful actions to support the moderation workflow."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Sort by urgency, category, or recency</p>
          <p>Assign feedback to reviewers</p>
          <p>Track status changes and outcomes</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
