import { SectionCard, SectionPage } from "@/components/section-page";

export default function AddInstitutionPage() {
  return (
    <SectionPage
      eyebrow="Institution"
      title="Add a new institution"
      description="Create college or university records and prepare them for course assignment."
      stats={[
        { label: "Required Fields", value: "01", hint: "Institution name" },
        { label: "Optional Fields", value: "09", hint: "Address and location details" },
        { label: "Courses", value: "Many", hint: "Can be linked after creation" },
        { label: "API Route", value: "Planned", hint: "/institutions" },
      ]}
    >
      <SectionCard
        title="Institution setup form"
        description="Connect this screen to your institution create API."
      >
        <div className="h-72 rounded-3xl border border-dashed border-border bg-muted/40" />
      </SectionCard>

      <SectionCard
        title="Configuration hints"
        description="Typical information required for institution records."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Name, abbreviation, and description.</p>
          <p>Country, state, city, and address.</p>
          <p>Latitude, longitude, and active status.</p>
        </div>
      </SectionCard>
    </SectionPage>
  );
}
