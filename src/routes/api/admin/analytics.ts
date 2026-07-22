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

        // Group sessions by Visitor / Company (visitorToken or recruiterRef)
        const groupedMap = new Map<string, {
          groupKey: string;
          recruiterRef?: string;
          visitorToken: string;
          location: string;
          device: string;
          browser: string;
          os: string;
          totalDurationSec: number;
          maxScrollDepth: number;
          lastActiveTime: number;
          sessionsCount: number;
          sessions: typeof filteredSessions;
        }>();

        for (const s of filteredSessions) {
          const groupKey = s.recruiterRef ? `ref:${s.recruiterRef}` : `vis:${s.visitorToken}`;
          let group = groupedMap.get(groupKey);

          if (!group) {
            group = {
              groupKey,
              recruiterRef: s.recruiterRef,
              visitorToken: s.visitorToken,
              location: s.location,
              device: s.device,
              browser: s.browser,
              os: s.os,
              totalDurationSec: 0,
              maxScrollDepth: 0,
              lastActiveTime: s.lastHeartbeat || s.createdAt,
              sessionsCount: 0,
              sessions: [],
            };
            groupedMap.set(groupKey, group);
          }

          group.totalDurationSec += s.durationSec;
          group.sessionsCount += 1;
          if (s.maxScrollDepth > group.maxScrollDepth) {
            group.maxScrollDepth = s.maxScrollDepth;
          }
          if (s.lastHeartbeat > group.lastActiveTime) {
            group.lastActiveTime = s.lastHeartbeat;
          }
          group.sessions.push(s);
        }

        // Sort grouped visitors: Most recently active visitor is pushed to TOP
        const groupedVisitors = Array.from(groupedMap.values()).sort(
          (a, b) => b.lastActiveTime - a.lastActiveTime
        );

        // Calculate Metrics
        const totalVisitors = groupedVisitors.length;
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
            groupedVisitors,
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
