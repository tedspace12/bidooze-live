import type { Announcement } from "@/lib/miscellaneous/types";
import announcementsData from "@/app/(withlayout)/miscellaneous/announcements/data/announcements.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Parses **bold** markers into <strong> nodes — handles all body_md patterns in the JSON.
function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AnnouncementsFeed() {
  const data = (announcementsData as Announcement[]).slice().sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const latest = data[0];
  const oldest = data[data.length - 1];

  return (
    <div className="mt-6">
      {/* Summary banner */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/60 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Platform changelog</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.length} release{data.length !== 1 ? "s" : ""} since{" "}
            {formatMonthYear(oldest.date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded border border-green-700/25 bg-green-700/10 px-2 py-0.5 text-xs font-semibold text-green-700">
            v{latest.version}
          </span>
          <span className="text-xs text-muted-foreground">Latest</span>
        </div>
      </div>

      {/* Feed */}
      <div className="relative">
        {/* Vertical timeline rule */}
        <div className="absolute left-22 top-2 hidden h-full w-px bg-border/40 sm:block" />

        <div className="space-y-0">
          {data.map((ann, index) => (
            <AnnouncementEntry
              key={ann.id}
              ann={ann}
              isLatest={index === 0}
              isLast={index === data.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Entry ─────────────────────────────────────────────────────────────────────

function AnnouncementEntry({
  ann,
  isLatest,
  isLast,
}: {
  ann: Announcement;
  isLatest: boolean;
  isLast: boolean;
}) {
  return (
    <div className={`relative flex flex-col gap-4 pb-8 sm:flex-row sm:gap-8 ${isLast ? "pb-0" : ""}`}>
      {/* Left column — date + version */}
      <div className="flex shrink-0 items-center gap-3 sm:w-22 sm:flex-col sm:items-end sm:gap-1.5">
        <time className="text-[11px] font-medium text-muted-foreground sm:text-right sm:text-[10px] sm:leading-snug">
          {new Date(ann.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          <br className="hidden sm:block" />
          <span className="hidden sm:inline text-[10px]">
            {new Date(ann.date).getFullYear()}
          </span>
          <span className="sm:hidden">{" · "}</span>
          <span className="sm:hidden font-mono">{ann.version}</span>
        </time>
        <span className="hidden rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline">
          v{ann.version}
        </span>
      </div>

      {/* Timeline dot */}
      <div className="absolute left-22 top-1.5 hidden h-2 w-2 -translate-x-1/2 rounded-full sm:block"
        style={{
          background: isLatest ? "var(--color-green-700)" : "var(--color-border)",
          outline: "3px solid var(--color-background)",
        }}
      />

      {/* Right column — content */}
      <div className="flex-1 min-w-0 sm:pl-5">
        {isLatest && (
          <span className="mb-2 inline-block rounded border border-green-700/25 bg-green-700/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-green-700">
            Latest
          </span>
        )}
        <h3 className="text-base font-semibold text-foreground">{ann.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          <InlineMd text={ann.body_md} />
        </p>

        {/* Tags */}
        {ann.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ann.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
