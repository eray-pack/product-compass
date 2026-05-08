import { TrendingUp, Users, Swords, DollarSign, CheckCircle2 } from "lucide-react";

export type Report = {
  idea: string;
  demand: { score: string; summary: string; signals: string[] };
  audience: { primary: string; segments: string[] };
  competitors: { name: string; note: string }[];
  pricing: { range: string; model: string; notes: string };
  verdict: { decision: "GO" | "NO-GO" | "CAUTION"; rationale: string };
};

export const mockReport = (idea: string): Report => ({
  idea,
  demand: {
    score: "High",
    summary:
      "Search interest has grown ~38% YoY, with steady seasonal peaks around holidays and summer travel.",
    signals: [
      "12K+ monthly searches for related keywords",
      "Active discussions on r/travel and r/onebag",
      "Growing TikTok hashtag with 4M+ views",
    ],
  },
  audience: {
    primary: "Frequent flyers aged 25–45 with disposable income",
    segments: [
      "Business travelers (30%)",
      "Digital nomads (25%)",
      "Long-haul leisure travelers (35%)",
      "Wellness-focused commuters (10%)",
    ],
  },
  competitors: [
    { name: "Manta Sleep", note: "Premium positioning, $35–60. Strong brand on YouTube." },
    { name: "Nidra", note: "Budget contoured masks, $15–20. Heavy Amazon presence." },
    { name: "Ostrichpillow", note: "Lifestyle brand, broader travel accessories." },
  ],
  pricing: {
    range: "$22 – $48",
    model: "DTC one-time purchase + bundle upsells",
    notes: "Sweet spot at $29 with bundle ($59 for mask + earplugs + case).",
  },
  verdict: {
    decision: "GO",
    rationale:
      "Validated demand, clear audience, healthy margins (~70%), and room to differentiate on materials and design.",
  },
});

export function ReportView({ report }: { report: Report }) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Market report</p>
        <h2 className="font-display text-3xl md:text-4xl leading-tight">{report.idea}</h2>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card icon={<TrendingUp className="h-4 w-4" />} title="Market Demand" badge={report.demand.score}>
          <p className="text-sm text-muted-foreground">{report.demand.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {report.demand.signals.map((s) => (
              <li key={s} className="text-sm flex gap-2">
                <span className="text-muted-foreground">•</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={<Users className="h-4 w-4" />} title="Target Audience">
          <p className="text-sm font-medium">{report.audience.primary}</p>
          <ul className="mt-3 space-y-1.5">
            {report.audience.segments.map((s) => (
              <li key={s} className="text-sm text-muted-foreground">{s}</li>
            ))}
          </ul>
        </Card>

        <Card icon={<Swords className="h-4 w-4" />} title="Competitors">
          <ul className="space-y-3">
            {report.competitors.map((c) => (
              <li key={c.name}>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.note}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={<DollarSign className="h-4 w-4" />} title="Pricing" badge={report.pricing.range}>
          <p className="text-sm"><span className="text-muted-foreground">Model: </span>{report.pricing.model}</p>
          <p className="mt-2 text-sm text-muted-foreground">{report.pricing.notes}</p>
        </Card>
      </div>

      <div className="rounded-xl border bg-card p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          report.verdict.decision === "GO"
            ? "bg-success/15 text-success"
            : report.verdict.decision === "NO-GO"
            ? "bg-destructive/15 text-destructive"
            : "bg-warning/20 text-warning-foreground"
        }`}>
          <CheckCircle2 className="h-4 w-4" />
          Verdict: {report.verdict.decision}
        </div>
        <p className="text-sm text-muted-foreground">{report.verdict.rationale}</p>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center">{icon}</span>
          {title}
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
