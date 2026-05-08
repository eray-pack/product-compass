import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Snowflake } from "lucide-react";

export const Route = createFileRoute("/tools/cold")({
  component: Cold,
});

function Cold() {
  return (
    <div className="min-h-screen mx-auto max-w-md px-6 pt-10 pb-12">
      <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-6 text-center">
        <Snowflake className="h-10 w-10 text-primary mx-auto" />
        <h1 className="mt-3 text-2xl font-semibold">Cold Exposure</h1>
        <p className="mt-2 text-sm text-muted-foreground">2 minutes of guided breathing for the cold shower.</p>
      </div>
      <ol className="mt-8 space-y-4 text-sm">
        {[
          "Step in. Don't brace — let the water hit your chest.",
          "Inhale for 4 seconds through your nose.",
          "Exhale slowly for 6 seconds through your mouth.",
          "After 60 seconds, turn your back to the stream.",
          "At 90 seconds, breathe normally and scan your body.",
          "At 2 minutes — step out. You just rewired a stress response.",
        ].map((s, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <span className="h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs grid place-items-center font-semibold">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
