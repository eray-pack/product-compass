import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsOfService,
});

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold leading-snug">
        <span style={{ color: "var(--primary)" }}>{number}.</span> {title}
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mx-auto max-w-md" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 px-4 h-14 backdrop-blur-xl"
        style={{ background: "oklch(0.11 0.018 265 / 0.95)", borderBottom: "1px solid oklch(0.20 0.025 265 / 0.6)" }}
      >
        <button
          onClick={() => navigate({ to: "/settings" })}
          className="h-9 w-9 rounded-xl grid place-items-center transition-colors hover:bg-foreground/[0.06]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold flex-1">Terms of Service</h1>
      </header>

      {/* Content */}
      <div className="px-5 pt-6 pb-16 space-y-7">
        {/* Subtitle */}
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Last Updated: May 2026
        </p>

        {/* Intro */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          Welcome to Stopamine. By accessing or using the Stopamine app, you agree to these Terms of Service. If you do not agree, please do not use the app.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: "oklch(0.20 0.025 265 / 0.6)" }} />

        {/* Sections */}
        <div className="space-y-6">
          <Section number={1} title="Purpose of Stopamine">
            Stopamine is a self-improvement and habit-support application designed to help users build healthier digital habits, improve focus, and track personal progress. Stopamine is not a medical, psychological, or addiction treatment service. The app does not provide professional healthcare advice, diagnosis, or treatment.
          </Section>

          <Section number={2} title="Eligibility">
            You must be at least 13 years old to use Stopamine. By using the app, you confirm that you meet this requirement.
          </Section>

          <Section number={3} title="User Accounts">
            You are responsible for maintaining the security of your account, keeping your login information confidential, and all activity that occurs under your account. We reserve the right to suspend or terminate accounts that violate these Terms.
          </Section>

          <Section number={4} title="Acceptable Use">
            You agree not to misuse the platform, attempt unauthorized access, interfere with app functionality, upload harmful or illegal content, or harass other users in community features.
          </Section>

          <Section number={5} title="Progress & Recovery Information">
            The progress information shown inside the app is intended for motivational and informational purposes only. We do not guarantee specific personal outcomes, recovery results, or behavioral changes.
          </Section>

          <Section number={6} title="Subscriptions & Payments">
            Some features may require a paid subscription ("PRO"). Subscriptions may renew automatically unless canceled through your Apple App Store or Google Play account settings. Pricing and features may change over time.
          </Section>

          <Section number={7} title="Intellectual Property">
            All app content, branding, visuals, logos, designs, and software related to Stopamine are owned by Stopamine and may not be copied or redistributed without permission.
          </Section>

          <Section number={8} title="Limitation of Liability">
            To the maximum extent permitted by law, Stopamine shall not be liable for indirect damages, loss of data, emotional distress, behavioral outcomes, or interruptions in service. The app is provided "as is" without warranties of any kind.
          </Section>

          <Section number={9} title="Changes to the Service">
            We may update, modify, or discontinue parts of the app at any time without prior notice. We may also update these Terms periodically.
          </Section>

          <Section number={10} title="Contact">
            If you have questions about these Terms, contact us at:{" "}
            <span style={{ color: "var(--primary)" }}>support@stopamine.app</span>
          </Section>
        </div>
      </div>
    </div>
  );
}
