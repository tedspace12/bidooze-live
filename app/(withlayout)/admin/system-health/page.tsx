"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/features/admin/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Database, Server, HardDrive, RefreshCw, ShieldCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SystemHealthPage() {
  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: () => adminService.getSystemHealth(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Degraded</Badge>;
      case "down":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Down</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds == null) return "N/A";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (hrs) parts.push(`${hrs}h`);
    if (mins) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(" ");
  };

  const formatBytes = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let num = value;
    let unit = 0;
    while (num >= 1024 && unit < units.length - 1) {
      num /= 1024;
      unit += 1;
    }
    return `${num.toFixed(1)} ${units[unit]}`;
  };

  const getConnectionLabel = (connected: boolean | null | undefined) => {
    if (connected == null) return "Unknown";
    return connected ? "Connected" : "Disconnected";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">System Health</h1>
          <p className="text-slate-600">Real-time status of platform services and infrastructure.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div>{getStatusBadge(health?.application?.status || "unknown")}</div>}
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {formatDuration(health?.application?.uptime_seconds)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                {getStatusBadge(health?.database?.status || "unknown")}
                <span className="text-xs text-muted-foreground">
                  {getConnectionLabel(health?.database?.connection)}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Response time: {health?.database?.response_time_ms ?? "N/A"} ms</div>
              <div>Total tables: {health?.database?.total_tables ?? "N/A"}</div>
              <div>Failed queries (24h): {health?.database?.failed_queries_last_24h ?? "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                {getStatusBadge(health?.cache?.status || "unknown")}
                <span className="text-xs text-muted-foreground">
                  {getConnectionLabel(health?.cache?.connection)}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Driver: {health?.cache?.driver || "N/A"}</div>
              <div>Response time: {health?.cache?.response_time_ms ?? "N/A"} ms</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                {getStatusBadge(health?.storage?.status || "unknown")}
                <span className="text-xs text-muted-foreground">
                  Usage: {health?.storage?.usage_percentage ?? "N/A"}%
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Total: {formatBytes(health?.storage?.total_disk_space)}</div>
              <div>Used: {formatBytes(health?.storage?.used_disk_space)}</div>
              <div>Free: {formatBytes(health?.storage?.free_disk_space)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                {getStatusBadge(health?.queue?.status || "unknown")}
                <span className="text-xs text-muted-foreground">
                  Pending: {health?.queue?.pending_jobs ?? "N/A"}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Default queue: {health?.queue?.default_queue || "N/A"}</div>
              <div>Failed jobs (24h): {health?.queue?.failed_jobs_last_24h ?? "N/A"}</div>
              <div>Last processed: {health?.queue?.last_job_processed_at ? new Date(health.queue.last_job_processed_at).toLocaleString() : "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduler</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                {getStatusBadge(health?.scheduler?.status || "unknown")}
                <span className="text-xs text-muted-foreground">
                  {health?.scheduler?.scheduler_running ? "Running" : "Stopped"}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Last run: {health?.scheduler?.last_run_at ? new Date(health.scheduler.last_run_at).toLocaleString() : "N/A"}</div>
              <div>Missed runs: {health?.scheduler?.missed_runs_count ?? "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                {getStatusBadge(health?.security?.status || "unknown")}
                <span className="text-xs text-muted-foreground">
                  Admin logins (24h): {health?.security?.admin_logins_last_24h ?? "N/A"}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Failed logins (24h): {health?.security?.failed_admin_logins_last_24h ?? "N/A"}</div>
              <div>Forced logouts (24h): {health?.security?.forced_logouts_last_24h ?? "N/A"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
