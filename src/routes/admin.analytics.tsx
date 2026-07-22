import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, Fragment } from "react";
import {
  Users,
  Activity,
  Briefcase,
  FileDown,
  Clock,
  Globe,
  ChevronDown,
  ChevronRight,
  Lock,
  RefreshCw,
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
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Check auth on load by fetching analytics
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      if (res.status === 401) {
        setIsAuthenticated(false);
      } else if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
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
          className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-8 shadow-2xl backdrop-blur-xl"
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
  const sessions = data?.sessions || [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 text-foreground font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight mt-1">
              Visitor & Recruiter Analytics
            </h1>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <MetricCard
            title="Total Visitors"
            value={metrics.totalVisitors || 0}
            icon={Users}
            subtitle={`${metrics.totalSessions || 0} Total Sessions`}
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

        {/* Sessions Table */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl">
          <div className="border-b border-border/80 px-6 py-4">
            <h2 className="font-display text-lg font-medium">Session History & Timelines</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-6 py-3">Visitor / Ref</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Device / OS</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Max Scroll</th>
                  <th className="px-6 py-3">Events</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-xs">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No visitor sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s: any) => {
                    const isExpanded = expandedSession === s.id;
                    return (
                      <React.Fragment key={s.id}>
                        <tr
                          onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              {s.recruiterRef ? (
                                <span className="rounded-md bg-orange-500/10 px-2 py-1 font-semibold text-orange-500 border border-orange-500/20">
                                  🏢 {s.recruiterRef}
                                </span>
                              ) : (
                                <span className="text-foreground">{s.visitorToken.substring(0, 10)}...</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{s.location}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {s.device} ({s.browser})
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">{s.durationSec}s</td>
                          <td className="px-6 py-4 text-muted-foreground">{s.maxScrollDepth}%</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                              {s.events.length} events
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(s.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="px-8 py-4">
                              <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2">
                                <h4 className="font-sans font-semibold text-sm mb-3">
                                  Session Replay Timeline Stream
                                </h4>
                                {s.events.map((e: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 text-xs border-l-2 border-primary/40 pl-3 py-1"
                                  >
                                    <span className="text-muted-foreground">
                                      {new Date(e.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className="font-semibold text-primary">{e.eventType}</span>
                                    <span className="text-muted-foreground">Path: {e.pageUrl}</span>
                                    {e.eventData && (
                                      <span className="text-muted-foreground italic">
                                        {JSON.stringify(e.eventData)}
                                      </span>
                                    )}
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
      className={`rounded-2xl border bg-card p-6 shadow-md transition-all ${
        highlight ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-border/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
