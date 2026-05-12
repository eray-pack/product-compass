import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
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

function PrivacyPolicy() {
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
        <h1 className="text-base font-bold flex-1">Privacy Policy</h1>
      </header>

      {/* Content */}
      <div className="px-5 pt-6 pb-16 space-y-7">
        {/* Subtitle */}
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Last Updated: May 2026
        </p>

        {/* Intro */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          At Stopamine, we respect your privacy. This Privacy Policy explains what information we collect, how we use it, and how we protect it.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: "oklch(0.20 0.025 265 / 0.6)" }} />

        {/* Sections */}
        <div className="space-y-6">
          <Section number={1} title="Information We Collect">
            We may collect: email address, account information, streak and progress data, app interaction data, device and usage information, and subscription status. We only collect information necessary to operate and improve the app.
          </Section>

          <Section number={2} title="How We Use Information">
            We use collected information to: provide app functionality, sync progress across devices, personalize the experience, improve app performance, analyze usage trends, provide support, and manage subscriptions.
          </Section>

          <Section number={3} title="Analytics & Third-Party Services">
            Stopamine may use trusted third-party services such as Firebase, Supabase, RevenueCat, and analytics providers. These services may process limited technical data required for app functionality.
          </Section>

          <Section number={4} title="Data Security">
            We use reasonable technical and organizational measures to protect your information. However, no method of electronic storage or transmission is completely secure.
          </Section>

          <Section number={5} title="Your Rights">
            You may request to: access your data, correct your data, delete your account, or remove stored information. To make a request, contact:{" "}
            <span style={{ color: "var(--primary)" }}>support@stopamine.app</span>
          </Section>

          <Section number={6} title="Data Retention">
            We retain information only as long as necessary to operate the service and comply with legal obligations.
          </Section>

          <Section number={7} title="Children's Privacy">
            Stopamine is not intended for children under 13 years old. We do not knowingly collect personal information from children.
          </Section>

          <Section number={8} title="Changes to This Policy">
            We may update this Privacy Policy periodically. Continued use of the app after updates means you accept the revised policy.
          </Section>

          <Section number={9} title="Contact">
            If you have questions about this Privacy Policy, contact us at:{" "}
            <span style={{ color: "var(--primary)" }}>support@stopamine.app</span>
          </Section>
        </div>
      </div>
    </div>
  );
}
