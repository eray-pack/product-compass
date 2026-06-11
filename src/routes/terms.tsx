import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsOfService,
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

function TermsOfService() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
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
        {/* Back — without this the page is a dead-end inside the app webview */}
        <button
          onClick={() => (window.history.length > 1 ? router.history.back() : (window.location.href = "/"))}
          aria-label="Back"
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10, width: 32, height: 32, display: "grid", placeItems: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1, padding: 0,
          }}
        >
          ←
        </button>
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
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 12, lineHeight: 1.65 }}>
            Welcome to Stopamine. By accessing or using the Stopamine app, you agree to these Terms of Service. If you do not agree, please do not use the app.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(201,168,76,0.12)", marginBottom: "2.5rem" }} />

        {/* Sections */}
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
          <a href="/privacy" style={{ fontSize: 12, color: "rgba(201,168,76,0.50)", textDecoration: "none" }}>
            ← Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
