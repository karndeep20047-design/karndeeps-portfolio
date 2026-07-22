import { createFileRoute } from "@tanstack/react-router";
import { sessionsStore, getFormattedDate } from "@/lib/telemetry";
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

        const url = new URL(request.url);
        const selectedDate = url.searchParams.get("date") || getFormattedDate(Date.now());

        const now = Date.now();
        const activeThreshold = 30000; // Active within last 30s
        const allSessions = Array.from(sessionsStore.values());

        // Extract available unique dates
        const availableDates = Array.from(
          new Set(allSessions.map((s) => getFormattedDate(s.createdAt)))
        ).sort((a, b) => b.localeCompare(a));

        if (!availableDates.includes(getFormattedDate(now))) {
          availableDates.unshift(getFormattedDate(now));
        }

        // Filter sessions by date
        const filteredSessions = allSessions.filter(
          (s) => getFormattedDate(s.createdAt) === selectedDate
        );

        // Calculate Metrics for selected date
        const totalVisitors = new Set(filteredSessions.map((s) => s.visitorToken)).size;
        const totalSessions = filteredSessions.length;
        const activeNow = allSessions.filter((s) => now - s.lastHeartbeat <= activeThreshold).length;

        const recruiterVisits = filteredSessions.filter((s) => !!s.recruiterRef).length;
        const cvDownloads = filteredSessions.reduce(
          (acc, s) => acc + s.events.filter((e) => e.eventType === "CV_DOWNLOAD").length,
          0
        );

        const avgDurationSec =
          totalSessions > 0
            ? Math.round(filteredSessions.reduce((acc, s) => acc + s.durationSec, 0) / totalSessions)
            : 0;

        return new Response(
          JSON.stringify({
            selectedDate,
            availableDates,
            metrics: {
              totalVisitors,
              totalSessions,
              activeNow,
              recruiterVisits,
              cvDownloads,
              avgDurationSec,
            },
            sessions: filteredSessions.reverse(),
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
