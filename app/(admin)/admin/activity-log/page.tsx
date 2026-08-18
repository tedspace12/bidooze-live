"use client";

import { memo, useMemo, useState } from "react";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import type { ActivityLogDetail, ActivityLogItem } from "@/features/admin/services/adminService";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Filter,
  Lock,
  LogIn,
  LogOut,
  RotateCcw,
  Settings,
  ShieldOff,
  Trash,
  Unlock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ActivityListResponse = {
  data: ActivityLogItem[];
  links: { first?: string; last?: string; prev?: string | null; next?: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

const activityIconMap: Record<string, { icon: typeof CheckCircle; color: string }> = {
  approve: { icon: CheckCircle, color: "text-green-600" },
  reject: { icon: XCircle, color: "text-red-600" },
  update: { icon: Edit, color: "text-blue-600" },
  delete: { icon: Trash, color: "text-red-600" },
  login: { icon: LogIn, color: "text-green-600" },
  logout: { icon: LogOut, color: "text-slate-500" },
  force_logout: { icon: ShieldOff, color: "text-orange-600" },
  suspend: { icon: Lock, color: "text-orange-600" },
  restore: { icon: Unlock, color: "text-green-600" },
  system: { icon: Settings, color: "text-slate-600" },
  security_alert: { icon: AlertTriangle, color: "text-orange-600" },
};

function getActionIcon(action: string) {
  const key = action.toLowerCase();
  return activityIconMap[key] || activityIconMap.system;
}

function formatDateLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function groupByDate(items: ActivityLogItem[]) {
  const groups: Record<string, ActivityLogItem[]> = {};
  items.forEach((item) => {
    const key = new Date(item.created_at).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).map(([key, value]) => ({
    key,
    label: formatDateLabel(new Date(key)),
    items: value.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
  }));
}

function ActivityStatusBadge({ status }: { status: ActivityLogItem["status"] }) {
  const styles =
    status === "success"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "failed"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-orange-100 text-orange-700 border-orange-200";
  return <Badge className={`rounded-full ${styles}`}>{status}</Badge>;
}

function ActivityIcon({ action }: { action: string }) {
  const { icon: Icon, color } = getActionIcon(action);
  return (
    <div className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center">
      <Icon className={`h-4 w-4 ${color}`} aria-hidden />
    </div>
  );
}

function ActivityDetailPanel({ detail }: { detail: ActivityLogDetail }) {
  return (
    <div className="mt-3 rounded-lg border bg-slate-50/70 p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</p>
          <p className="text-sm text-slate-700">{new Date(detail.created_at).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</p>
          <p className="text-sm text-slate-700">
            {detail.entity?.type || "unknown"} {detail.entity?.id ? `#${detail.entity.id}` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IP Address</p>
          <p className="text-sm text-slate-700">{detail.metadata?.ip_address || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Agent</p>
          <p className="text-sm text-slate-700 wrap-break-word">{detail.metadata?.user_agent || "N/A"}</p>
        </div>
      </div>
      {(detail.note || detail.reason) && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note</p>
            <p className="text-sm text-slate-700">{detail.note || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</p>
            <p className="text-sm text-slate-700">{detail.reason || "—"}</p>
          </div>
        </div>
      )}
      {detail.diff && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Before</p>
            <pre className="mt-2 rounded-md border bg-white p-3 text-xs leading-relaxed overflow-auto">
              {JSON.stringify(detail.diff.before, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">After</p>
            <pre className="mt-2 rounded-md border bg-white p-3 text-xs leading-relaxed overflow-auto">
              {JSON.stringify(detail.diff.after, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

const ActivityItem = memo(function ActivityItem({
  item,
  expanded,
  onToggle,
}: {
  item: ActivityLogItem;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const { useActivityLogDetail } = useAdmin();
  const { data: detail, isLoading } = useActivityLogDetail(item.id, expanded && item.has_details);

  return (
    <div className="relative">
      <div className="absolute left-2 top-2 h-full w-0.5 bg-slate-200" aria-hidden />
      <div className="relative pl-10">
        <div className="absolute left-0 top-1">
          <ActivityIcon action={item.action} />
        </div>
        <Card className="border border-slate-200/70 bg-white/90 p-4 shadow-sm transition-colors hover:border-slate-300">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-800">
                <span className="font-semibold">{item.actor.name}</span> {item.summary}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {item.actor.role} · {new Date(item.created_at).toLocaleTimeString()} ·{" "}
                <ActivityStatusBadge status={item.status} />
              </p>
            </div>
            {item.has_details && (
              <Collapsible open={expanded} onOpenChange={() => onToggle(item.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900"
                    aria-label={expanded ? "Collapse details" : "View details"}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    {expanded ? "Hide details" : "View details"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {isLoading ? (
                    <div className="mt-3 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : detail ? (
                    <ActivityDetailPanel detail={detail} />
                  ) : null}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
});

function ActivityDateGroup({
  label,
  items,
  expandedId,
  onToggle,
}: {
  label: string;
  items: ActivityLogItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="sticky top-24 z-0">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          {label}
        </span>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <ActivityItem
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

type Filters = {
  date_from: string;
  date_to: string;
  action: string;
  entity_type: string;
  search: string;
};

const defaultFilters: Filters = {
  date_from: "",
  date_to: "",
  action: "all",
  entity_type: "all",
  search: "",
};

function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.date_from) count++;
  if (filters.date_to) count++;
  if (filters.action !== "all") count++;
  if (filters.entity_type !== "all") count++;
  return count;
}

function FilterSheet({
  filters,
  actions,
  entities,
  onApply,
}: {
  filters: Filters;
  actions: string[];
  entities: string[];
  onApply: (next: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const activeCount = countActiveFilters(filters);

  const handleOpen = (v: boolean) => {
    if (v) setDraft(filters);
    setOpen(v);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleReset = () => setDraft({ ...defaultFilters, search: filters.search });

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl flex flex-col sm:right-0 sm:left-auto sm:w-[400px] sm:h-full sm:rounded-none sm:rounded-l-2xl"
      >
        <SheetHeader className="pb-4 border-b shrink-0 px-6 pt-6">
          <SheetTitle className="flex items-center justify-between text-base font-semibold">
            Filter Activity Logs
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground text-xs h-7"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-6">
          {/* Date range */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Range</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm">From</Label>
                <Input
                  type="date"
                  value={draft.date_from}
                  onChange={(e) => setDraft((d) => ({ ...d, date_from: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">To</Label>
                <Input
                  type="date"
                  value={draft.date_to}
                  onChange={(e) => setDraft((d) => ({ ...d, date_to: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</p>
            <Select value={draft.action} onValueChange={(v) => setDraft((d) => ({ ...d, action: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entity Type */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity Type</p>
            <Select value={draft.entity_type} onValueChange={(v) => setDraft((d) => ({ ...d, entity_type: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entities.map((entity) => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t shrink-0 px-6 pb-6">
          <Button className="w-full" size="lg" onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function ActivityLogPage() {
  const { useActivityLogs } = useAdmin();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [search, setSearch] = useState("");

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 15,
      action: filters.action === "all" ? undefined : filters.action,
      entity_type: filters.entity_type === "all" ? undefined : filters.entity_type,
      search: search || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
    }),
    [page, filters, search]
  );

  const { data, isLoading } = useActivityLogs(queryParams);
  const response = data as ActivityListResponse | undefined;
  const items = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = response?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 };

  const grouped = useMemo(() => groupByDate(items), [items]);
  const actions = useMemo(() => Array.from(new Set(items.map((item) => item.action))).sort(), [items]);
  const entities = useMemo(() => Array.from(new Set(items.map((item) => item.entity.type))).sort(), [items]);

  const handleToggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleApplyFilters = (next: Filters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-800">Activity Log</h1>
        <p className="text-slate-600">Operational and security events across the platform.</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search summary or actor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 pr-4"
            aria-label="Search activity logs"
          />
        </div>
        <FilterSheet
          filters={filters}
          actions={actions}
          entities={entities}
          onApply={handleApplyFilters}
        />
      </div>

      {/* Active filter chips */}
      {countActiveFilters(filters) > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.date_from && (
            <Badge variant="outline" className="gap-1 text-xs">
              From: {filters.date_from}
              <button onClick={() => setFilters((f) => ({ ...f, date_from: "" }))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.date_to && (
            <Badge variant="outline" className="gap-1 text-xs">
              To: {filters.date_to}
              <button onClick={() => setFilters((f) => ({ ...f, date_to: "" }))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.action !== "all" && (
            <Badge variant="outline" className="gap-1 text-xs">
              Action: {filters.action}
              <button onClick={() => setFilters((f) => ({ ...f, action: "all" }))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.entity_type !== "all" && (
            <Badge variant="outline" className="gap-1 text-xs">
              Entity: {filters.entity_type}
              <button onClick={() => setFilters((f) => ({ ...f, entity_type: "all" }))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline"
            onClick={() => setFilters(defaultFilters)}
          >
            Clear all
          </button>
        </div>
      )}

      <div className="pb-2">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-10 text-center">
            <Filter className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-700">No activity logs found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <ActivityDateGroup
                key={group.key}
                label={group.label}
                items={group.items}
                expandedId={expandedId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {items.length} of {meta.total} entries</span>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.current_page <= 1}>
              Previous
            </Button>
            <span className="text-sm">Page {meta.current_page} of {meta.last_page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={meta.current_page >= meta.last_page}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
