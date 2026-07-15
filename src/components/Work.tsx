import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Reveal } from "./Reveal";
import { ScrollPath } from "./ScrollPath";
import { projects, type Project } from "@/lib/projects";
import { usePageTransition } from "./PageTransition";

export function Work() {
  const stackRef = useRef<HTMLDivElement>(null);
  return (
    <section id="work" className="relative px-6 py-24 md:px-10 md:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 flex items-end justify-between gap-6 md:mb-24">
            <div>
              <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                ● Selected work
              </div>
              <h2 className="font-display text-4xl font-medium tracking-tighter md:text-6xl">
                Things I've<br />
                <span className="italic text-foreground/55">shipped.</span>
              </h2>
            </div>
            <div className="hidden text-right font-mono text-xs uppercase tracking-widest text-muted-foreground sm:block">
              {String(projects.length).padStart(2, "0")}<br />projects
            </div>
          </div>
        </Reveal>

        <div ref={stackRef} className="relative flex flex-col gap-20 md:gap-32">
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <ScrollPath targetRef={stackRef} count={projects.length} />
          </div>
          {projects.map((p, i) => (
            <div key={p.n} className="relative">
              <ProjectCard project={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const flipped = index % 2 === 1;
  const { navigateWithTransition } = usePageTransition();
  const cardRef = useRef<HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
      : { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    navigateWithTransition({
      to: "/work/$slug",
      params: { slug: project.slug },
      origin,
      label: project.name,
    });
  };

  return (
    <Reveal>
      <a
        href={`/work/${project.slug}`}
        onClick={handleOpen}
        className="group relative block cursor-pointer focus:outline-none"
      >
        <article ref={cardRef} className="relative grid gap-8 md:grid-cols-12 md:gap-10">
          <div className={`md:col-span-5 ${flipped ? "md:order-2" : ""}`}>
            <ProjectVisual project={project} />
          </div>

          <div className={`md:col-span-7 ${flipped ? "md:order-1" : ""}`}>
            <div className="flex items-baseline gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span className="text-foreground">{project.n}</span>
              <span className="h-px flex-1 bg-border" />
              <span>{project.year}</span>
            </div>

            <h3 className="mt-5 flex items-center gap-4 font-display text-3xl font-medium tracking-tighter md:text-5xl">
              <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
                {project.name}
              </span>
              <span
                aria-hidden
                className="glass grid h-9 w-9 shrink-0 -translate-x-2 scale-75 place-items-center rounded-full text-sm opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 md:h-11 md:w-11"
              >
                →
              </span>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{project.tag}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
              {project.role}
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 md:text-lg">
              {project.blurb}
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground md:text-[15px]">
              {project.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-1.5">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="glass rounded-full px-3 py-1 font-mono text-[11px] text-foreground/75"
                >
                  {s}
                </span>
              ))}
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                View case →
              </span>
            </div>
          </div>
        </article>
      </a>
    </Reveal>
  );
}

function ProjectVisual({ project }: { project: Project }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 200, damping: 20, mass: 0.5 });
  const springRy = useSpring(ry, { stiffness: 200, damping: 20, mass: 0.5 });
  const rotateX = useTransform(springRx, (v) => `${v}deg`);
  const rotateY = useTransform(springRy, (v) => `${v}deg`);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 10);
  };
  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.6 }}
        className="glass relative aspect-[4/5] overflow-hidden rounded-3xl"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--foreground) 12%, transparent) 0%, transparent 55%), radial-gradient(circle at 70% 80%, color-mix(in oklab, var(--foreground) 8%, transparent) 0%, transparent 55%)",
          }}
        />
        <div className="grain absolute inset-0" aria-hidden />
        
        {/* Promo Image */}
        {project.promoImage && (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            <img
              src={project.promoImage}
              alt={`${project.name} Promo`}
              className="relative h-full w-full object-contain p-2 md:p-6 opacity-100 md:opacity-85 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-40 md:opacity-100 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-40 pointer-events-none" />
          </div>
        )}

        <div
          className="absolute inset-0 flex flex-col justify-between p-6"
          style={{ transform: "translateZ(24px)" }}
        >
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-foreground/60">
            <span>{project.n} / {String(projects.length).padStart(2, "0")}</span>
            <span className="h-2 w-2 rounded-full bg-foreground/70" />
          </div>
          <div>
            <div className="font-display text-6xl font-medium tracking-tighter text-foreground/90 md:text-7xl">
              {project.name.charAt(0)}
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-foreground/55">
              {project.stack.slice(0, 3).join(" · ")}
            </div>
          </div>
        </div>

        {/* Sheen sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[40%] opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[40%] group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, color-mix(in oklab, var(--foreground) 12%, transparent) 50%, transparent 60%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 flex items-end justify-end p-5"
          style={{ transform: "translateZ(40px)" }}
        >
          <span className="glass-strong inline-flex translate-y-3 items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-widest opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <span>Open case</span>
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
