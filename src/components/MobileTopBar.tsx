import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Theme = "light" | "dark";

function useLiveTime() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return {
      h: now.getHours().toString().padStart(2, "0"),
      m: now.getMinutes().toString().padStart(2, "0"),
      colon: true,
    };
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime((prev) => ({
        h: now.getHours().toString().padStart(2, "0"),
        m: now.getMinutes().toString().padStart(2, "0"),
        colon: !prev.colon,
      }));
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export function MobileTopBar() {
  const [theme, setTheme] = useState<Theme>("light");
  const btnRef = useRef<HTMLButtonElement>(null);
  const { h, m, colon } = useLiveTime();

  // Sync with existing ThemeToggle / localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  // Keep in sync when the other ThemeToggle changes theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const applyTheme = (next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    // Skip View Transition on mobile — the clip-path animation is too heavy
    const isMobile = window.innerWidth < 768;

    if (
      isMobile ||
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme(next);
      return;
    }

    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);
    document.documentElement.style.setProperty("--vt-r", `${endRadius}px`);

    const transition = doc.startViewTransition!(() => applyTheme(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 380,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="fixed top-5 right-5 z-50 flex md:hidden items-center gap-2 px-3.5 py-2 rounded-2xl glass"
      style={{
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Live clock */}
      <span className="font-mono text-sm font-medium text-foreground/80 tabular-nums select-none leading-none">
        {h}
        <motion.span
          animate={{ opacity: colon ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          :
        </motion.span>
        {m}
      </span>

      {/* Divider */}
      <span className="h-4 w-px bg-foreground/20 shrink-0" />

      {/* Theme toggle */}
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="Toggle theme"
        className="flex items-center justify-center w-7 h-7 rounded-full text-foreground/80 transition-transform hover:scale-110 active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -60, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[15px] leading-none"
          >
            {theme === "dark" ? "☾" : "☀"}
          </motion.span>
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
