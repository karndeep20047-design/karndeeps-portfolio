import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Briefcase,
  FileDown,
  ChevronDown,
  ChevronRight,
  Lock,
  RefreshCw,
  Calendar,
  Clock,
  Repeat,
} from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null);

  // Check auth on load
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (dateToFetch?: string) => {
    try {
      setLoading(true);
      const queryDate = dateToFetch !== undefined ? dateToFetch : selectedDate;
      const url = queryDate ? `/api/admin/analytics?date=${queryDate}` : "/api/admin/analytics";

      const res = await fetch(url);
      if (res.status === 401) {
        setIsAuthenticated(false);
      } else if (res.ok) {
        const json = await res.json();
        setData(json);
        setSelectedDate(json.selectedDate);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchAnalytics(newDate);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        fetchAnalytics();
      } else {
        const errJson = await res.json();
        setLoginError(errJson.error || "Invalid Password");
      }
    } catch (err: any) {
      setLoginError("Login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your secure admin password to access analytics
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {loginError && <p className="text-xs text-destructive">{loginError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const groupedVisitors: any[] = data?.groupedVisitors || [];
  const availableDates: string[] = data?.availableDates || [selectedDate];
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background p-4 md:p-12 text-foreground font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </div>
            <h1 className="font-display text-2.5xl md:text-5xl font-medium tracking-tight mt-1">
              Visitor Analytics
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Date Filter Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-foreground focus:outline-none cursor-pointer"
              >
                {availableDates.map((d) => (
                  <option key={d} value={d} className="bg-background text-foreground">
                    {d} {d === new Date().toISOString().split("T")[0] ? "(Today)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchAnalytics()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-8 md:mb-10">
          <MetricCard
            title={isToday ? "Visitors Today" : `Visitors (${selectedDate})`}
            value={metrics.totalVisitors || 0}
            icon={Users}
            subtitle={`${metrics.totalSessions || 0} Total Visits`}
          />
          <MetricCard
            title="Active Now"
            value={metrics.activeNow || 0}
            icon={Activity}
            subtitle="Live Heartbeat Status"
            highlight={metrics.activeNow > 0}
          />
          <MetricCard
            title="Recruiter Visits"
            value={metrics.recruiterVisits || 0}
            icon={Briefcase}
            subtitle="Tagged Campaign Links"
          />
          <MetricCard
            title="CV Downloads"
            value={metrics.cvDownloads || 0}
            icon={FileDown}
            subtitle={`Avg Stay: ${metrics.avgDurationSec || 0}s`}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl">
          <div className="border-b border-border/80 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-medium">
                Visitor & Company History ({selectedDate})
              </h2>
              <p className="text-xs text-muted-foreground">
                Ranked by latest activity. Repeating visits are merged cleanly.
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {groupedVisitors.length} Unique Visitor{groupedVisitors.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-6 py-3">Visitor / Company</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Device / OS</th>
                  <th className="px-6 py-3">Total Time Spent</th>
                  <th className="px-6 py-3">Max Scroll</th>
                  <th className="px-6 py-3">Visits Count</th>
                  <th className="px-6 py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-xs">
                {groupedVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No visitor activity recorded for {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  groupedVisitors.map((v: any) => {
                    const isExpanded = expandedVisitor === v.groupKey;
                    const formatDuration = (sec: number) => {
                      if (sec < 60) return `${sec}s`;
                      const m = Math.floor(sec / 60);
                      const s = sec % 60;
                      return `${m}m ${s}s`;
                    };

                    return (
                      <React.Fragment key={v.groupKey}>
                        <tr
                          onClick={() => setExpandedVisitor(isExpanded ? null : v.groupKey)}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              {v.recruiterRef ? (
                                <span className="rounded-md bg-orange-500/10 px-2.5 py-1 font-semibold text-orange-500 border border-orange-500/20">
                                  🏢 {v.recruiterRef}
                                </span>
                              ) : (
                                <span className="font-semibold text-foreground">
                                  👤 {v.visitorToken.substring(0, 10)}...
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{v.location}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {v.device} ({v.browser})
                          </td>
                          <td className="px-6 py-4 font-semibold text-primary">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDuration(v.totalDurationSec)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{v.maxScrollDepth}%</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                              <Repeat className="h-3 w-3" />
                              {v.sessionsCount} visit{v.sessionsCount > 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(v.lastActiveTime).toLocaleTimeString()}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="px-8 py-4">
                              <div className="rounded-xl border border-border/80 bg-background p-4 space-y-4">
                                <h4 className="font-sans font-semibold text-sm">
                                  Session History & Timeline Stream for{" "}
                                  {v.recruiterRef ? `Company (${v.recruiterRef})` : v.visitorToken}
                                </h4>

                                {v.sessions.map((session: any, sIdx: number) => (
                                  <div
                                    key={session.id || sIdx}
                                    className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border/40 pb-2">
                                      <span>
                                        Visit #{v.sessions.length - sIdx} — Started at{" "}
                                        {new Date(session.createdAt).toLocaleTimeString()}
                                      </span>
                                      <span>Duration: {formatDuration(session.durationSec)}</span>
                                    </div>

                                    <div className="space-y-1 pl-2">
                                      {session.events.map((e: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 text-xs border-l-2 border-primary/40 pl-3 py-1"
                                        >
                                          <span className="text-muted-foreground">
                                            {new Date(e.timestamp).toLocaleTimeString()}
                                          </span>
                                          <span className="font-semibold text-primary">
                                            {e.eventType}
                                          </span>
                                          <span className="text-muted-foreground">
                                            Path: {e.pageUrl}
                                          </span>
                                          {e.eventData && (
                                            <span className="text-muted-foreground italic">
                                              {JSON.stringify(e.eventData)}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card-Based Responsive View */}
        <div className="block md:hidden space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="font-display text-base font-medium">Visitor Log ({selectedDate})</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {groupedVisitors.length} Visitors
            </span>
          </div>

          {groupedVisitors.length === 0 ? (
            <div className="rounded-2xl border border-border/80 bg-card p-6 text-center text-xs text-muted-foreground">
              No visitor activity recorded for {selectedDate}.
            </div>
          ) : (
            groupedVisitors.map((v: any) => {
              const isExpanded = expandedVisitor === v.groupKey;
              const formatDuration = (sec: number) => {
                if (sec < 60) return `${sec}s`;
                const m = Math.floor(sec / 60);
                const s = sec % 60;
                return `${m}m ${s}s`;
              };

              return (
                <div
                  key={v.groupKey}
                  className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 text-xs"
                >
                  <div
                    onClick={() => setExpandedVisitor(isExpanded ? null : v.groupKey)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {v.recruiterRef ? (
                        <span className="rounded-md bg-orange-500/10 px-2 py-0.5 font-semibold text-orange-500 border border-orange-500/20">
                          🏢 {v.recruiterRef}
                        </span>
                      ) : (
                        <span className="font-semibold text-foreground">
                          👤 {v.visitorToken.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>{new Date(v.lastActiveTime).toLocaleTimeString()}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-wider">Location</span>
                      <span className="text-foreground font-medium">{v.location}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-wider">Total Time</span>
                      <span className="text-primary font-semibold">{formatDuration(v.totalDurationSec)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-wider">Device</span>
                      <span>{v.device} ({v.browser})</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-wider">Visits / Scroll</span>
                      <span>{v.sessionsCount} visit{v.sessionsCount > 1 ? "s" : ""} ({v.maxScrollDepth}%)</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t border-border/60 space-y-3">
                      <h4 className="font-semibold text-xs text-foreground">
                        Timeline Stream ({v.sessions.length} visit{v.sessions.length > 1 ? "s" : ""})
                      </h4>

                      {v.sessions.map((session: any, sIdx: number) => (
                        <div
                          key={session.id || sIdx}
                          className="rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                            <span>Visit #{v.sessions.length - sIdx} ({new Date(session.createdAt).toLocaleTimeString()})</span>
                            <span>{formatDuration(session.durationSec)}</span>
                          </div>

                          <div className="space-y-1">
                            {session.events.map((e: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex flex-col text-[11px] border-l-2 border-primary/40 pl-2 py-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-primary">{e.eventType}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(e.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <span className="text-muted-foreground text-[10px] truncate">
                                  Path: {e.pageUrl}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-4 md:p-6 shadow-md transition-all ${
        highlight ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-border/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-xs font-mono uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        <div className="grid h-7 w-7 md:h-9 md:w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
      <div className="mt-2 md:mt-3 font-display text-2xl md:text-3xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-[10px] md:text-xs text-muted-foreground truncate">{subtitle}</div>
    </div>
  );
}
