import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";

type Origin = { x: number; y: number };

type Ctx = {
  navigateWithTransition: (opts: {
    to: string;
    params?: Record<string, string>;
    hash?: string;
    origin?: Origin;
    label?: string;
  }) => void;
};

const TransitionCtx = createContext<Ctx | null>(null);

export function usePageTransition() {
  const ctx = useContext(TransitionCtx);
  if (!ctx) throw new Error("usePageTransition must be used within PageTransitionProvider");
  return ctx;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<{
    active: boolean;
    origin: Origin;
    label?: string;
  }>({ active: false, origin: { x: 0.5, y: 0.5 } });

  const navigateWithTransition = useCallback<Ctx["navigateWithTransition"]>(
    ({ to, params, hash, origin, label }) => {
      const o = origin ?? { x: 0.5, y: 0.5 };
      setState({ active: true, origin: o, label });

      // Fire navigation partway through the reveal so the new page is ready
      window.setTimeout(() => {
        navigate({ to: to as string, params: params as never, hash: hash as never });
      }, 380);

      // Retract the overlay after the new page has mounted
      window.setTimeout(() => {
        setState((s) => ({ ...s, active: false }));
      }, 900);
    },
    [navigate],
  );

  return (
    <TransitionCtx.Provider value={{ navigateWithTransition }}>
      {children}
      <AnimatePresence>
        {state.active && (
          <motion.div
            key="page-transition"
            className="pointer-events-none fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 0.15 }}
          >
            {/* Radial glass wipe from click origin */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at ${state.origin.x * 100}% ${state.origin.y * 100}%, color-mix(in oklab, var(--background) 92%, transparent) 0%, color-mix(in oklab, var(--background) 88%, transparent) 45%, transparent 75%)`,
                backdropFilter: "blur(0px)",
                WebkitBackdropFilter: "blur(0px)",
              }}
              initial={{ clipPath: `circle(0% at ${state.origin.x * 100}% ${state.origin.y * 100}%)` }}
              animate={{
                clipPath: `circle(150% at ${state.origin.x * 100}% ${state.origin.y * 100}%)`,
                backdropFilter: "blur(24px)",
              }}
              exit={{
                clipPath: `circle(0% at ${state.origin.x * 100}% ${state.origin.y * 100}%)`,
                backdropFilter: "blur(0px)",
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            {state.label && (
              <motion.div
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <div className="font-display text-5xl font-medium tracking-tighter text-foreground/90 md:text-8xl">
                  {state.label}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionCtx.Provider>
  );
}
