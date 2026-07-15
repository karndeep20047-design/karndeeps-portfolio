import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Stack", href: "/#stack" },
  { label: "Contact", href: "/#contact" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 30));

  // Progressive blur / saturation / width as user scrolls
  const blur = useTransform(scrollY, [0, 400], [6, 22]);
  const saturate = useTransform(scrollY, [0, 400], [110, 180]);
  const filter = useTransform(
    [blur, saturate] as any,
    ([b, s]: number[]) => `blur(${b}px) saturate(${s}%)`
  );
  const maxWidth = useTransform(scrollY, [0, 300], [1100, 780]);
  const paddingY = useTransform(scrollY, [0, 300], [12, 8]);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 hidden md:flex justify-center px-4 pt-4"
    >
      <motion.nav
        style={{
          maxWidth,
          paddingTop: paddingY,
          paddingBottom: paddingY,
          backdropFilter: filter as any,
          WebkitBackdropFilter: filter as any,
          backgroundColor: scrolled
            ? "color-mix(in oklab, var(--background) 55%, transparent)"
            : "color-mix(in oklab, var(--background) 15%, transparent)",
          borderColor: scrolled
            ? "color-mix(in oklab, var(--foreground) 12%, transparent)"
            : "transparent",
          boxShadow: scrolled
            ? "0 10px 40px -20px color-mix(in oklab, black 25%, transparent)"
            : "0 0 0 0 transparent",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full items-center justify-between rounded-full border px-4"
      >
        <a href="/" className="flex items-center gap-2 pl-1 font-display text-sm font-medium">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">
            K
          </span>
          <span className="hidden sm:inline">karndeep</span>
        </a>

        <ul className="hidden items-center gap-0.5 text-sm md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="mailto:karndeep20047@gmail.com"
            className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] sm:flex"
          >
            Connect
            <span className="text-[10px] opacity-70 leading-none mb-[2px]">↗</span>
          </a>
        </div>
      </motion.nav>
    </motion.header>
  );
}
