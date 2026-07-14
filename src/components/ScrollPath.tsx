import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

type Props = {
  targetRef: React.RefObject<HTMLElement | null>;
  count: number;
};

/**
 * A curvy SVG path that snakes behind the project cards and draws itself in
 * as the user scrolls through the section. The head dot is positioned using
 * SVGPathElement.getPointAtLength() so it stays exactly on the path regardless
 * of SVG scaling or viewBox — offsetPath/offsetDistance are NOT used because
 * they operate in CSS pixel space, not SVG user-unit space.
 */
export function ScrollPath({ targetRef, count }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [targetRef]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 85%", "end 15%"],
  });

  // Smooth the raw progress with a spring — kills scroll jitter.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.5,
    restDelta: 0.001,
  });

  const pathLength = useTransform(smooth, [0, 1], [0, 1]);

  // Derive dot cx/cy by walking the path at the current progress fraction.
  // This operates in SVG user-unit space — always correct regardless of scale.
  const dotCx = useTransform(smooth, (v) => {
    const p = pathRef.current;
    if (!p) return 0;
    const len = p.getTotalLength();
    return p.getPointAtLength(v * len).x;
  });

  const dotCy = useTransform(smooth, (v) => {
    const p = pathRef.current;
    if (!p) return 0;
    const len = p.getTotalLength();
    return p.getPointAtLength(v * len).y;
  });

  const { w, h } = size;
  if (!w || !h) {
    return (
      <svg
        ref={svgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    );
  }

  // Build a smooth serpentine path with cubic beziers that weaves left
  // and right across the section. One "swing" per project card.
  const cx = w / 2;
  const amp = Math.min(w * 0.42, 380); // horizontal swing
  const topPad = h * 0.05;
  const bottomPad = h * 0.05;
  const usable = h - topPad - bottomPad;

  const anchors: { x: number; y: number }[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const side = i % 2 === 0 ? -1 : 1;
    anchors.push({
      x: cx + side * amp * (i === 0 || i === count ? 0.35 : 1),
      y: topPad + usable * t,
    });
  }

  let d = `M ${anchors[0].x} ${anchors[0].y}`;
  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];
    const midY = (prev.y + curr.y) / 2;
    // Two control points on the vertical midline — creates a soft S-curve.
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      className="pointer-events-none absolute inset-0"
    >
      <defs>
        <linearGradient id="scroll-path-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0" />
          <stop offset="15%" stopColor="var(--foreground)" stopOpacity="0.55" />
          <stop offset="85%" stopColor="var(--foreground)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
        </linearGradient>
        <filter id="scroll-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Faint static guide — very subtle so drawn line reads clearly */}
      <path
        d={d}
        fill="none"
        stroke="var(--foreground)"
        strokeOpacity="0.06"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* Animated drawn line — ref is used to read getPointAtLength */}
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="url(#scroll-path-grad)"
        strokeWidth={1.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength }}
        filter="url(#scroll-path-glow)"
      />

      {/* Outer glow halo */}
      <motion.circle
        r={12}
        fill="var(--foreground)"
        fillOpacity={0.15}
        cx={dotCx}
        cy={dotCy}
      />

      {/* Solid head dot — positioned by getPointAtLength, always on the path */}
      <motion.circle
        r={5}
        fill="var(--foreground)"
        cx={dotCx}
        cy={dotCy}
      />
    </svg>
  );
}
