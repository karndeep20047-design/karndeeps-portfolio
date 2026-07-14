import { motion, useScroll, useTransform } from "motion/react";
import { Box, Code2, Server, Database, Layout, Layers, Terminal, FileCode2, TerminalSquare, Braces, Hexagon, PenTool, Figma, Hash, AppWindow, Palette, Flame, Zap, GitBranch, Triangle, Cloud, Network, Map, LineChart, Send } from "lucide-react";
import { useRef } from "react";
import { RevealWords, Reveal } from "./Reveal";

function FloatingArrow({
  label,
  delay = 0,
  className,
  yOffset = 10,
}: {
  label: string;
  delay?: number;
  className?: string;
  yOffset?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: [0, yOffset, 0],
      }}
      transition={{
        opacity: { duration: 1, delay },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`absolute flex items-center gap-1.5 rounded-full bg-foreground/5 backdrop-blur-md border border-foreground/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 pointer-events-none shadow-sm will-change-transform z-10 ${className}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-foreground -rotate-45 opacity-70"
      >
        <path d="M4 2v20l5.8-5.8H20z" />
      </svg>
      {label}
    </motion.div>
  );
}

const stack = [
  { name: "PHP", icon: FileCode2 },
  { name: "JavaScript", icon: Braces },
  { name: "TypeScript", icon: Code2 },
  { name: "Python", icon: TerminalSquare },
  { name: "C#", icon: Hash },
  { name: "HTML5", icon: AppWindow },
  { name: "CSS3", icon: Palette },
  { name: "React", icon: Box },
  { name: "Vue.js", icon: Hexagon },
  { name: "Next.js", icon: Layout },
  { name: "Laravel", icon: Flame },
  { name: "Node.js", icon: Server },
  { name: "REST APIs", icon: Network },
  { name: "MySQL", icon: Database },
  { name: "PostgreSQL", icon: Database },
  { name: "MongoDB", icon: Database },
  { name: "Supabase", icon: Zap },
  { name: "Firebase", icon: Flame },
  { name: "Tailwind CSS", icon: Layers },
  { name: "Bootstrap", icon: Layout },
  { name: "Leaflet.js", icon: Map },
  { name: "Recharts", icon: LineChart },
  { name: "Figma", icon: Figma },
  { name: "Git / GitHub", icon: GitBranch },
  { name: "Postman", icon: Send },
  { name: "Docker", icon: Terminal },
  { name: "Vercel", icon: Triangle },
  { name: "Cloudflare", icon: Cloud },
];

function StackMarquee() {
  return (
    <div 
      className="relative mx-auto flex w-full max-w-6xl items-center overflow-hidden py-4 border-y border-foreground/10 mt-8 md:mt-16"
      style={{ 
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", 
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" 
      }}
    >
      <div className="flex w-max items-center gap-12 pr-12 animate-marquee">
        {[...stack, ...stack, ...stack, ...stack].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-muted-foreground/60 whitespace-nowrap">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="font-mono text-[11px] uppercase tracking-widest">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 pb-28 pt-32 md:px-10 md:pb-10 md:pt-40"
    >
      {/* Flowing gradient background */}
      <div className="hero-bg" aria-hidden>
        <span />
      </div>
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden />
      {/* Soft fade to page background at bottom for seamless flow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--background))",
        }}
      />

      <motion.div
        style={{ opacity, willChange: "opacity" }}
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center"
      >
        <Reveal>
          <div className="md:hidden glass mb-16 inline-flex w-fit items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-foreground/70 hover:bg-foreground/10 cursor-default">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-foreground/60 text-[10px] flex items-center justify-center leading-none"
            >
              ✦
            </motion.span>
            1°17'S 36°49'E · Nairobi, KE
          </div>
        </Reveal>

        <h1 className="relative font-display text-[15vw] font-medium leading-[0.9] tracking-tighter md:text-[9vw] w-fit">
          <FloatingArrow
            label="Builder"
            delay={1.5}
            yOffset={-8}
            className="-top-8 -left-4"
          />
          <FloatingArrow
            label="Engineer"
            delay={1.2}
            yOffset={12}
            className="bottom-12 -right-24"
          />
          <FloatingArrow
            label="Creator"
            delay={1.8}
            yOffset={-10}
            className="-top-4 right-12"
          />
          <RevealWords text="Karndeep" />
          <br />
          <span className="italic text-foreground/55">
            <RevealWords text="Bhamrah." delay={0.15} />
          </span>
        </h1>

        <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-[1fr_auto] md:items-end">
          <Reveal
            delay={0.6}
            className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Full-stack developer building{" "}
            <span className="text-foreground">data-driven web platforms</span> — from GIS
            marketplaces to payment-integrated dashboards. I care about clean systems, fast
            interfaces, and the last 5% of polish.
          </Reveal>
          <Reveal delay={0.75}>
            <a
              href="#work"
              className="glass group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm text-foreground transition-transform hover:scale-[1.02]"
            >
              See selected work
              <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </Reveal>
        </div>
      </motion.div>

      <Reveal delay={1} className="w-full">
        <StackMarquee />
      </Reveal>
    </section>
  );
}
