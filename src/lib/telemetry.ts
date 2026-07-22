import { sendTelegramAlert } from "@/lib/telegram";

export interface SessionRecord {
  id: string;
  sessionKey: string;
  visitorToken: string;
  recruiterRef?: string;
  jobTag?: string;
  sourceTag?: string;
  isReturning: boolean;
  entryPage: string;
  exitPage: string;
  referrer: string;
  browser: string;
  os: string;
  device: string;
  screenSize: string;
  ip: string;
  location: string;
  durationSec: number;
  maxScrollDepth: number;
  lastHeartbeat: number;
  events: Array<{
    eventType: string;
    eventData?: Record<string, any>;
    pageUrl: string;
    timestamp: number;
  }>;
  createdAt: number;
  notifiedSummary?: boolean;
}

// In-memory store
export const sessionsStore = new Map<string, SessionRecord>();

// Helper to format YYYY-MM-DD
export function getFormattedDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toISOString().split("T")[0];
}

const DASHBOARD_LINK = "\n\n📊 [Open Admin Dashboard](https://karndeeps-portfolio.vercel.app/admin/analytics)";

export async function processTrackEvent(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionKey,
      visitorToken,
      recruiterRef,
      jobTag,
      sourceTag,
      isReturning,
      eventType,
      eventData,
      pageUrl,
      referrer,
      browser,
      os,
      device,
      screenSize,
      scrollDepth,
    } = body;

    if (!sessionKey) {
      return new Response(JSON.stringify({ error: "Missing sessionKey" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Geolocation from Vercel / Cloudflare edge headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const country = req.headers.get("x-vercel-ip-country") || "";
    const region = req.headers.get("x-vercel-ip-country-region") || "";
    const city = req.headers.get("x-vercel-ip-city") || "";
    let latitude = req.headers.get("x-vercel-ip-latitude") || "";
    let longitude = req.headers.get("x-vercel-ip-longitude") || "";

    // If Vercel lat/long headers aren't present (e.g. standard Vercel hobby tier), query IP API
    if ((!latitude || !longitude) && clientIp !== "127.0.0.1" && !clientIp.startsWith("::")) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city,lat,lon,isp,org`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            latitude = geoData.lat;
            longitude = geoData.lon;
          }
        }
      } catch (err) {
        // Fallback silently if rate limited
      }
    }

    let location = [city, region, country].filter(Boolean).join(", ") || "Unknown Location";
    if (latitude && longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      location += ` ([📍 View Map](${mapsUrl}))`;
    }

    const now = Date.now();
    let session = sessionsStore.get(sessionKey);

    if (!session) {
      session = {
        id: sessionKey,
        sessionKey,
        visitorToken,
        recruiterRef: recruiterRef || undefined,
        jobTag: jobTag || undefined,
        sourceTag: sourceTag || undefined,
        isReturning: !!isReturning,
        entryPage: pageUrl || "/",
        exitPage: pageUrl || "/",
        referrer: referrer || "direct",
        browser: browser || "Unknown",
        os: os || "Unknown",
        device: device || "Desktop",
        screenSize: screenSize || "",
        ip: clientIp,
        location,
        durationSec: 0,
        maxScrollDepth: scrollDepth || 0,
        lastHeartbeat: now,
        events: [],
        createdAt: now,
      };
      sessionsStore.set(sessionKey, session);

      // Trigger Telegram notification for ALL new visitor sessions (Recruiter or Normal Visitor)
      let msg = recruiterRef
        ? `🎯 *Recruiter Visit Detected!*\n\n🏢 *Company/Ref:* \`${recruiterRef}\`\n`
        : `👀 *New Portfolio Visitor!*\n\n`;

      if (jobTag) msg += `💼 *Job:* \`${jobTag}\`\n`;
      if (sourceTag) msg += `🔗 *Source:* \`${sourceTag}\`\n`;
      msg += `📍 *Location:* ${location}\n`;
      msg += `💻 *Device:* ${device} (${browser} on ${os})\n`;
      msg += `🌐 *Page:* \`${pageUrl}\``;
      msg += DASHBOARD_LINK;

      await sendTelegramAlert(msg);
    } else {
      // Update session metrics
      session.exitPage = pageUrl || session.exitPage;
      session.lastHeartbeat = now;
      session.durationSec = Math.round((now - session.createdAt) / 1000);
      if (scrollDepth > session.maxScrollDepth) {
        session.maxScrollDepth = scrollDepth;
      }
    }

    // Log event to session timeline (excluding simple HEARTBEAT loops)
    if (eventType !== "HEARTBEAT") {
      session.events.push({
        eventType,
        eventData,
        pageUrl,
        timestamp: now,
      });

      // Instant notifications for high-priority actions
      if (eventType === "CV_DOWNLOAD") {
        let msg = `📄 *CV Downloaded!*\n\n`;
        if (session.recruiterRef) msg += `🏢 *Company:* \`${session.recruiterRef}\`\n`;
        msg += `📍 *Location:* ${location}\n`;
        msg += `💻 *Device:* ${device} (${browser})`;
        msg += DASHBOARD_LINK;
        await sendTelegramAlert(msg);
      } else if (eventType === "CONTACT_SUBMIT") {
        let msg = `📩 *Contact Form Submitted!*\n\n`;
        if (eventData?.name) msg += `👤 *Name:* ${eventData.name}\n`;
        if (eventData?.email) msg += `📧 *Email:* ${eventData.email}\n`;
        if (eventData?.company) msg += `🏢 *Company:* ${eventData.company}\n`;
        msg += `📍 *Location:* ${location}`;
        msg += DASHBOARD_LINK;
        await sendTelegramAlert(msg);
      } else if (eventType === "GITHUB_CLICK") {
        let msg = `🐙 *GitHub Link Clicked*\n\n`;
        if (session.recruiterRef) msg += `🏢 *Company:* \`${session.recruiterRef}\`\n`;
        msg += `📍 *Location:* ${location}`;
        msg += DASHBOARD_LINK;
        await sendTelegramAlert(msg);
      }
    }

    return new Response(JSON.stringify({ success: true, sessionId: sessionKey }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
