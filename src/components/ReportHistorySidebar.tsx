import { Clock, Plus, Search } from "lucide-react";

const history = [
  "Sleep masks for travelers",
  "Eco-friendly dog toys",
  "AI resume builder",
  "Subscription coffee for offices",
  "Standing desk converters",
];

export function ReportHistorySidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-sidebar-accent flex items-center justify-center">
            <Search className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold tracking-tight">Marketscope</span>
        </div>
      </div>

      <div className="px-3 py-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent hover:opacity-90 text-sm transition">
          <Plus className="h-4 w-4" />
          New report
        </button>
      </div>

      <div className="px-5 pt-3 pb-2 text-xs uppercase tracking-wider text-sidebar-foreground/50">
        Report History
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {history.map((item, i) => (
          <button
            key={i}
            className="w-full flex items-start gap-2 px-3 py-2 rounded-md text-sm text-left hover:bg-sidebar-accent transition"
          >
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-sidebar-foreground/50" />
            <span className="line-clamp-1">{item}</span>
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
        Demo data · v0.1
      </div>
    </aside>
  );
}
