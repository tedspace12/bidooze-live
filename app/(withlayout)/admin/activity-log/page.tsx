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
  Lock,
  LogIn,
  LogOut,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const activityIconMap: Record<
  string,
  { icon: typeof CheckCircle; color: string }
> = {
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
          <p className="text-sm text-slate-700 break-words">{detail.metadata?.user_agent || "N/A"}</p>
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
        <Card
          className="border border-slate-200/70 bg-white/90 p-4 shadow-sm transition-colors hover:border-slate-300"
        >
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
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
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

function ActivityFilterBar({
  filters,
  actions,
  entities,
  onChange,
}: {
  filters: {
    date_from: string;
    date_to: string;
    action: string;
    entity_type: string;
    search: string;
  };
  actions: string[];
  entities: string[];
  onChange: (next: Partial<{
    date_from: string;
    date_to: string;
    action: string;
    entity_type: string;
    search: string;
  }>) => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">From</label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => onChange({ date_from: e.target.value })}
              className="h-9 w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">To</label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => onChange({ date_to: e.target.value })}
              className="h-9 w-40"
            />
          </div>
          <Select
            value={filters.action}
            onValueChange={(value) => onChange({ action: value })}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.entity_type}
            onValueChange={(value) => onChange({ entity_type: value })}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {entities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full lg:w-80">
          <Input
            placeholder="Search summary or actor..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="h-9"
            aria-label="Search activity logs"
          />
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogPage() {
  const { useActivityLogs } = useAdmin();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    action: "all",
    entity_type: "all",
    search: "",
  });

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 15,
      action: filters.action === "all" ? undefined : filters.action,
      entity_type: filters.entity_type === "all" ? undefined : filters.entity_type,
      search: filters.search || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
    }),
    [page, filters]
  );

  const { data, isLoading } = useActivityLogs(queryParams);
  const response = data as ActivityListResponse | undefined;
  const items = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = response?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 };

  const grouped = useMemo(() => groupByDate(items), [items]);
  const actions = useMemo(
    () => Array.from(new Set(items.map((item) => item.action))).sort(),
    [items]
  );
  const entities = useMemo(
    () => Array.from(new Set(items.map((item) => item.entity.type))).sort(),
    [items]
  );

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-800">Activity Log</h1>
        <p className="text-slate-600 mt-1">
          Operational and security events across the platform.
        </p>
      </div>

      <ActivityFilterBar
        filters={filters}
        actions={actions}
        entities={entities}
        onChange={(next) => {
          setFilters((prev) => ({ ...prev, ...next }));
          setPage(1);
        }}
      />

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No activity logs found.
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

        <div className="flex items-center justify-between border-t pt-4 mt-6 text-sm text-slate-600">
          <span>
            Showing {items.length} of {meta.total} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page >= meta.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
