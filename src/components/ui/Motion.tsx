"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

// --- FadeIn: fade + slide up when element scrolls into view ---
interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  y?: number;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  y = 24,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- StaggerContainer + StaggerItem: children animate in sequence ---
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
  delay?: number;
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  y?: number;
}

export function StaggerItem({ children, y = 24, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- AnimatedNumber: count-up animation ---
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          function animate(currentTime: number) {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

// --- SlideIn: directional slide + fade when element scrolls into view ---
type Direction = "left" | "right" | "up" | "down";

interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
}

const directionMap: Record<Direction, { x: number; y: number }> = {
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  up: { x: 0, y: -30 },
  down: { x: 0, y: 30 },
};

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  duration = 0.6,
  distance,
  ...props
}: SlideInProps) {
  const d = directionMap[direction];
  const multiplier = distance ? distance / 40 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: d.x * multiplier, y: d.y * multiplier }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- ScaleIn: scale from small + fade when element scrolls into view ---
interface ScaleInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, delay = 0, duration = 0.5, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- Re-export AnimatePresence and motion for convenience ---
export { AnimatePresence, motion };
