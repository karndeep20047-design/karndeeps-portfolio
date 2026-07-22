import { sendTelegramAlert } from "@/lib/telegram";
import { Redis } from "@upstash/redis";

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

// Upstash Redis client with fallback to in-memory Map
let redis: Redis | null = null;
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.STORAGE_UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.STORAGE_UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

// In-memory fallback
export const sessionsStore = new Map<string, SessionRecord>();

// Save session
export async function saveSession(session: SessionRecord) {
  sessionsStore.set(session.sessionKey, session);
  if (redis) {
    try {
      await redis.set(`session:${session.sessionKey}`, session);
      await redis.sadd("sessions_keys", session.sessionKey);
    } catch (err) {
      console.error("Redis save session error:", err);
    }
  }
}

// Get all sessions from Redis (or memory fallback)
export async function getAllSessions(): Promise<SessionRecord[]> {
  if (redis) {
    try {
      const keys = await redis.smembers("sessions_keys");
      if (keys && keys.length > 0) {
        const sessionKeys = keys.map((k) => `session:${k}`);
        const records = await redis.mget<SessionRecord[]>(...sessionKeys);
        return records.filter(Boolean);
      }
    } catch (err) {
      console.error("Redis get all sessions error:", err);
    }
  }
  return Array.from(sessionsStore.values());
}

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
    
    // Fetch existing session from Redis or Memory
    let session: SessionRecord | null = null;
    if (redis) {
      try {
        session = await redis.get<SessionRecord>(`session:${sessionKey}`);
      } catch (e) {}
    }
    if (!session) {
      session = sessionsStore.get(sessionKey) || null;
    }

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
      await saveSession(session);

      // Trigger Telegram notification for ALL new visitor sessions (Recruiter or Normal Visitor)
      let msg = recruiterRef
        ? `🎯 *Recruiter Visit Detected!*\n\n🏢 *Company/Ref:* \`${recruiterRef}\`\n`
        : `👀 *New Portfolio Visitor!*\n\n`;

      if (jobTag) msg += `💼 *Job:* \`${jobTag}\`\n`;
      if (sourceTag) msg += `🔗 *Source:* \`${sourceTag}\`\n`;
      msg += `📍 *Location:* ${telegramLocation}\n`;
      msg += `🌐 *IP Address:* \`${clientIp}\`\n`;
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
      await saveSession(session);
    }

    // Log event to session timeline (excluding simple HEARTBEAT loops)
    if (eventType !== "HEARTBEAT") {
      session.events.push({
        eventType,
        eventData,
        pageUrl,
        timestamp: now,
      });
      await saveSession(session);

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
