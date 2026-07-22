import { createFileRoute } from "@tanstack/react-router";
import { processTrackEvent } from "@/lib/telemetry";

export const Route = createFileRoute("/api/analytics/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return processTrackEvent(request);
      },
    },
  },
});
