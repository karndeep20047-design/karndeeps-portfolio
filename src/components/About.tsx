import { Reveal } from "./Reveal";

const attributes = [
  { k: "Approach", v: "Ship the boring parts well. Then obsess over the last 5%." },
  { k: "Superpower", v: "Fast learner — new stacks, new domains, real work in days." },
  { k: "Team", v: "Led 6-person and 5-person Agile teams to on-time delivery." },
  { k: "Range", v: "From spatial indexing to graphic design — I bridge tech and taste." },
  { k: "Languages", v: "English · Punjabi · Hindi · Kiswahili" },
  { k: "Off-screen", v: "Football, gym, and building things nobody asked for." },
];

export function About() {
  return (
    <section id="about" className="relative border-t border-border/60 px-6 py-24 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-5">
          <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            ● About
          </div>
          <h2 className="font-display text-4xl font-medium tracking-tighter md:text-6xl">
            A computing grad who<br />
            <span className="italic text-foreground/55">actually ships.</span>
          </h2>
        </Reveal>

        <div className="md:col-span-7">
          <Reveal>
            <p className="text-lg leading-relaxed text-foreground/85 md:text-xl">
              I'm a BSc (Hons) Computing graduate from the University of Greenwich, finishing with First
              Class Honours. My work sits at the intersection of{" "}
              <span className="text-foreground">full-stack development</span>, systems admin, and
              data-driven platforms — with real-world detours through operations, inventory control,
              and graphic design.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              I was Batch Representative throughout my degree and picked up top awards in Software
              Engineering, Web Programming, and Mathematics in Computer Science. Outside coursework I
              managed stock and bookkeeping for a live retail business, and designed campaigns for
              corporate clients including GA Insurance.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-6 border-t border-border/60 pt-10 sm:grid-cols-2">
            {attributes.map((a, i) => (
              <Reveal key={a.k} delay={i * 0.06}>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {a.k}
                  </span>
                  <span className="text-[15px] text-foreground/90">{a.v}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
