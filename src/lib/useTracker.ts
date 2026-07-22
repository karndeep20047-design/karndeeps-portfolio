import { useEffect, useRef } from "react";

const TRACKING_ENDPOINT = "/api/analytics/track";
const HEARTBEAT_INTERVAL = 15000; // 15s pulse

export interface EventPayload {
  eventType:
    | "PAGE_VIEW"
    | "CV_DOWNLOAD"
    | "PROJECT_OPEN"
    | "GITHUB_CLICK"
    | "LINKEDIN_CLICK"
    | "CONTACT_SUBMIT"
    | "TIME_SPENT"
    | "HEARTBEAT";
  eventData?: Record<string, any>;
  pageUrl?: string;
}

// Common bots & crawlers to ignore
const BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "yandexbot",
  "duckduckbot",
  "slurp",
  "baiduspider",
  "linkedinbot",
  "twitterbot",
  "facebookexternalhit",
  "slackbot",
  "discordbot",
  "telegrambot",
  "whatsapp",
  "lighthouse",
  "headlesschrome",
  "phantomjs",
];

export function useTracker() {
  const sessionInitialized = useRef(false);
  const scrollDepthRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || sessionInitialized.current) return;

    // Bot detection check
    const userAgent = navigator.userAgent.toLowerCase();
    if (BOT_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
      return;
    }

    sessionInitialized.current = true;

    // 1. Extract campaign & recruiter query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");
    const jobParam = urlParams.get("job");
    const sourceParam = urlParams.get("source");

    let recruiterRef = sessionStorage.getItem("portfolio_recruiter_ref");
    let jobTag = sessionStorage.getItem("portfolio_job_tag");
    let sourceTag = sessionStorage.getItem("portfolio_source_tag");

    if (refParam || jobParam || sourceParam) {
      if (refParam) {
        recruiterRef = refParam;
        sessionStorage.setItem("portfolio_recruiter_ref", refParam);
      }
      if (jobParam) {
        jobTag = jobParam;
        sessionStorage.setItem("portfolio_job_tag", jobParam);
      }
      if (sourceParam) {
        sourceTag = sourceParam;
        sessionStorage.setItem("portfolio_source_tag", sourceParam);
      }

      // Clean URL: Seamlessly strip tracking query params from address bar
      urlParams.delete("ref");
      urlParams.delete("job");
      urlParams.delete("source");
      const cleanSearch = urlParams.toString();
      const cleanPath =
        window.location.pathname + (cleanSearch ? `?${cleanSearch}` : "") + window.location.hash;
      window.history.replaceState({}, document.title, cleanPath);
    }

    // 2. Persistent Visitor Token & Session ID
    let sessionKey = sessionStorage.getItem("portfolio_session_key");
    if (!sessionKey) {
      sessionKey = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem("portfolio_session_key", sessionKey);
    }

    let visitorToken = localStorage.getItem("portfolio_visitor_token");
    let isReturning = true;
    if (!visitorToken) {
      visitorToken = "vis_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("portfolio_visitor_token", visitorToken);
      isReturning = false;
    }

    // Dispatcher
    const sendEvent = (eventType: EventPayload["eventType"], eventData?: Record<string, any>) => {
      const payload = {
        sessionKey,
        visitorToken,
        recruiterRef,
        jobTag,
        sourceTag,
        isReturning,
        eventType,
        eventData: eventData || {},
        pageUrl: window.location.pathname + window.location.hash,
        referrer: document.referrer || "direct",
        browser: getBrowser(),
        os: getOS(),
        device: getDevice(),
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        scrollDepth: scrollDepthRef.current,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACKING_ENDPOINT, JSON.stringify(payload));
      } else {
        fetch(TRACKING_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    };

    (window as any).__trackEvent = sendEvent;

    // Send initial Page View
    sendEvent("PAGE_VIEW", { entry: true });

    // Heartbeat every 15 seconds for Live Active Status
    const heartbeatTimer = setInterval(() => {
      sendEvent("HEARTBEAT");
    }, HEARTBEAT_INTERVAL);

    // Track max scroll depth
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentDepth = Math.round((window.scrollY / totalHeight) * 100);
        if (currentDepth > scrollDepthRef.current) {
          scrollDepthRef.current = Math.min(currentDepth, 100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Send exit metrics on page unload
    const handleUnload = () => {
      sendEvent("TIME_SPENT", { maxScrollDepth: scrollDepthRef.current, exit: true });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
}

export function trackEvent(eventType: EventPayload["eventType"], eventData?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).__trackEvent) {
    (window as any).__trackEvent(eventType, eventData);
  }
}

function getBrowser(): string {
  if (typeof navigator === "undefined") return "Browser";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  return "Browser";
}

function getOS(): string {
  if (typeof navigator === "undefined") return "OS";
  const ua = navigator.userAgent;
  const hasTouch = typeof document !== "undefined" && "ontouchend" in document;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac") && !hasTouch) return "macOS";
  if (ua.includes("Linux") && !ua.includes("Android")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad") || (ua.includes("Mac") && hasTouch)) return "iOS";
  return "OS";
}

function getDevice(): string {
  if (typeof navigator === "undefined") return "Desktop";
  const ua = navigator.userAgent;
  const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0));
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 768;
  const hasTouch = typeof document !== "undefined" && "ontouchend" in document;

  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua) || (isTouch && isSmallScreen)) {
    return "Mobile";
  }
  if (/ipad|tablet|android(?!.*mobile)/i.test(ua) || (ua.includes("Mac") && hasTouch)) {
    return "Tablet";
  }
  return "Desktop";
}
