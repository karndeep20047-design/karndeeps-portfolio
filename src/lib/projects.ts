export type Project = {
  slug: string;
  n: string;
  name: string;
  tag: string;
  year: string;
  role: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  overview: string;
  highlights: { label: string; value: string }[];
  gallery: { title: string; caption: string; image?: string; accent?: string }[];
  promoImage?: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "afrispace",
    n: "01",
    name: "AfriSpace",
    tag: "Billboard & Outdoor Advertising Marketplace",
    year: "2025 — 2026",
    role: "Solo developer · Final year project",
    blurb:
      "A multi-role marketplace for booking outdoor media across Kenya — with a real map, real payments, and real invoicing.",
    bullets: [
      "M-Pesa STK Push with callback polling for real-time confirmation",
      "GIS map with clustering, satellite layers, and geolocation filtering",
      "Automated PDF invoicing and multi-role CRUD dashboards",
      "Spatial indexing and runtime migration checks for performance",
    ],
    stack: ["PHP", "MySQL", "Leaflet.js", "OpenStreetMap", "Daraja API", "dompdf", "Tailwind"],
    overview:
      "AfriSpace turns a fragmented outdoor advertising market into a single searchable surface. Advertisers browse billboards on a live map, pick dates, and pay via M-Pesa; owners list inventory, track bookings, and get paid. Admins keep the whole thing honest with a moderation and analytics layer.",
    highlights: [
      { label: "User roles", value: "3" },
      { label: "Payment latency", value: "<8s" },
      { label: "Map layers", value: "Satellite + OSM" },
      { label: "Invoices", value: "Auto-generated" },
    ],
    promoImage: "/projects/afrispace/afrispace_promo_2.png",
    gallery: [
      {
        title: "GIS Discovery",
        caption: "Main marketplace discovery map with grouped pins.",
        image: "/projects/afrispace/afrispace gis map.png"
      },
      {
        title: "Faceted Search",
        caption: "Browsing and filtering billboards by county and type.",
        image: "/projects/afrispace/afrispace browsing page.png"
      },
      {
        title: "Advertiser Dashboard",
        caption: "Overview of active campaigns and total ad spend.",
        image: "/projects/afrispace/afrispace advertiser dashboard.png"
      },
      {
        title: "Booking Checkout",
        caption: "Multi-step flow for selecting dates and uploading creatives.",
        image: "/projects/afrispace/afrispace booking page.png"
      },
      {
        title: "M-Pesa STK Push",
        caption: "Triggering a direct mobile money prompt on the user's phone.",
        image: "/projects/afrispace/afrispace advertiser receiving stk push on phone after inputting number on the payment details.png"
      },
      {
        title: "Campaign Monitoring",
        caption: "Tracking the lifecycle and status of a specific booking.",
        image: "/projects/afrispace/afrispace campaign details page.png"
      },
      {
        title: "Owner Dashboard",
        caption: "At-a-glance revenue, pending approvals, and active inventory.",
        image: "/projects/afrispace/afrispace billboard owner dashboard page.png"
      },
      {
        title: "Adding Inventory",
        caption: "Form for owners to list a new billboard with specifications.",
        image: "/projects/afrispace/afrispace add billboard page.png"
      },
      {
        title: "Geospatial Placement",
        caption: "Drag-and-drop Leaflet map for accurate coordinate capture.",
        image: "/projects/afrispace/afrispace pin location on map page.png"
      },
      {
        title: "Owner Approvals",
        caption: "Reviewing advertiser creatives and accepting booking requests.",
        image: "/projects/afrispace/afrispace owner - booking details page.png"
      },
      {
        title: "Admin Dashboard",
        caption: "Global platform overview, revenue metrics, and system health.",
        image: "/projects/afrispace/admin dashboard page.png"
      },
      {
        title: "Admin Moderation",
        caption: "Approval queue for new billboards before they go live.",
        image: "/projects/afrispace/admin approvals page.png"
      },
      {
        title: "User Management",
        caption: "Admin control over platform users and role assignments.",
        image: "/projects/afrispace/admin users page.png"
      },
      {
        title: "Maintenance Mode",
        caption: "Global lockdown state for system upgrades.",
        image: "/projects/afrispace/how ongoing maintenance looks when trying to access the site.png"
      }
    ],
  },
  {
    slug: "uniscope",
    n: "02",
    name: "UniScope",
    tag: "University Magazine CMS",
    year: "2026",
    role: "Scrum master · Lead developer · Team of 6",
    blurb:
      "A secure editorial CMS for a university publication — with airtight auth, audit trails, and a submission workflow that actually ships.",
    bullets: [
      "RBAC with CSRF protection, bcrypt auth, and role-based routing",
      "Automated email notifications and full audit logging",
      "Led 6-person Agile team, delivered all sprint objectives on time",
      "Recovered from InnoDB corruption during migration with zero data loss",
    ],
    stack: ["PHP", "MySQL", "Bootstrap", "PHPMailer", "PDO", "Agile / Scrum"],
    overview:
      "UniScope replaces email-and-Google-Doc chaos with a proper editorial pipeline: writers submit, editors review, admins publish. Every state change is logged, every action is authorized, and no draft ever gets lost.",
    highlights: [
      { label: "Team size", value: "6" },
      { label: "Sprints", value: "On time" },
      { label: "Roles", value: "Writer / Editor / Admin" },
      { label: "Data loss", value: "Zero" },
    ],
    promoImage: "/projects/uniscope/uniscope_promo.png",
    gallery: [
      { title: "Student Dashboard", caption: "Main portal for students to manage their contributions.", image: "/projects/uniscope/student portal dashboard.png" },
      { title: "My Submissions", caption: "Tracking the status of submitted articles.", image: "/projects/uniscope/student my submissions page.png" },
      { title: "Coordinator Review", caption: "Evaluating and leaving feedback on student submissions.", image: "/projects/uniscope/coordinator review submissions page.png" },
      { title: "Faculty Statistics", caption: "Coordinator overview of department activity.", image: "/projects/uniscope/coordinator faculty statistics page.png" },
      { title: "Manager Analytics", caption: "High-level statistical overview for the marketing manager.", image: "/projects/uniscope/manager statistics.png" },
      { title: "Admin Users", caption: "Secure user management and role assignment.", image: "/projects/uniscope/Admin users page.png" },
      { title: "Admin Dashboard", caption: "System health and overall CMS activity.", image: "/projects/uniscope/adminn home page.png" },
      { title: "Role Login", caption: "Multi-tenant role-based access control.", image: "/projects/uniscope/multiuser role login selection page.png" },
      { title: "Registration", caption: "Secure student onboarding.", image: "/projects/uniscope/student registration page.png" },
    ],
  },
  {
    slug: "nexpesa",
    n: "03",
    name: "NexPesa",
    tag: "Personal Finance Dashboard",
    year: "2026",
    role: "Personal project · Lead developer",
    blurb:
      "A modern React finance app for tracking expenses, analyzing spend, and hitting savings goals — with a proper design system.",
    bullets: [
      "Supabase Auth with Row Level Security for per-user isolation",
      "Interactive Recharts analytics with dark / light theming",
      "Goal tracking, category budgets, and monthly rollovers",
      "Deployed on Vercel with Cloudflare in front",
    ],
    stack: ["React", "TypeScript", "Supabase", "PostgreSQL", "Recharts", "Tailwind"],
    overview:
      "NexPesa is what a finance app should feel like — fast, quiet, and honest about your money. Add transactions in a keystroke, watch categories fill up in real time, and set goals that actually roll over month to month.",
    highlights: [
      { label: "Auth", value: "Supabase + RLS" },
      { label: "Themes", value: "Light / Dark" },
      { label: "Charts", value: "Recharts" },
      { label: "Hosting", value: "Vercel + CF" },
    ],
    promoImage: "/projects/nexpesa/nexpesa_promo.png",
    gallery: [
      { title: "Landing Page", caption: "Public-facing introduction to NexPesa features.", image: "/projects/nexpesa/landing page.png" },
      { title: "Dashboard (Dark)", caption: "Cashflow, categories, and goals in the premium dark theme.", image: "/projects/nexpesa/dashboard dark mode.png" },
      { title: "Dashboard (Light)", caption: "Cashflow, categories, and goals in the clean light theme.", image: "/projects/nexpesa/dashboard light mode.png" },
      { title: "Authentication", caption: "Secure entry backed by Supabase Auth and Row Level Security.", image: "/projects/nexpesa/nexpesa login page.png" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
