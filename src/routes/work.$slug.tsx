import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Nav } from "@/components/Nav";
import { MobileTopBar } from "@/components/MobileTopBar";
import { Gallery3D } from "@/components/Gallery3D";
import { getProject, projects } from "@/lib/projects";
import { usePageTransition } from "@/components/PageTransition";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }): { project: NonNullable<ReturnType<typeof getProject>> } => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    return {
      meta: [
        { title: `${p.name} — ${p.tag} · Karndeep Bhamrah` },
        { name: "description", content: p.blurb },
        { property: "og:title", content: `${p.name} — ${p.tag}` },
        { property: "og:description", content: p.blurb },
      ],
    };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">404</div>
        <h1 className="mt-2 font-display text-4xl tracking-tighter">Project not found</h1>
        <Link to="/" className="mt-6 inline-block font-mono text-xs uppercase tracking-widest underline">
          ← Back home
        </Link>
      </div>
    </div>
  ),
});

const ease = [0.22, 1, 0.36, 1] as const;

function ProjectDetail() {
  const { project } = Route.useLoaderData() as { project: NonNullable<ReturnType<typeof getProject>> };
  const currentIdx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIdx + 1) % projects.length];
  const { navigateWithTransition } = usePageTransition();
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: "/", hash: "work" });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition({
      to: "/work/$slug",
      params: { slug: next.slug },
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      label: next.name,
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav />
      <MobileTopBar />

      {/* Back button fixed to viewport */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="fixed top-5 left-5 z-50"
      >
        <a
          href="/#work"
          onClick={handleBack}
          className="group glass flex h-[44px] cursor-pointer items-center gap-2 rounded-full px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-transform duration-500 hover:-translate-x-0.5 hover:text-foreground"
        >
          <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1">←</span>
          Back to work
        </a>
      </motion.div>

      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="hero-bg opacity-40 dark:opacity-30">
          <span />
        </div>
      </div>

      <div style={{ perspective: 1400 }}>
        <motion.main
          className="mx-auto max-w-6xl px-6 pt-24 md:px-10 md:pt-32"
          initial={{ opacity: 0, y: 60, rotateX: -8, scale: 0.96, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease, delay: 0.05 }}
          style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
        >
        {/* Hero */}
        <header className="mt-10 md:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            <span className="text-foreground">{project.n}</span>
            <span className="h-px w-10 bg-border" />
            <span>{project.year}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="mt-5 font-display text-5xl font-medium tracking-tighter md:text-8xl"
          >
            {project.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="mt-3 max-w-2xl text-base text-muted-foreground md:text-xl"
          >
            {project.tag}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
            className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70"
          >
            {project.role}
          </motion.p>
        </header>

        {/* Gallery */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.35 }}
          className="mt-16 md:mt-24"
        >
          <Gallery3D items={project.gallery} name={project.name} />
        </motion.section>

        {/* Overview + highlights */}
        <section className="mt-24 grid gap-10 md:mt-32 md:grid-cols-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease }}
            className="md:col-span-7"
          >
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              ● Overview
            </div>
            <p className="mt-4 text-lg leading-relaxed text-foreground/85 md:text-xl">
              {project.overview}
            </p>

            <div className="mt-10">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                ● What it does
              </div>
              <ul className="mt-4 space-y-3 text-base text-foreground/80 md:text-lg">
                {project.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="md:col-span-5"
          >
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Highlights
              </div>
              <dl className="mt-6 space-y-4">
                {project.highlights.map((h) => (
                  <div key={h.label} className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{h.label}</dt>
                    <dd className="font-display text-lg tracking-tight md:text-xl">{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="glass mt-6 rounded-3xl p-6 md:p-8">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Stack
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="glass rounded-full px-3 py-1 font-mono text-[11px] text-foreground/75">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </section>

        {/* Next project */}
        <section className="mt-32 border-t border-border/60 pt-16 pb-32">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Next project
          </div>
          <a
            href={`/work/${next.slug}`}
            onClick={handleNext}
            className="group mt-4 flex cursor-pointer items-baseline justify-between gap-6"
          >
            <h2 className="font-display text-4xl font-medium tracking-tighter transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 md:text-7xl">
              {next.name}
            </h2>
            <span className="glass grid h-14 w-14 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 md:h-16 md:w-16">
              →
            </span>
          </a>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">{next.tag}</p>
        </section>
        </motion.main>
      </div>
    </div>
  );
}
