import { SectionCard, SectionPage } from "@/components/section-page";

export default function FeedbackPage() {
  return (
    <SectionPage
      eyebrow="Feedback"
      title="Handle complaints and review submissions"
      description="This page can host complaint queues, status updates, and supporting class metadata for fast feedback processing."
      stats={[
        { label: "Open", value: "18", hint: "Pending complaint items" },
        { label: "Approved", value: "43", hint: "Resolved in favor of submitters" },
        { label: "Rejected", value: "11", hint: "Closed with rejection" },
        { label: "Uploads", value: "9", hint: "Records with attachments" },
      ]}
    >
      <SectionCard
        title="Complaint queue"
        description="Swap this placeholder with a data grid driven by the complaint service."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Review workflow"
        description="Common review actions for the admin team."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Inspect complaint reason and date of class.</p>
          <p>Check linked period and subject details.</p>
          <p>Approve or reject with a clear audit trail.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
