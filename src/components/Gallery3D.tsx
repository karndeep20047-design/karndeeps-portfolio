import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, useTransform, animate, AnimatePresence } from "motion/react";
import type { Project } from "@/lib/projects";

type Item = Project["gallery"][number];

export function Gallery3D({ items, name }: { items: Item[]; name: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const [cardW, setCardW] = useState(360);
  const x = useMotionValue(0);

  // Responsive card width - optimized for 16:9 landscape
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCardW(w - 48); // Full width on mobile minus padding
      else if (w < 1024) setCardW(600); // Tablet
      else setCardW(800); // Desktop
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const gap = 32;
  const step = cardW + gap;

  useEffect(() => {
    const controls = animate(x, -index * step, {
      type: "spring",
      stiffness: 160,
      damping: 26,
      mass: 0.6
    });
    return controls.stop;
  }, [index, step, x]);

  const go = (i: number) => setIndex(Math.max(0, Math.min(items.length - 1, i)));

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "Escape") setIsZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="relative select-none">
      <div
        ref={trackRef}
        className="relative py-10"
        style={{ perspective: "1600px" }}
      >
        <motion.div
          className="flex items-center will-change-transform cursor-grab active:cursor-grabbing"
          style={{
            gap: `${gap}px`,
            x: x,
            paddingLeft: `calc(50% - ${cardW / 2}px)`,
            paddingRight: `calc(50% - ${cardW / 2}px)`,
            transformStyle: "preserve-3d",
          }}
          drag="x"
          dragConstraints={{
            left: -(items.length - 1) * step,
            right: 0,
          }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const projected = x.get() + info.velocity.x * 0.15;
            const nearest = Math.round(-projected / step);
            const clamped = Math.max(0, Math.min(items.length - 1, nearest));
            
            if (clamped === index) {
              // Force snap back if we didn't drag far enough to change index
              animate(x, -index * step, {
                type: "spring",
                stiffness: 160,
                damping: 26,
                mass: 0.6
              });
            } else {
              go(clamped);
            }
          }}
        >
          {items.map((item, i) => (
            <Card
              key={i}
              item={item}
              name={name}
              i={i}
              total={items.length}
              cardW={cardW}
              step={step}
              mX={x}
              onClick={() => go(i)}
              onZoom={() => setIsZoomed(true)}
              isActive={i === index}
            />
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between gap-3 md:gap-4 px-4 md:px-0 max-w-sm md:max-w-none mx-auto md:mx-0">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="glass grid h-10 w-10 md:h-11 md:w-11 shrink-0 place-items-center rounded-full transition-opacity disabled:opacity-30"
          aria-label="Previous"
        >
          <Arrow dir="left" />
        </button>

        {/* Scaled down dots for mobile */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`h-1 md:h-1.5 shrink-0 rounded-full transition-all ${
                i === index
                  ? "w-5 md:w-7"
                  : "w-1.5 md:w-2"
              }`}
              style={{
                background:
                  i === index
                    ? "color-mix(in oklab, var(--foreground) 80%, transparent)"
                    : "color-mix(in oklab, var(--foreground) 20%, transparent)",
              }}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => go(index + 1)}
          disabled={index === items.length - 1}
          className="glass grid h-10 w-10 md:h-11 md:w-11 shrink-0 place-items-center rounded-full transition-opacity disabled:opacity-30"
          aria-label="Next"
        >
          <Arrow dir="right" />
        </button>
      </div>

      <div className="mt-6 text-center px-4 md:px-0">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </div>
        <div className="mt-2 font-display text-xl tracking-tight md:text-2xl">
          {items[index].title}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{items[index].caption}</div>
      </div>

      {/* Zoom Modal using Portal to escape parent CSS transforms */}
      {mounted && createPortal(
        <AnimatePresence>
          {isZoomed && items[index]?.image && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 p-4 md:p-10"
              onClick={() => setIsZoomed(false)}
            >
            {/* Close Button */}
            <button
              className="absolute right-6 top-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur-md transition-colors hover:bg-foreground/20"
              onClick={() => setIsZoomed(false)}
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {/* Prev Button (Desktop only) */}
            <button
              onClick={(e) => { e.stopPropagation(); go(index - 1); }}
              disabled={index === 0}
              className="absolute left-4 md:left-10 z-50 hidden md:grid h-16 w-16 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur-md transition-colors hover:bg-foreground/20 disabled:opacity-30"
            >
              <Arrow dir="left" />
            </button>

            {/* Next Button (Desktop only) */}
            <button
              onClick={(e) => { e.stopPropagation(); go(index + 1); }}
              disabled={index === items.length - 1}
              className="absolute right-4 md:right-10 z-50 hidden md:grid h-16 w-16 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur-md transition-colors hover:bg-foreground/20 disabled:opacity-30"
            >
              <Arrow dir="right" />
            </button>

            {/* Image container */}
            <motion.div
              key={index} // Force re-animation when index changes
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-full max-w-full md:max-w-[80vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={encodeURI(items[index].image!)}
                alt={items[index].title}
                className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-2xl md:max-h-[70vh] mx-auto"
              />
              <div className="mt-6 w-full max-w-sm flex flex-col items-center">
                <div className="flex w-full items-center justify-between">
                  {/* Mobile Prev */}
                  <button
                    onClick={(e) => { e.stopPropagation(); go(index - 1); }}
                    disabled={index === 0}
                    className="md:hidden glass grid shrink-0 h-10 w-10 place-items-center rounded-full transition-opacity disabled:opacity-30"
                  >
                    <Arrow dir="left" />
                  </button>

                  <div className="flex-1 px-3 font-display text-xl tracking-tight text-foreground md:text-3xl text-center line-clamp-1">
                    {items[index].title}
                  </div>

                  {/* Mobile Next */}
                  <button
                    onClick={(e) => { e.stopPropagation(); go(index + 1); }}
                    disabled={index === items.length - 1}
                    className="md:hidden glass grid shrink-0 h-10 w-10 place-items-center rounded-full transition-opacity disabled:opacity-30"
                  >
                    <Arrow dir="right" />
                  </button>
                </div>
                <div className="mt-2 px-6 text-sm text-muted-foreground md:text-base text-center">
                  {items[index].caption}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function Card({
  item,
  name,
  i,
  total,
  cardW,
  step,
  mX,
  onClick,
  onZoom,
  isActive,
}: {
  item: Item;
  name: string;
  i: number;
  total: number;
  cardW: number;
  step: number;
  mX: any;
  onClick: () => void;
  onZoom: () => void;
  isActive: boolean;
}) {
  // Distance from center in "steps"
  const offset = useTransform(mX, (v: number) => (v + i * step) / step);
  // Map to 3D rotation, translation, scale
  const rotateY = useTransform(offset, (o) => Math.max(-55, Math.min(55, -o * 35)));
  const translateZ = useTransform(offset, (o) => -Math.abs(o) * 140);
  const scale = useTransform(offset, (o) => Math.max(0.78, 1 - Math.abs(o) * 0.12));
  const opacity = useTransform(offset, (o) => Math.max(0.35, 1 - Math.abs(o) * 0.28));

  return (
    <motion.button
      onClick={() => {
        if (isActive && item.image) onZoom();
        else onClick();
      }}
      style={{
        width: cardW,
        height: cardW * 0.52, // Ultra-wide ratio, close to 1898x905
        rotateY,
        z: translateZ,
        scale,
        opacity,
        transformStyle: "preserve-3d",
      }}
      className={`glass relative shrink-0 overflow-hidden rounded-3xl text-left ${isActive && item.image ? 'cursor-zoom-in' : ''}`}
      aria-label={`${item.title} — ${item.caption}`}
    >
      {/* Layered gradient background - Stays visible to frame the image */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 25% 15%, color-mix(in oklab, var(--foreground) 18%, transparent) 0%, transparent 55%),
            radial-gradient(circle at 80% 85%, color-mix(in oklab, var(--foreground) 10%, transparent) 0%, transparent 55%),
            linear-gradient(180deg, color-mix(in oklab, var(--foreground) 4%, transparent), transparent 60%)
          `,
        }}
      />
      <div className="grain absolute inset-0" aria-hidden />

      {/* Image Layer - Smoothly reveals when card is active. Using object-contain so wide screenshots shrink to fit without cropping. */}
      {item.image && (
        <img
          src={encodeURI(item.image)}
          alt={item.title}
          className={`absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-700 ease-in-out ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Content - Fades out when active if there's an image */}
      <div className={`relative z-10 flex h-full flex-col justify-between p-6 md:p-8 transition-opacity duration-700 ${isActive && item.image ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-foreground/60">
          <span>{name}</span>
          <span>{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div
            className="font-display text-7xl font-medium tracking-tighter text-foreground/90 md:text-8xl"
            style={{ transform: "translateZ(40px)" }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
        </div>

        <div style={{ transform: "translateZ(20px)" }}>
          <div className="font-display text-lg tracking-tight md:text-xl">{item.title}</div>
          <div className="mt-1 text-xs text-muted-foreground md:text-sm">{item.caption}</div>
        </div>
      </div>

      {/* Active glow ring */}
      {isActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            boxShadow:
              "inset 0 0 0 1px color-mix(in oklab, var(--foreground) 25%, transparent), 0 30px 80px -30px color-mix(in oklab, var(--foreground) 35%, transparent)",
          }}
        />
      )}
    </motion.button>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
