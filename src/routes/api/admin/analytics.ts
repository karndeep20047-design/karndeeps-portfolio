import { createFileRoute } from "@tanstack/react-router";
import { sessionsStore } from "@/lib/telemetry";
import { verifyAdminAuth } from "./login";

export const Route = createFileRoute("/api/admin/analytics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Enforce HttpOnly Cookie Authentication
        if (!verifyAdminAuth(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const now = Date.now();
        const activeThreshold = 30000; // Active within last 30s
        const sessions = Array.from(sessionsStore.values());

        // Calculate Overview Metrics
        const totalVisitors = new Set(sessions.map((s) => s.visitorToken)).size;
        const totalSessions = sessions.length;
        const activeNow = sessions.filter((s) => now - s.lastHeartbeat <= activeThreshold).length;

        const recruiterVisits = sessions.filter((s) => !!s.recruiterRef).length;
        const cvDownloads = sessions.reduce(
          (acc, s) => acc + s.events.filter((e) => e.eventType === "CV_DOWNLOAD").length,
          0
        );

        const avgDurationSec =
          totalSessions > 0
            ? Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / totalSessions)
            : 0;

        return new Response(
          JSON.stringify({
            metrics: {
              totalVisitors,
              totalSessions,
              activeNow,
              recruiterVisits,
              cvDownloads,
              avgDurationSec,
            },
            sessions: sessions.reverse(),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    },
  },
});
