import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const sections = [
  {
    id: "top",
    label: "Home",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M3 9.75L12 3l9 6.75V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.75Z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "work",
    label: "Work",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        {active && (
          <>
            <line x1="12" y1="12" x2="12" y2="16" strokeWidth={1.7} stroke="var(--background)" />
            <line x1="10" y1="14" x2="14" y2="14" strokeWidth={1.7} stroke="var(--background)" />
          </>
        )}
        {!active && (
          <>
            <line x1="12" y1="12" x2="12" y2="16" strokeWidth={1.7} />
            <line x1="10" y1="14" x2="14" y2="14" strokeWidth={1.7} />
          </>
        )}
      </svg>
    ),
  },
  {
    id: "about",
    label: "About",
    icon: (_active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "stack",
    label: "Stack",
    icon: (_active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    icon: (_active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2,4 12,13 22,4" />
      </svg>
    ),
  },
];

import { useNavigate } from "@tanstack/react-router";

export function MobileBottomNav() {
  const [active, setActive] = useState("top");
  const navigate = useNavigate();
  // When user taps a nav item we lock observer updates until scroll settles
  const isNavigatingRef = useRef(false);
  const navLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // --- Top detection via scroll position ---
    const checkTop = () => {
      if (isNavigatingRef.current) return;
      if (window.scrollY < 80) setActive("top");
    };
    window.addEventListener("scroll", checkTop, { passive: true });

    // --- Section detection via IntersectionObserver ---
    const sectionIds = sections.slice(1).map((s) => s.id);
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          // Ignore observer events fired while we're driving the scroll
          if (isNavigatingRef.current) return;
          if (entry.isIntersecting) setActive(id);
        },
        {
          rootMargin: "-35% 0px -55% 0px",
          threshold: 0,
        },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      window.removeEventListener("scroll", checkTop);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  const handleClick = (id: string) => {
    // Immediately set active — never jitters to intermediates
    setActive(id);

    // Lock observer while scroll animation plays (~600ms typical)
    isNavigatingRef.current = true;
    if (navLockTimer.current) clearTimeout(navLockTimer.current);
    navLockTimer.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 800);

    if (id === "top") {
      if (window.location.pathname !== "/") {
        navigate({ to: "/" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate({ to: "/", hash: id });
      }
    }
  };

  const activeIndex = sections.findIndex((s) => s.id === active);

  return (
    <motion.nav
      initial={{ y: 40 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Mobile navigation"
      className="fixed bottom-5 inset-x-0 z-50 flex md:hidden justify-center pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="relative flex items-center gap-1 px-3 py-2.5 rounded-[22px] glass pointer-events-auto"
        style={{
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          willChange: "transform",
        }}
      >
        {/* Sliding active background — single element moved by CSS translate */}
        <motion.span
          aria-hidden
          className="absolute rounded-[14px] bg-foreground"
          style={{ width: 44, height: 44, top: 10, left: 12, willChange: "transform" }}
          animate={{
            // Each button is 44px wide + 4px gap (gap-1 = 0.25rem = 4px)
            x: activeIndex * 48,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.6 }}
        />

        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <button
              key={section.id}
              id={`mobile-nav-${section.id}`}
              aria-label={section.label}
              onClick={() => handleClick(section.id)}
              className="relative flex items-center justify-center rounded-[14px] active:scale-90 transition-transform duration-100"
              style={{ width: 44, height: 44, zIndex: 1 }}
            >
              <span
                className="transition-colors duration-200"
                style={{
                  color: isActive ? "var(--background)" : "var(--muted-foreground)",
                }}
              >
                {section.icon(isActive)}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
