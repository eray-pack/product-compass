import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { ReportHistorySidebar } from "@/components/ReportHistorySidebar";
import { ReportView, mockReport, type Report } from "@/components/ReportView";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Marketscope — Instant market research for your product idea" },
      {
        name: "description",
        content:
          "Validate any product idea in seconds. Get demand, audience, competitors, pricing, and a clear go/no-go verdict.",
      },
    ],
  }),
});

function Index() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setReport(null);
    setTimeout(() => {
      setReport(mockReport(idea.trim()));
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ReportHistorySidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 px-6 flex items-center justify-between border-b">
          <div className="text-sm text-muted-foreground">
            {report ? "Report ready" : loading ? "Analyzing…" : "New research"}
          </div>
          <button className="text-sm font-medium px-4 py-1.5 rounded-md border hover:bg-accent transition">
            Sign In
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
            {!report && !loading && (
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground mb-5">
                  <Sparkles className="h-3 w-3" />
                  Validate ideas in seconds
                </div>
                <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
                  What are you thinking of building?
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Get a focused market report — demand, audience, competitors, pricing, and a verdict.
                </p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3">
              <div className="relative">
                <input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Enter your product idea (e.g. sleep masks for travelers)"
                  className="w-full h-14 px-5 pr-14 rounded-xl border bg-card text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !idea.trim()}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating report…
                  </>
                ) : (
                  <>
                    Generate Report
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10">
              {loading && <LoadingSkeleton />}
              {report && !loading && <ReportView report={report} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-2/3 bg-muted rounded" />
      <div className="grid md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-20 rounded-xl bg-muted" />
    </div>
  );
}
