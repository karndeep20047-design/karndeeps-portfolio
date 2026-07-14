import { Reveal } from "./Reveal";

const groups: { k: string; items: string[] }[] = [
  { k: "Languages", items: ["PHP", "JavaScript", "TypeScript", "Python", "C#", "SQL", "HTML5", "CSS3"] },
  { k: "Frontend", items: ["React", "Vue.js", "Tailwind CSS", "Bootstrap", "Leaflet.js", "Recharts", "Vite"] },
  { k: "Backend", items: ["Laravel", "Node.js", "REST / JSON APIs", "PHPMailer", "dompdf", "Session Auth"] },
  { k: "Databases", items: ["MySQL", "PostgreSQL", "MongoDB", "Supabase", "PDO", "Schema / ERD Design"] },
  { k: "APIs & Integration", items: ["M-Pesa Daraja", "OpenStreetMap", "Supabase Auth", "Firebase", "SMTP"] },
  { k: "DevOps & Tools", items: ["Git & GitHub", "Docker", "Vercel", "Cloudflare", "Postman", "ngrok", "XAMPP"] },
  { k: "Design & UX", items: ["Figma", "Adobe Illustrator", "Photoshop", "Axure RP", "Wireframing"] },
  { k: "Security", items: ["RBAC", "CSRF", "bcrypt", "RLS", "Session Mgmt", "Network Security"] },
  { k: "Methodology", items: ["Agile / Scrum", "Kanban", "MoSCoW", "Planning Poker", "Risk Analysis"] },
];

const certs = [
  "Prompt Craft & AI — IBM SkillsBuild · 2026",
  "IBM Cybersecurity Certificate · 2025",
  "ITS Networking & Security — Certiport/Pearson · 2023",
  "ICDL Python Programming — Oshwal College · 2022",
  "Diploma in Graphic Design — Graffins College · 2021",
  "Microsoft Office Specialist · 2021",
];

export function Stack() {
  return (
    <section id="stack" className="relative border-t border-border/60 px-6 py-24 md:px-10 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 md:mb-24">
            <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              ● Stack & tooling
            </div>
            <h2 className="font-display text-4xl font-medium tracking-tighter md:text-6xl">
              Tools of the<br />
              <span className="italic text-foreground/55">trade.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.k} delay={i * 0.04}>
              <div className="border-t border-border/60 pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {g.k}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[15px] text-foreground/90">
                  {g.items.map((it) => (
                    <li key={it} className="link-hover cursor-default">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-24 grid gap-10 border-t border-border/60 pt-10 md:grid-cols-[280px_1fr]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Certifications & Awards
              </div>
              <div className="mt-2 font-display text-2xl tracking-tight">Receipts.</div>
            </div>
            <ul className="grid gap-3 text-[15px] text-foreground/85 sm:grid-cols-2">
              {certs.map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
