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
    const rawIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const clientIp = rawIp.split(",")[0]?.trim() || "127.0.0.1";

    let country = req.headers.get("x-vercel-ip-country") || "";
    let region = req.headers.get("x-vercel-ip-country-region") || "";
    let city = req.headers.get("x-vercel-ip-city") || "";
    let latitude = req.headers.get("x-vercel-ip-latitude") || "";
    let longitude = req.headers.get("x-vercel-ip-longitude") || "";

    // Check if IP is public and valid
    const isPublicIp = clientIp && clientIp !== "127.0.0.1" && !clientIp.startsWith("::") && !clientIp.startsWith("10.") && !clientIp.startsWith("192.168.");

    // Query high-precision HTTPS IP Geolocation API if Vercel headers are missing or incomplete
    if (isPublicIp && (!latitude || !city || city === "Unknown City")) {
      try {
        const geoRes = await fetch(`https://ipwho.is/${clientIp}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.success) {
            city = geoData.city || city;
            region = geoData.region || region;
            country = geoData.country || country;
            latitude = geoData.latitude ? String(geoData.latitude) : latitude;
            longitude = geoData.longitude ? String(geoData.longitude) : longitude;
          }
        }
      } catch (err) {
        // Silent fallback
      }
    }

    // Clean up city/region/country formatting for dashboard
    const locationParts = [city, region, country].filter(Boolean);
    const cleanLocation = locationParts.length > 0 ? locationParts.join(", ") : "Unknown Location";

    let telegramLocation = cleanLocation;
    if (latitude && longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      telegramLocation += ` ([📍 View Map](${mapsUrl}))`;
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
        location: cleanLocation,
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
      msg += `📍 *Location:* ${telegramLocation}\n`;
      msg += `📱 *Device:* ${device}\n`;
      msg += `🌐 *Browser:* ${browser} | *OS:* ${os}\n`;
      msg += `📄 *Page:* \`${pageUrl}\``;
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
        msg += `📍 *Location:* ${telegramLocation}\n`;
        msg += `📱 *Device:* ${device} (${browser})`;
        msg += DASHBOARD_LINK;
        await sendTelegramAlert(msg);
      } else if (eventType === "CONTACT_SUBMIT") {
        let msg = `📩 *Contact Form Submitted!*\n\n`;
        if (eventData?.name) msg += `👤 *Name:* ${eventData.name}\n`;
        if (eventData?.email) msg += `📧 *Email:* ${eventData.email}\n`;
        if (eventData?.company) msg += `🏢 *Company:* ${eventData.company}\n`;
        msg += `📍 *Location:* ${telegramLocation}`;
        msg += DASHBOARD_LINK;
        await sendTelegramAlert(msg);
      } else if (eventType === "GITHUB_CLICK") {
        let msg = `🐙 *GitHub Link Clicked*\n\n`;
        if (session.recruiterRef) msg += `🏢 *Company:* \`${session.recruiterRef}\`\n`;
        msg += `📍 *Location:* ${telegramLocation}`;
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
