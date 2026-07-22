import { createFileRoute } from "@tanstack/react-router";
import { sessionsStore } from "@/lib/telemetry";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "karndeep2026";
const AUTH_COOKIE_NAME = "admin_auth_token";
const SECRET_TOKEN = "auth_tok_" + Buffer.from(ADMIN_PASSWORD).toString("base64");

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { password } = await request.json();

          if (password !== ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ error: "Invalid password" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Set HttpOnly, Secure, SameSite=Strict Cookie
          const headers = new Headers({
            "Content-Type": "application/json",
            "Set-Cookie": `${AUTH_COOKIE_NAME}=${SECRET_TOKEN}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
          });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers,
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
      },
    },
  },
});

export function verifyAdminAuth(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  return cookieHeader.includes(`${AUTH_COOKIE_NAME}=${SECRET_TOKEN}`);
}
