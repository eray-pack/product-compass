import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.04em",
        marginBottom: "0.5rem",
        display: "flex",
        alignItems: "baseline",
        gap: 8,
      }}>
        <span style={{ color: "#C9A84C", fontVariantNumeric: "tabular-nums", minWidth: 20 }}>{number}.</span>
        <span style={{ color: "rgba(255,255,255,0.90)" }}>{title}</span>
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.50)", margin: 0, paddingLeft: 28 }}>
        {children}
      </p>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0A08",
      padding: "0 0 80px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "#C4873A",
          textShadow: "0 0 12px rgba(196,135,58,0.45)",
        }}>
          STOPAMINE
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 0" }}>

        {/* Title block */}
        <div style={{ marginBottom: "3rem" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(201,168,76,0.55)",
            marginBottom: 12,
          }}>
            Last updated: May 2026
          </p>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            margin: 0,
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 12, lineHeight: 1.65 }}>
            At Stopamine, we respect your privacy. This Privacy Policy explains what information we collect, how we use it, and how we protect it.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(201,168,76,0.12)", marginBottom: "2.5rem" }} />

        {/* Sections */}
        <Section number={1} title="Information We Collect">
          We may collect: email address, account information, streak and progress data, app interaction data, device and usage information, and subscription status. We only collect information necessary to operate and improve the app.
        </Section>

        <Section number={2} title="How We Use Information">
          We use collected information to: provide app functionality, sync progress across devices, personalize the experience, improve app performance, analyze usage trends, provide support, and manage subscriptions.
        </Section>

        <Section number={3} title="Analytics & Third-Party Services">
          Stopamine may use trusted third-party services such as Supabase, RevenueCat, and analytics providers. These services may process limited technical data required for app functionality.
        </Section>

        <Section number={4} title="Data Security">
          We use reasonable technical and organizational measures to protect your information. However, no method of electronic storage or transmission is completely secure.
        </Section>

        <Section number={5} title="Your Rights">
          You may request to: access your data, correct your data, delete your account, or remove stored information. To make a request, contact us at the email below.
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
          <a href="mailto:support@stopamineapp.com" style={{ color: "#C9A84C", textDecoration: "none" }}>
            support@stopamineapp.com
          </a>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.20)" }}>
            © {new Date().getFullYear()} Stopamine. All rights reserved.
          </span>
          <a href="/terms" style={{ fontSize: 12, color: "rgba(201,168,76,0.50)", textDecoration: "none" }}>
            Terms of Service →
          </a>
        </div>
      </div>
    </div>
  );
}
